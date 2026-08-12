import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import {
  deleteCommunityLeaderImages,
  SupabaseStorageError,
  uploadCommunityLeaderImage,
} from 'src/lib/supabase-storage';
import { requireTempleContentAccess } from 'src/lib/temple-access';
import {
  COMMUNITY_LEADER_GROUPS,
  COMMUNITY_VILLAGES,
  type CommunityLeader,
  type CommunityLeaderGroup,
  type CommunityLeaderImagePayload,
  type CommunityLeaderStatus,
  type CommunityVillageKey,
} from 'src/types/community-leader';

type LeaderRow = {
  id: string;
  village_key: CommunityVillageKey;
  full_name: string;
  role: string;
  responsibility?: string;
  phone?: string;
  leader_group: CommunityLeaderGroup;
  image_url: string;
  image_storage_path?: string;
  sort_order?: number;
  status: CommunityLeaderStatus;
  created_at: string;
  updated_at?: string;
};

type ParsedImage = { buffer: Buffer; contentType: string; extension: string };

const text = (value: unknown, maximum = 1000) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : '';

const isVillageKey = (value: unknown): value is CommunityVillageKey =>
  COMMUNITY_VILLAGES.some((item) => item.key === value);

const isGroup = (value: unknown): value is CommunityLeaderGroup =>
  COMMUNITY_LEADER_GROUPS.some((item) => item.value === value);

const isStatus = (value: unknown): value is CommunityLeaderStatus =>
  value === 'DRAFT' || value === 'PUBLIC';

const parseImage = (value: unknown): ParsedImage | null => {
  if (!value || typeof value !== 'object') return null;
  const image = value as CommunityLeaderImagePayload;
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
    throw new SupabaseStorageError('รองรับเฉพาะไฟล์ JPG, PNG และ WebP', 400);
  }
  const buffer = Buffer.from(image.base64 || '', 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    throw new SupabaseStorageError('รูปภาพต้องมีขนาดไม่เกิน 8 MB', 400);
  }
  const extension =
    image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  return { buffer, contentType: image.type, extension };
};

export const normalizeCommunityLeader = (row: LeaderRow): CommunityLeader => ({
  id: row.id,
  villageKey: row.village_key,
  villageName:
    COMMUNITY_VILLAGES.find((village) => village.key === row.village_key)?.name || row.village_key,
  fullName: row.full_name,
  role: row.role,
  responsibility: row.responsibility || '',
  phone: row.phone || '',
  imageUrl: row.image_url,
  imageStoragePath: row.image_storage_path || '',
  group: row.leader_group,
  sortOrder: row.sort_order || 0,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const rowData = (value: Record<string, unknown>) => ({
  village_key: value.villageKey,
  full_name: text(value.fullName, 200),
  role: text(value.role, 200),
  responsibility: text(value.responsibility) || null,
  phone: text(value.phone, 30) || null,
  leader_group: value.group,
  sort_order: Math.min(Math.max(Number(value.sortOrder) || 0, 0), 9999),
});

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const access = await requireTempleContentAccess(req, user, 'community_leaders');
    if (access.role !== 'super_admin' && access.role !== 'temple_admin') {
      return res
        .status(403)
        .json({ message: 'เฉพาะผู้ดูแลระบบและผู้ดูแลวัดเท่านั้นที่จัดการผู้นำชุมชนได้' });
    }
    const templeId = access.temple.id;

    if (req.method === 'GET') {
      const id = text(req.query.id, 64);
      const query = new URLSearchParams({
        select: '*',
        temple_id: `eq.${templeId}`,
        order: 'village_key.asc,sort_order.asc,created_at.desc',
      });
      if (id) query.set('id', `eq.${id}`);
      const rows = await supabaseRequest<LeaderRow[]>(`community_leaders?${query}`);
      return res.status(200).json({ leaders: rows.map(normalizeCommunityLeader) });
    }

    if (req.method === 'POST') {
      const { villageKey, group, status } = req.body || {};
      const image = parseImage(req.body?.profileImage);
      const fullName = text(req.body?.fullName, 200);
      const role = text(req.body?.role, 200);
      if (
        !fullName ||
        !role ||
        !isVillageKey(villageKey) ||
        !isGroup(group) ||
        !isStatus(status) ||
        !image
      ) {
        return res
          .status(400)
          .json({ message: 'กรุณากรอกข้อมูลผู้นำ หมู่บ้าน ตำแหน่ง สถานะ และรูปภาพให้ครบ' });
      }
      const id = randomUUID();
      const imageStoragePath = `${templeId}/${id}/profile-${Date.now()}.${image.extension}`;
      const imageUrl = await uploadCommunityLeaderImage(
        imageStoragePath,
        image.buffer,
        image.contentType
      );
      const rows = await supabaseRequest<LeaderRow[]>('community_leaders', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          id,
          temple_id: templeId,
          created_by: user.id,
          status,
          image_url: imageUrl,
          image_storage_path: imageStoragePath,
          ...rowData(req.body),
        }),
      });
      return res.status(201).json({ leader: normalizeCommunityLeader(rows[0]) });
    }

    if (req.method === 'PATCH') {
      const id = text(req.body?.id, 64);
      const { villageKey, group, status } = req.body || {};
      if (!id || !isVillageKey(villageKey) || !isGroup(group) || !isStatus(status)) {
        return res.status(400).json({ message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' });
      }
      const rows = await supabaseRequest<LeaderRow[]>(
        `community_leaders?select=*&id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}&limit=1`
      );
      const existing = rows[0];
      if (!existing) return res.status(404).json({ message: 'ไม่พบข้อมูลผู้นำชุมชน' });

      const image = parseImage(req.body?.profileImage);
      let imageUrl = existing.image_url;
      let imageStoragePath = existing.image_storage_path || '';
      if (image) {
        imageStoragePath = `${templeId}/${id}/profile-${Date.now()}.${image.extension}`;
        imageUrl = await uploadCommunityLeaderImage(
          imageStoragePath,
          image.buffer,
          image.contentType
        );
      }
      const data = rowData(req.body);
      if (!data.full_name || !data.role || !imageUrl) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อ ตำแหน่ง และเลือกรูปผู้นำ' });
      }
      const updatedRows = await supabaseRequest<LeaderRow[]>(
        `community_leaders?id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({
            ...data,
            status,
            image_url: imageUrl,
            image_storage_path: imageStoragePath,
          }),
        }
      );
      if (image && existing.image_storage_path) {
        await deleteCommunityLeaderImages([existing.image_storage_path]).catch((error) =>
          console.error('[api/admin/community-leaders] clean previous image', error)
        );
      }
      return res.status(200).json({ leader: normalizeCommunityLeader(updatedRows[0]) });
    }

    if (req.method === 'DELETE') {
      const id = text(req.query.id, 64);
      if (!id) return res.status(400).json({ message: 'ไม่พบรหัสข้อมูลที่ต้องการลบ' });
      const rows = await supabaseRequest<LeaderRow[]>(
        `community_leaders?select=*&id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}&limit=1`
      );
      const existing = rows[0];
      if (!existing) return res.status(404).json({ message: 'ไม่พบข้อมูลผู้นำชุมชน' });
      await supabaseRequest(
        `community_leaders?id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
        { method: 'DELETE' }
      );
      if (existing.image_storage_path) {
        await deleteCommunityLeaderImages([existing.image_storage_path]).catch((error) =>
          console.error('[api/admin/community-leaders] clean image', error)
        );
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'ไม่รองรับคำสั่งนี้' });
  } catch (error) {
    console.error('[api/admin/community-leaders]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
