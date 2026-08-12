import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import {
  deleteTempleDirectoryImages,
  SupabaseStorageError,
  uploadTempleDirectoryImage,
} from 'src/lib/supabase-storage';
import { requireTempleContentAccess } from 'src/lib/temple-access';
import type { TempleDirectoryEntry, TempleDirectoryImagePayload } from 'src/types/temple-directory';

type DirectoryRow = {
  id: string;
  full_name: string;
  display_title?: string;
  entry_type: TempleDirectoryEntry['entryType'];
  term_start?: string;
  term_end?: string;
  image_url: string;
  image_storage_path?: string;
  birth?: string;
  age?: string;
  ordination?: string;
  vassa?: string;
  temple_name?: string;
  province?: string;
  affiliation?: string;
  education?: string;
  honorary_awards?: string;
  administrative_positions?: string;
  monastic_rank?: string;
  biography?: string;
  sources?: string;
  sort_order?: number;
  status: TempleDirectoryEntry['status'];
  created_at: string;
  updated_at?: string;
};

type ParsedImage = { buffer: Buffer; contentType: string; extension: string };

const text = (value: unknown, maximum = 50000) =>
  typeof value === 'string' ? value.trim().slice(0, maximum) : '';

const isStatus = (value: unknown): value is TempleDirectoryEntry['status'] =>
  value === 'DRAFT' || value === 'PUBLIC';

const isEntryType = (value: unknown): value is TempleDirectoryEntry['entryType'] =>
  value === 'CURRENT_ABBOT' || value === 'FORMER_ABBOT' || value === 'MONK' || value === 'NOVICE';

