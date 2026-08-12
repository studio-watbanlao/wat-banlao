import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import {
  contributorOwnerId,
  enforceContributorDraft,
  requireTempleContentAccess,
} from 'src/lib/temple-access';
import {
  createAdminContent,
  deleteAdminContent,
  getAdminContent,
  updateAdminContent,
  type ContentStatus,
} from 'src/lib/supabase-rest';
import {
  deleteFestivalImages,
  SupabaseStorageError,
  uploadFestivalImage,
} from 'src/lib/supabase-storage';
import type { FestivalGalleryImage, FestivalImagePayload, FestivalItem } from 'src/types/festival';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type ParsedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

const isStatus = (value: unknown): value is ContentStatus =>
  value === 'DRAFT' || value === 'PUBLIC';

const getText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const parseImage = (value: unknown): ParsedImage | null => {
  if (!value || typeof value !== 'object') return null;
  const image = value as FestivalImagePayload;
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

const parseGallery = (value: FestivalItem['images']): FestivalGalleryImage[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const getFestivalData = (value: Record<string, unknown>) => {
  const images =
    typeof value.images === 'string' ? value.images : JSON.stringify(value.images || []);
  return {
    title: getText(value.title),
    year: getText(value.year),
    no: getText(value.no),
    description: getText(value.description),
    imageUrl: getText(value.imageUrl),
    coverStoragePath: getText(value.coverStoragePath),
    images: images === '[]' ? '' : images,
    content: getText(value.content),
    videoUrl: getText(value.videoUrl),
    openingUrl: getText(value.openingUrl),
    logoUrl: getText(value.logoUrl),
    createdDate: getText(value.createdDate) || new Date().toISOString(),
  };
};

export const config = { api: { bodyParser: { sizeLimit: '64mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = await resolveSessionUser(req, res);
    if (!requester) return res.status(401).json({ message: 'Authentication required.' });
    const access = await requireTempleContentAccess(req, requester, 'festivals');
    const { temple } = access;
    const templeId = temple.id;
    const ownerId = contributorOwnerId(access, requester);

    if (req.method === 'GET') {
      const festivals = await getAdminContent<FestivalItem>(
        'fastival',
        templeId,
        undefined,
        ownerId
      );
      festivals.sort((a, b) => Number(b.year) - Number(a.year));
      return res.status(200).json({ festivals });
    }

    if (req.method === 'POST') {
      const status = req.body?.status;
      enforceContributorDraft(access, status);
      const cover = parseImage(req.body?.coverImage);
      if (!getText(req.body?.title) || !getText(req.body?.year) || !isStatus(status) || !cover) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อ ปี สถานะ และเลือกรูปหน้าปก' });
      }

      const id = randomUUID();
      const coverStoragePath = `${templeId}/${id}/cover-${Date.now()}.${cover.extension}`;
      const imageUrl = await uploadFestivalImage(coverStoragePath, cover.buffer, cover.contentType);
      const galleryPayloads: ParsedImage[] = Array.isArray(req.body?.galleryImages)
        ? req.body.galleryImages
            .slice(0, 8)
            .map(parseImage)
            .filter((image: ParsedImage | null): image is ParsedImage => Boolean(image))
        : [];
      const images = await Promise.all(
        galleryPayloads.map(async (image, index) => {
          if (!image) throw new SupabaseStorageError('ไฟล์ Gallery ไม่ถูกต้อง', 400);
          const storagePath = `${templeId}/${id}/gallery-${Date.now()}-${index}.${image.extension}`;
          return {
            src: `${id}-${index}`,
            image: await uploadFestivalImage(storagePath, image.buffer, image.contentType),
            storagePath,
          };
        })
      );
      const data = getFestivalData({ ...req.body, imageUrl, coverStoragePath, images });
      const festival = await createAdminContent(
        'fastival',
        templeId,
        id,
        status,
        data,
        requester.id
      );
      return res.status(201).json({ festival });
    }

    if (req.method === 'PATCH') {
      const id = getText(req.body?.id);
      const status = req.body?.status;
      enforceContributorDraft(access, status);
      if (!id || !isStatus(status)) {
        return res.status(400).json({ message: 'ข้อมูล Festival ไม่ถูกต้อง' });
      }
      const existing = await getAdminContent<FestivalItem>('fastival', templeId, id, ownerId);
      if (!existing) return res.status(404).json({ message: 'ไม่พบ Festival' });

      const data = getFestivalData({ ...existing, ...req.body });
      const replacedPaths: string[] = [];
      const cover = parseImage(req.body?.coverImage);
      if (cover) {
        const path = `${templeId}/${id}/cover-${Date.now()}.${cover.extension}`;
        data.imageUrl = await uploadFestivalImage(path, cover.buffer, cover.contentType);
        if (data.coverStoragePath) replacedPaths.push(data.coverStoragePath);
        data.coverStoragePath = path;
      }

      const currentGallery = parseGallery(existing.images);
      const keptGallerySources = Array.isArray(req.body?.keptGallerySources)
        ? req.body.keptGallerySources.filter((src: unknown) => typeof src === 'string')
        : null;
      const removedPaths = Array.isArray(req.body?.removedGalleryPaths)
        ? req.body.removedGalleryPaths.filter((path: unknown) => typeof path === 'string')
        : [];
      const keptGallery = currentGallery.filter((image) =>
        keptGallerySources
          ? keptGallerySources.includes(image.src)
          : !image.storagePath || !removedPaths.includes(image.storagePath)
      );
      const galleryPayloads: ParsedImage[] = Array.isArray(req.body?.galleryImages)
        ? req.body.galleryImages
            .slice(0, Math.max(0, 8 - keptGallery.length))
            .map(parseImage)
            .filter((image: ParsedImage | null): image is ParsedImage => Boolean(image))
        : [];
      const addedGallery = await Promise.all(
        galleryPayloads.map(async (image, index) => {
          if (!image) throw new SupabaseStorageError('ไฟล์ Gallery ไม่ถูกต้อง', 400);
          const storagePath = `${templeId}/${id}/gallery-${Date.now()}-${index}.${image.extension}`;
          return {
            src: `${id}-${Date.now()}-${index}`,
            image: await uploadFestivalImage(storagePath, image.buffer, image.contentType),
            storagePath,
          };
        })
      );
      const nextGallery = [...keptGallery, ...addedGallery];
      data.images = nextGallery.length ? JSON.stringify(nextGallery) : '';

      if (!data.title || !data.year || !data.imageUrl) {
        return res.status(400).json({ message: 'ข้อมูล Festival ไม่ครบถ้วน' });
      }
      const festival = await updateAdminContent('fastival', templeId, id, status, data);
      if (!festival) return res.status(404).json({ message: 'ไม่พบ Festival' });
      await deleteFestivalImages([...replacedPaths, ...removedPaths]).catch((error) =>
        console.error('[api/admin/festivals] clean replaced images', error)
      );
      return res.status(200).json({ festival });
    }

    if (req.method === 'DELETE') {
      const id = getText(req.query.id);
      if (!id) return res.status(400).json({ message: 'Festival ID is required.' });
      const existing = await getAdminContent<FestivalItem>('fastival', templeId, id);
      if (!existing) return res.status(404).json({ message: 'ไม่พบ Festival' });

      await deleteAdminContent('fastival', templeId, id);
      const paths = [
        existing.coverStoragePath,
        ...parseGallery(existing.images).map((image) => image.storagePath),
      ].filter(Boolean) as string[];
      await deleteFestivalImages(paths).catch((error) =>
        console.error('[api/admin/festivals] clean deleted images', error)
      );
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/festivals]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
