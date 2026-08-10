import { randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSafeApiError } from 'src/lib/api-error';

import { isAdminUser, resolveSessionUser, SupabaseAuthError } from 'src/lib/supabase-auth';
import {
  createAdminContent,
  deleteAdminContent,
  getAdminContent,
  SupabaseRequestError,
  updateAdminContent,
  type ContentStatus,
} from 'src/lib/supabase-rest';
import {
  deleteSacredImages,
  SupabaseStorageError,
  uploadSacredImage,
} from 'src/lib/supabase-storage';
import type { SacredGalleryImage, SacredImagePayload, SacredItem } from 'src/types/sacred';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
type ParsedImage = { buffer: Buffer; contentType: string; extension: string };

const getText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const isStatus = (value: unknown): value is ContentStatus =>
  value === 'DRAFT' || value === 'PUBLIC';

const parseImage = (value: unknown): ParsedImage | null => {
  if (!value || typeof value !== 'object') return null;
  const image = value as SacredImagePayload;
  if (!ALLOWED_IMAGE_TYPES.includes(image.type) || typeof image.base64 !== 'string') {
    throw new SupabaseStorageError('รองรับเฉพาะไฟล์ JPG, PNG และ WebP', 400);
  }
  const buffer = Buffer.from(image.base64, 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new SupabaseStorageError('รูปภาพแต่ละไฟล์ต้องมีขนาดไม่เกิน 8 MB', 400);
  }
  const extension =
    image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  return { buffer, contentType: image.type, extension };
};

const parseGallery = (value: SacredItem['images']): SacredGalleryImage[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getSacredData = (value: Record<string, unknown>) => {
  const images =
    typeof value.images === 'string' ? value.images : JSON.stringify(value.images || []);
  return {
    title: getText(value.title),
    year: getText(value.year),
    description: getText(value.description),
    imageUrl: getText(value.imageUrl),
    coverStoragePath: getText(value.coverStoragePath),
    images: images === '[]' ? '' : images,
    content: getText(value.content),
    createdDate: getText(value.createdDate) || new Date().toISOString(),
  };
};

const parseNewGallery = (value: unknown, limit: number): ParsedImage[] =>
  Array.isArray(value)
    ? value
        .slice(0, limit)
        .map(parseImage)
        .filter((image: ParsedImage | null): image is ParsedImage => Boolean(image))
    : [];

const uploadGallery = (id: string, images: ParsedImage[]) =>
  Promise.all(
    images.map(async (image, index) => {
      const stamp = Date.now();
      const storagePath = `${id}/gallery-${stamp}-${index}.${image.extension}`;
      return {
        src: `${id}-${stamp}-${index}`,
        image: await uploadSacredImage(storagePath, image.buffer, image.contentType),
        storagePath,
      };
    })
  );

export const config = { api: { bodyParser: { sizeLimit: '64mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = await resolveSessionUser(req, res);
    if (!requester) return res.status(401).json({ message: 'Authentication required.' });
    if (!isAdminUser(requester)) {
      return res.status(403).json({ message: 'Admin permission is required.' });
    }

    if (req.method === 'GET') {
      const items = await getAdminContent<SacredItem>('sacred');
      items.sort((a, b) => Number(b.year) - Number(a.year));
      return res.status(200).json({ items });
    }

    if (req.method === 'POST') {
      const status = req.body?.status;
      const cover = parseImage(req.body?.coverImage);
      if (!getText(req.body?.title) || !isStatus(status) || !cover) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อ สถานะ และเลือกรูปหน้าปก' });
      }
      const id = randomUUID();
      const coverStoragePath = `${id}/cover-${Date.now()}.${cover.extension}`;
      const imageUrl = await uploadSacredImage(coverStoragePath, cover.buffer, cover.contentType);
      const images = await uploadGallery(id, parseNewGallery(req.body?.galleryImages, 8));
      const data = getSacredData({ ...req.body, imageUrl, coverStoragePath, images });
      const item = await createAdminContent('sacred', id, status, data);
      return res.status(201).json({ item });
    }

    if (req.method === 'PATCH') {
      const id = getText(req.body?.id);
      const status = req.body?.status;
      if (!id || !isStatus(status)) return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง' });
      const existing = await getAdminContent<SacredItem>('sacred', id);
      if (!existing) return res.status(404).json({ message: 'ไม่พบวัตถุมงคล' });

      const data = getSacredData({ ...existing, ...req.body });
      const deletePaths: string[] = [];
      const cover = parseImage(req.body?.coverImage);
      if (cover) {
        const path = `${id}/cover-${Date.now()}.${cover.extension}`;
        data.imageUrl = await uploadSacredImage(path, cover.buffer, cover.contentType);
        if (data.coverStoragePath) deletePaths.push(data.coverStoragePath);
        data.coverStoragePath = path;
      }

      const currentGallery = parseGallery(existing.images);
      const keptSources = Array.isArray(req.body?.keptGallerySources)
        ? req.body.keptGallerySources.filter((src: unknown) => typeof src === 'string')
        : currentGallery.map((image) => image.src);
      const kept = currentGallery.filter((image) => keptSources.includes(image.src));
      currentGallery
        .filter((image) => !keptSources.includes(image.src) && image.storagePath)
        .forEach((image) => deletePaths.push(image.storagePath as string));
      const added = await uploadGallery(
        id,
        parseNewGallery(req.body?.galleryImages, Math.max(0, 8 - kept.length))
      );
      const nextGallery = [...kept, ...added];
      data.images = nextGallery.length ? JSON.stringify(nextGallery) : '';
      if (!data.title || !data.imageUrl) {
        return res.status(400).json({ message: 'ข้อมูลวัตถุมงคลไม่ครบถ้วน' });
      }
      const item = await updateAdminContent('sacred', id, status, data);
      if (!item) return res.status(404).json({ message: 'ไม่พบวัตถุมงคล' });
      await deleteSacredImages(deletePaths).catch((error) =>
        console.error('[api/admin/sacred] clean replaced images', error)
      );
      return res.status(200).json({ item });
    }

    if (req.method === 'DELETE') {
      const id = getText(req.query.id);
      if (!id) return res.status(400).json({ message: 'Sacred ID is required.' });
      const existing = await getAdminContent<SacredItem>('sacred', id);
      if (!existing) return res.status(404).json({ message: 'ไม่พบวัตถุมงคล' });
      await deleteAdminContent('sacred', id);
      const paths = [
        existing.coverStoragePath,
        ...parseGallery(existing.images).map((image) => image.storagePath),
      ].filter(Boolean) as string[];
      await deleteSacredImages(paths).catch((error) =>
        console.error('[api/admin/sacred] clean deleted images', error)
      );
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/sacred]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
