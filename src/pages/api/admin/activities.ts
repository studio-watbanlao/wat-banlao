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
  deleteActivityImages,
  SupabaseStorageError,
  uploadActivityImage,
} from 'src/lib/supabase-storage';
import type {
  ActivityGalleryImage,
  ActivityContentType,
  ActivityImagePayload,
  ActivityItem,
  ActivityType,
} from 'src/types/activity';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACTIVITY_TYPES: ActivityType[] = ['temple', 'community', 'school'];
const CONTENT_TYPES: ActivityContentType[] = ['activity', 'news'];
type ParsedImage = { buffer: Buffer; contentType: string; extension: string };

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const isStatus = (value: unknown): value is ContentStatus =>
  value === 'DRAFT' || value === 'PUBLIC';
const isActivityType = (value: unknown): value is ActivityType =>
  ACTIVITY_TYPES.includes(value as ActivityType);
const isContentType = (value: unknown): value is ActivityContentType =>
  CONTENT_TYPES.includes(value as ActivityContentType);

const parseImage = (value: unknown): ParsedImage | null => {
  if (!value || typeof value !== 'object') return null;
  const image = value as ActivityImagePayload;
  if (!IMAGE_TYPES.includes(image.type) || typeof image.base64 !== 'string') {
    throw new SupabaseStorageError('รองรับเฉพาะไฟล์ JPG, PNG และ WebP', 400);
  }
  const buffer = Buffer.from(image.base64, 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    throw new SupabaseStorageError('รูปภาพแต่ละไฟล์ต้องมีขนาดไม่เกิน 8 MB', 400);
  }
  const extension =
    image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  return { buffer, contentType: image.type, extension };
};

const gallery = (value: ActivityItem['images']): ActivityGalleryImage[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const newImages = (value: unknown, limit: number): ParsedImage[] =>
  Array.isArray(value)
    ? value
        .slice(0, limit)
        .map(parseImage)
        .filter((image: ParsedImage | null): image is ParsedImage => Boolean(image))
    : [];

const uploadGallery = (id: string, files: ParsedImage[]) =>
  Promise.all(
    files.map(async (file, index) => {
      const stamp = Date.now();
      const storagePath = `${id}/gallery-${stamp}-${index}.${file.extension}`;
      return {
        src: `${id}-${stamp}-${index}`,
        image: await uploadActivityImage(storagePath, file.buffer, file.contentType),
        storagePath,
      };
    })
  );

const activityData = (value: Record<string, unknown>) => {
  const images =
    typeof value.images === 'string' ? value.images : JSON.stringify(value.images || []);
  return {
    title: text(value.title),
    contentType: isContentType(value.contentType) ? value.contentType : 'activity',
    type: isActivityType(value.type) ? value.type : 'temple',
    description: text(value.description),
    imageUrl: text(value.imageUrl),
    coverStoragePath: text(value.coverStoragePath),
    images: images === '[]' ? '' : images,
    content: text(value.content),
    createdDate: text(value.createdDate) || new Date().toISOString(),
  };
};

export const config = { api: { bodyParser: { sizeLimit: '64mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'Authentication required.' });
    const access = await requireTempleContentAccess(req, user, 'activities');
    const { temple } = access;
    const templeId = temple.id;
    const ownerId = contributorOwnerId(access, user);

    if (req.method === 'GET') {
      const activities = await getAdminContent<ActivityItem>(
        'activity',
        templeId,
        undefined,
        ownerId
      );
      return res.status(200).json({ activities });
    }

    if (req.method === 'POST') {
      const status = req.body?.status;
      enforceContributorDraft(access, status);
      const cover = parseImage(req.body?.coverImage);
      if (
        !text(req.body?.title) ||
        !isStatus(status) ||
        !isContentType(req.body?.contentType) ||
        !isActivityType(req.body?.type) ||
        !cover
      ) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อ ประเภท สถานะ และเลือกรูปหน้าปก' });
      }
      const id = randomUUID();
      const coverStoragePath = `${templeId}/${id}/cover-${Date.now()}.${cover.extension}`;
      const imageUrl = await uploadActivityImage(coverStoragePath, cover.buffer, cover.contentType);
      const images = await uploadGallery(
        `${templeId}/${id}`,
        newImages(req.body?.galleryImages, 8)
      );
      const data = activityData({ ...req.body, imageUrl, coverStoragePath, images });
      const activity = await createAdminContent('activity', templeId, id, status, data, user.id);
      return res.status(201).json({ activity });
    }

    if (req.method === 'PATCH') {
      const id = text(req.body?.id);
      const status = req.body?.status;
      enforceContributorDraft(access, status);
      if (
        !id ||
        !isStatus(status) ||
        !isContentType(req.body?.contentType) ||
        !isActivityType(req.body?.type)
      ) {
        return res.status(400).json({ message: 'ข้อมูลกิจกรรมไม่ถูกต้อง' });
      }
      const existing = await getAdminContent<ActivityItem>('activity', templeId, id, ownerId);
      if (!existing) return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
      const data = activityData({ ...existing, ...req.body });
      const deletePaths: string[] = [];
      const cover = parseImage(req.body?.coverImage);
      if (cover) {
        const path = `${templeId}/${id}/cover-${Date.now()}.${cover.extension}`;
        data.imageUrl = await uploadActivityImage(path, cover.buffer, cover.contentType);
        if (data.coverStoragePath) deletePaths.push(data.coverStoragePath);
        data.coverStoragePath = path;
      }
      const current = gallery(existing.images);
      const keptSources = Array.isArray(req.body?.keptGallerySources)
        ? req.body.keptGallerySources.filter((src: unknown) => typeof src === 'string')
        : current.map((image) => image.src);
      const kept = current.filter((image) => keptSources.includes(image.src));
      current
        .filter((image) => !keptSources.includes(image.src) && image.storagePath)
        .forEach((image) => deletePaths.push(image.storagePath as string));
      const added = await uploadGallery(
        `${templeId}/${id}`,
        newImages(req.body?.galleryImages, Math.max(0, 8 - kept.length))
      );
      const next = [...kept, ...added];
      data.images = next.length ? JSON.stringify(next) : '';
      if (!data.title || !data.imageUrl)
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
      const activity = await updateAdminContent('activity', templeId, id, status, data);
      await deleteActivityImages(deletePaths).catch((error) =>
        console.error('[api/admin/activities] clean images', error)
      );
      return res.status(200).json({ activity });
    }

    if (req.method === 'DELETE') {
      const id = text(req.query.id);
      if (!id) return res.status(400).json({ message: 'Activity ID is required.' });
      const existing = await getAdminContent<ActivityItem>('activity', templeId, id);
      if (!existing) return res.status(404).json({ message: 'ไม่พบกิจกรรม' });
      await deleteAdminContent('activity', templeId, id);
      const paths = [
        existing.coverStoragePath,
        ...gallery(existing.images).map((image) => image.storagePath),
      ].filter(Boolean) as string[];
      await deleteActivityImages(paths).catch((error) =>
        console.error('[api/admin/activities] clean deleted images', error)
      );
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/activities]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
