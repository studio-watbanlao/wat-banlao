import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import {
  deletePopupBannerImages,
  SupabaseStorageError,
  uploadPopupBannerImage,
} from 'src/lib/supabase-storage';
import { requireTempleContentAccess } from 'src/lib/temple-access';
import type {
  PopupBannerFrequency,
  PopupBannerImagePayload,
  PopupBannerItem,
  PopupBannerStatus,
} from 'src/types/popup-banner';

type PopupBannerRow = {
  id: string;
  title: string;
  image_url: string;
  storage_path?: string;
  link_url?: string;
  display_frequency: PopupBannerFrequency;
  starts_at?: string;
  ends_at?: string;
  sort_order: number;
  status: PopupBannerStatus;
  created_at: string;
  updated_at: string;
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const text = (value: unknown, max = 2000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const normalize = (row: PopupBannerRow): PopupBannerItem => ({
  id: row.id,
  title: row.title,
  imageUrl: row.image_url,
  storagePath: row.storage_path || '',
  linkUrl: row.link_url || '',
  displayFrequency: row.display_frequency,
  startsAt: row.starts_at || '',
  endsAt: row.ends_at || '',
  sortOrder: row.sort_order,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const parseImage = (value: unknown) => {
  if (!value || typeof value !== 'object') return null;
  const image = value as PopupBannerImagePayload;
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

const dateValue = (value: unknown) => {
  const raw = text(value, 50);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw Object.assign(new Error('รูปแบบวันเวลาไม่ถูกต้อง'), { status: 400 });
  }
  return date.toISOString();
};

const frequencyValue = (value: unknown): PopupBannerFrequency =>
  value === 'EVERY_VISIT' || value === 'ONCE_PER_DAY' ? value : 'ONCE_PER_SESSION';

const statusValue = (value: unknown): PopupBannerStatus =>
  value === 'PUBLIC' ? 'PUBLIC' : 'DRAFT';

const getRows = (templeId: string, id?: string) => {
  const query = new URLSearchParams({ select: '*', temple_id: `eq.${templeId}` });
  if (id) query.set('id', `eq.${id}`);
  else query.set('order', 'sort_order.asc,created_at.desc');
  return supabaseRequest<PopupBannerRow[]>(`popup_banners?${query}`);
};

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = await resolveSessionUser(req, res);
    if (!requester) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const { temple } = await requireTempleContentAccess(req, requester, 'banners');
    const templeId = temple.id;

    if (req.method === 'GET') {
      const rows = await getRows(templeId);
      return res.status(200).json({ popupBanners: rows.map(normalize) });
    }

    if (req.method === 'POST') {
      const title = text(req.body?.title, 200);
      const image = parseImage(req.body?.image);
      if (!title || !image) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อและเลือกรูป Popup Banner' });
      }
      const startsAt = dateValue(req.body?.startsAt);
      const endsAt = dateValue(req.body?.endsAt);
      if (startsAt && endsAt && startsAt > endsAt) {
        return res.status(400).json({ message: 'วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น' });
      }
      const id = randomUUID();
      const storagePath = `${templeId}/${id}/popup-${Date.now()}.${image.extension}`;
      const imageUrl = await uploadPopupBannerImage(storagePath, image.buffer, image.contentType);
      const rows = await supabaseRequest<PopupBannerRow[]>('popup_banners', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          id,
          temple_id: templeId,
          title,
          image_url: imageUrl,
          storage_path: storagePath,
          link_url: text(req.body?.linkUrl),
          display_frequency: frequencyValue(req.body?.displayFrequency),
          starts_at: startsAt,
          ends_at: endsAt,
          sort_order: Math.min(Math.max(Number(req.body?.sortOrder) || 0, 0), 9999),
          status: statusValue(req.body?.status),
        }),
      });
      return res.status(201).json({ popupBanner: normalize(rows[0]) });
    }

    if (req.method === 'PATCH') {
      const id = text(req.body?.id, 64);
      const existingRows = id ? await getRows(templeId, id) : [];
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: 'ไม่พบ Popup Banner' });

      const title = text(req.body?.title, 200);
      const startsAt = dateValue(req.body?.startsAt);
      const endsAt = dateValue(req.body?.endsAt);
      if (!title || (startsAt && endsAt && startsAt > endsAt)) {
        return res.status(400).json({ message: 'ข้อมูล Popup Banner ไม่ถูกต้อง' });
      }

      const image = parseImage(req.body?.image);
      let imageUrl = existing.image_url;
      let storagePath = existing.storage_path || '';
      if (image) {
        const nextPath = `${templeId}/${id}/popup-${Date.now()}.${image.extension}`;
        imageUrl = await uploadPopupBannerImage(nextPath, image.buffer, image.contentType);
        storagePath = nextPath;
      }

      const rows = await supabaseRequest<PopupBannerRow[]>(
        `popup_banners?id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            title,
            image_url: imageUrl,
            storage_path: storagePath,
            link_url: text(req.body?.linkUrl),
            display_frequency: frequencyValue(req.body?.displayFrequency),
            starts_at: startsAt,
            ends_at: endsAt,
            sort_order: Math.min(Math.max(Number(req.body?.sortOrder) || 0, 0), 9999),
            status: statusValue(req.body?.status),
          }),
        }
      );
      if (image && existing.storage_path && existing.storage_path !== storagePath) {
        await deletePopupBannerImages([existing.storage_path]).catch((error) =>
          console.error('[api/admin/popup-banners] clean replaced image', error)
        );
      }
      return res.status(200).json({ popupBanner: normalize(rows[0]) });
    }

    if (req.method === 'DELETE') {
      const id = text(req.query.id, 64);
      const existingRows = id ? await getRows(templeId, id) : [];
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: 'ไม่พบ Popup Banner' });
      await supabaseRequest(
        `popup_banners?id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
        { method: 'DELETE' }
      );
      if (existing.storage_path) {
        await deletePopupBannerImages([existing.storage_path]).catch((error) =>
          console.error('[api/admin/popup-banners] clean deleted image', error)
        );
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/popup-banners]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