const parseImage = (value: unknown): ParsedImage | null => {
  if (!value || typeof value !== 'object') return null;
  const image = value as TempleDirectoryImagePayload;
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

const normalize = (row: DirectoryRow): TempleDirectoryEntry => ({
  id: row.id,
  fullName: row.full_name,
  displayTitle: row.display_title || '',
  entryType: row.entry_type,
  termStart: row.term_start || '',
  termEnd: row.term_end || '',
  imageUrl: row.image_url,
  imageStoragePath: row.image_storage_path || '',
  birth: row.birth || '',
  age: row.age || '',
  ordination: row.ordination || '',
  vassa: row.vassa || '',
  templeName: row.temple_name || '',
  province: row.province || '',
  affiliation: row.affiliation || '',
  education: row.education || '',
  honoraryAwards: row.honorary_awards || '',
  administrativePositions: row.administrative_positions || '',
  monasticRank: row.monastic_rank || '',
  biography: row.biography || '',
  sources: row.sources || '',
  sortOrder: row.sort_order || 0,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const rowData = (value: Record<string, unknown>) => ({
  full_name: text(value.fullName, 200),
  display_title: text(value.displayTitle, 200) || null,
  entry_type: value.entryType,
  term_start: text(value.termStart, 100) || null,
  term_end: text(value.termEnd, 100) || null,
  birth: text(value.birth, 200) || null,
  age: text(value.age, 100) || null,
  ordination: text(value.ordination, 200) || null,
  vassa: text(value.vassa, 100) || null,
  temple_name: text(value.templeName, 300) || null,
  province: text(value.province, 200) || null,
  affiliation: text(value.affiliation, 300) || null,
  education: text(value.education) || null,
  honorary_awards: text(value.honoraryAwards) || null,
  administrative_positions: text(value.administrativePositions) || null,
  monastic_rank: text(value.monasticRank) || null,
  biography: text(value.biography) || null,
  sources: text(value.sources, 30000) || null,
  sort_order: Math.min(Math.max(Number(value.sortOrder) || 0, 0), 9999),
});

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const access = await requireTempleContentAccess(req, user, 'directory');
    const templeId = access.temple.id;

    if (req.method === 'GET') {
      const query = new URLSearchParams({
        select: '*',
        temple_id: `eq.${templeId}`,
        order: 'sort_order.asc,created_at.desc',
      });
      const rows = await supabaseRequest<DirectoryRow[]>(`temple_directory_entries?${query}`);
      return res.status(200).json({ entries: rows.map(normalize) });
    }

    if (req.method === 'POST') {
      const status = req.body?.status;
      const entryType = req.body?.entryType;
      const image = parseImage(req.body?.profileImage);
      const fullName = text(req.body?.fullName, 200);
      if (!fullName || !isStatus(status) || !isEntryType(entryType) || !image) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อ ประเภท สถานะ และเลือกรูปประจำตัว' });
      }
      const id = randomUUID();
      const imageStoragePath = `${templeId}/${id}/profile-${Date.now()}.${image.extension}`;
      const imageUrl = await uploadTempleDirectoryImage(
        imageStoragePath,
        image.buffer,
        image.contentType
      );
      if (entryType === 'CURRENT_ABBOT') {
        await supabaseRequest(
          `temple_directory_entries?temple_id=eq.${encodeURIComponent(templeId)}&entry_type=eq.CURRENT_ABBOT`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ entry_type: 'FORMER_ABBOT' }),
          }
        );
      }
      const rows = await supabaseRequest<DirectoryRow[]>('temple_directory_entries', {
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
      return res.status(201).json({ entry: normalize(rows[0]) });
    }

    if (req.method === 'PATCH') {
      const id = text(req.body?.id, 64);
      const status = req.body?.status;
      const entryType = req.body?.entryType;
      if (!id || !isStatus(status) || !isEntryType(entryType)) {
        return res.status(400).json({ message: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' });
      }
      const existingRows = await supabaseRequest<DirectoryRow[]>(
        `temple_directory_entries?select=*&id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}&limit=1`
      );
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: 'ไม่พบข้อมูลในทำเนียบวัด' });

      const image = parseImage(req.body?.profileImage);
      let imageUrl = existing.image_url;
      let imageStoragePath = existing.image_storage_path || '';
      if (image) {
        imageStoragePath = `${templeId}/${id}/profile-${Date.now()}.${image.extension}`;
        imageUrl = await uploadTempleDirectoryImage(
          imageStoragePath,
          image.buffer,
          image.contentType
        );
      }
      const data = rowData(req.body);
      if (!data.full_name || !imageUrl) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อและเลือกรูปประจำตัว' });
      }
      if (entryType === 'CURRENT_ABBOT') {
        await supabaseRequest(
          `temple_directory_entries?temple_id=eq.${encodeURIComponent(templeId)}&entry_type=eq.CURRENT_ABBOT&id=neq.${encodeURIComponent(id)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ entry_type: 'FORMER_ABBOT' }),
          }
        );
      }
      const rows = await supabaseRequest<DirectoryRow[]>(
        `temple_directory_entries?id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
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
        await deleteTempleDirectoryImages([existing.image_storage_path]).catch((error) =>
          console.error('[api/admin/directory] ลบรูปเดิมไม่สำเร็จ', error)
        );
      }
      return res.status(200).json({ entry: normalize(rows[0]) });
    }

    if (req.method === 'DELETE') {
      const id = text(req.query.id, 64);
      if (!id) return res.status(400).json({ message: 'ไม่พบรหัสข้อมูลที่ต้องการลบ' });
      const existingRows = await supabaseRequest<DirectoryRow[]>(
        `temple_directory_entries?select=*&id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}&limit=1`
      );
      const existing = existingRows[0];
      if (!existing) return res.status(404).json({ message: 'ไม่พบข้อมูลในทำเนียบวัด' });
      await supabaseRequest(
        `temple_directory_entries?id=eq.${encodeURIComponent(id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
        { method: 'DELETE' }
      );
      if (existing.image_storage_path) {
        await deleteTempleDirectoryImages([existing.image_storage_path]).catch((error) =>
          console.error('[api/admin/directory] ลบรูปไม่สำเร็จ', error)
        );
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'ไม่รองรับคำสั่งนี้' });
  } catch (error) {
    console.error('[api/admin/directory]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
