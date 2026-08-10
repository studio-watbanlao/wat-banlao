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
  deleteBannerImages,
  SupabaseStorageError,
  uploadBannerImage,
} from 'src/lib/supabase-storage';
import type { BannerImagePayload, BannerItem } from 'src/types/banner';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const isStatus = (value: unknown): value is ContentStatus =>
  value === 'DRAFT' || value === 'PUBLIC';

const parseImage = (value: unknown) => {
  if (!value || typeof value !== 'object') return null;
  const image = value as BannerImagePayload;
  if (!ALLOWED_IMAGE_TYPES.includes(image.type) || typeof image.base64 !== 'string') {
    throw new SupabaseStorageError('รองรับเฉพาะไฟล์ JPG, PNG และ WebP', 400);
  }

  const buffer = Buffer.from(image.base64, 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw new SupabaseStorageError('รูปภาพต้องมีขนาดไม่เกิน 8 MB', 400);
  }

  const extension =
    image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  return { buffer, contentType: image.type, extension };
};

const getText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const getBannerData = (value: Record<string, unknown>) => ({
  title: getText(value.title),
  desktopImageUrl: getText(value.desktopImageUrl),
  mobileImageUrl: getText(value.mobileImageUrl),
  desktopStoragePath: getText(value.desktopStoragePath),
  mobileStoragePath: getText(value.mobileStoragePath),
  linkUrl: getText(value.linkUrl),
  sortOrder: Number.isFinite(Number(value.sortOrder)) ? Number(value.sortOrder) : 0,
});

export const config = {
  api: { bodyParser: { sizeLimit: '24mb' } },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = await resolveSessionUser(req, res);
    if (!requester) return res.status(401).json({ message: 'Authentication required.' });
    if (!isAdminUser(requester)) {
      return res.status(403).json({ message: 'Admin permission is required.' });
    }

    if (req.method === 'GET') {
      const banners = await getAdminContent<BannerItem>('banner');
      banners.sort((a, b) => a.sortOrder - b.sortOrder);
      return res.status(200).json({ banners });
    }

    if (req.method === 'POST') {
      const title = getText(req.body?.title);
      const status = req.body?.status;
      const desktopImage = parseImage(req.body?.desktopImage);
      const mobileImage = parseImage(req.body?.mobileImage);

      if (!title || !isStatus(status) || !desktopImage || !mobileImage) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อและเลือกรูป Desktop/Mobile ให้ครบ' });
      }

      const id = randomUUID();
      const desktopStoragePath = `${id}/desktop-${Date.now()}.${desktopImage.extension}`;
      const mobileStoragePath = `${id}/mobile-${Date.now()}.${mobileImage.extension}`;
      const [desktopImageUrl, mobileImageUrl] = await Promise.all([
        uploadBannerImage(desktopStoragePath, desktopImage.buffer, desktopImage.contentType),
        uploadBannerImage(mobileStoragePath, mobileImage.buffer, mobileImage.contentType),
      ]);
      const data = {
        title,
        desktopImageUrl,
        mobileImageUrl,
        desktopStoragePath,
        mobileStoragePath,
        linkUrl: getText(req.body?.linkUrl),
        sortOrder: Number(req.body?.sortOrder) || 0,
      };
      const banner = await createAdminContent('banner', id, status, data);
      return res.status(201).json({ banner });
    }

    if (req.method === 'PATCH') {
      const id = getText(req.body?.id);
      const status = req.body?.status;
      if (!id || !isStatus(status)) {
        return res.status(400).json({ message: 'ข้อมูล Banner ไม่ถูกต้อง' });
      }

      const existing = await getAdminContent<BannerItem>('banner', id);
      if (!existing) return res.status(404).json({ message: 'ไม่พบ Banner' });

      const desktopImage = parseImage(req.body?.desktopImage);
      const mobileImage = parseImage(req.body?.mobileImage);
      const data = getBannerData({ ...existing, ...req.body });
      const replacedPaths: string[] = [];

      if (desktopImage) {
        const path = `${id}/desktop-${Date.now()}.${desktopImage.extension}`;
        data.desktopImageUrl = await uploadBannerImage(
          path,
          desktopImage.buffer,
          desktopImage.contentType
        );
        if (data.desktopStoragePath) replacedPaths.push(data.desktopStoragePath);
        data.desktopStoragePath = path;
      }

      if (mobileImage) {
        const path = `${id}/mobile-${Date.now()}.${mobileImage.extension}`;
        data.mobileImageUrl = await uploadBannerImage(
          path,
          mobileImage.buffer,
          mobileImage.contentType
        );
        if (data.mobileStoragePath) replacedPaths.push(data.mobileStoragePath);
        data.mobileStoragePath = path;
      }

      if (!data.title || !data.desktopImageUrl || !data.mobileImageUrl) {
        return res.status(400).json({ message: 'ข้อมูล Banner ไม่ครบถ้วน' });
      }

      const banner = await updateAdminContent('banner', id, status, data);
      if (!banner) return res.status(404).json({ message: 'ไม่พบ Banner' });
      await deleteBannerImages(replacedPaths).catch((error) =>
        console.error('[api/admin/banners] clean replaced images', error)
      );
      return res.status(200).json({ banner });
    }

    if (req.method === 'DELETE') {
      const id = getText(req.query.id);
      if (!id) return res.status(400).json({ message: 'Banner ID is required.' });
      const existing = await getAdminContent<BannerItem>('banner', id);
      if (!existing) return res.status(404).json({ message: 'ไม่พบ Banner' });

      await deleteAdminContent('banner', id);
      await deleteBannerImages(
        [existing.desktopStoragePath, existing.mobileStoragePath].filter(Boolean) as string[]
      ).catch((error) => console.error('[api/admin/banners] clean deleted images', error));
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/banners]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
