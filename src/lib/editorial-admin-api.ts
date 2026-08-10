import { randomUUID } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { isAdminUser, resolveSessionUser } from 'src/lib/supabase-auth';
import {
  createAdminContent,
  deleteAdminContent,
  getAdminContent,
  updateAdminContent,
  type ContentStatus,
} from 'src/lib/supabase-rest';
import {
  deleteBlogImages,
  deleteDharmaImages,
  SupabaseStorageError,
  uploadBlogImage,
  uploadDharmaImage,
} from 'src/lib/supabase-storage';
import type { EditorialImagePayload, EditorialItem, EditorialResource } from 'src/types/editorial';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
type ParsedImage = { buffer: Buffer; contentType: string; extension: string };

const text = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const isStatus = (value: unknown): value is ContentStatus =>
  value === 'DRAFT' || value === 'PUBLIC';

const parseImage = (value: unknown): ParsedImage | null => {
  if (!value || typeof value !== 'object') return null;
  const image = value as EditorialImagePayload;
  if (!IMAGE_TYPES.includes(image.type) || typeof image.base64 !== 'string') {
    throw new SupabaseStorageError('รองรับเฉพาะไฟล์ JPG, PNG และ WebP', 400);
  }
  const buffer = Buffer.from(image.base64, 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    throw new SupabaseStorageError('รูปภาพต้องมีขนาดไม่เกิน 8 MB', 400);
  }
  const extension =
    image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  return { buffer, contentType: image.type, extension };
};

const editorialData = (value: Record<string, unknown>) => ({
  title: text(value.title),
  description: text(value.description),
  content: text(value.content),
  imageUrl: text(value.imageUrl),
  coverStoragePath: text(value.coverStoragePath),
  author: text(value.author),
  authorImageUrl: text(value.authorImageUrl),
  createdDate: text(value.createdDate) || new Date().toISOString(),
});

const RESOURCE_OPTIONS = {
  blog: {
    listKey: 'blogs',
    singularKey: 'blog',
    label: 'บทความ',
    upload: uploadBlogImage,
    removeImages: deleteBlogImages,
  },
  dharma: {
    listKey: 'dharmas',
    singularKey: 'dharma',
    label: 'ธรรมะ',
    upload: uploadDharmaImage,
    removeImages: deleteDharmaImages,
  },
} as const;

export const createEditorialAdminHandler = (resource: EditorialResource) => {
  const options = RESOURCE_OPTIONS[resource];

  return async function editorialAdminHandler(req: NextApiRequest, res: NextApiResponse) {
    try {
      const user = await resolveSessionUser(req, res);
      if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
      if (!isAdminUser(user)) return res.status(403).json({ message: 'บัญชีนี้ไม่มีสิทธิ์แอดมิน' });

      if (req.method === 'GET') {
        const items = await getAdminContent<EditorialItem>(resource);
        return res.status(200).json({ [options.listKey]: items });
      }

      if (req.method === 'POST') {
        const status = req.body?.status;
        const cover = parseImage(req.body?.coverImage);
        if (!text(req.body?.title) || !isStatus(status) || !cover) {
          return res
            .status(400)
            .json({ message: `กรุณากรอกชื่อ สถานะ และเลือกรูปปก${options.label}` });
        }
        const id = randomUUID();
        const coverStoragePath = `${id}/cover-${Date.now()}.${cover.extension}`;
        const imageUrl = await options.upload(coverStoragePath, cover.buffer, cover.contentType);
        const data = editorialData({ ...req.body, imageUrl, coverStoragePath });
        const item = await createAdminContent(resource, id, status, data);
        return res.status(201).json({ [options.singularKey]: item });
      }

      if (req.method === 'PATCH') {
        const id = text(req.body?.id);
        const status = req.body?.status;
        if (!id || !text(req.body?.title) || !isStatus(status)) {
          return res.status(400).json({ message: `ข้อมูล${options.label}ไม่ถูกต้อง` });
        }
        const existing = await getAdminContent<EditorialItem>(resource, id);
        if (!existing) return res.status(404).json({ message: `ไม่พบ${options.label}` });

        const data = editorialData({ ...existing, ...req.body });
        const oldCoverPath = data.coverStoragePath;
        const cover = parseImage(req.body?.coverImage);
        if (cover) {
          const path = `${id}/cover-${Date.now()}.${cover.extension}`;
          data.imageUrl = await options.upload(path, cover.buffer, cover.contentType);
          data.coverStoragePath = path;
        }
        if (!data.imageUrl) return res.status(400).json({ message: 'กรุณาเลือกรูปหน้าปก' });

        const item = await updateAdminContent(resource, id, status, data);
        if (cover && oldCoverPath) {
          await options
            .removeImages([oldCoverPath])
            .catch((error) => console.error(`[api/admin/${options.listKey}] clean cover`, error));
        }
        return res.status(200).json({ [options.singularKey]: item });
      }

      if (req.method === 'DELETE') {
        const id = text(req.query.id);
        if (!id) return res.status(400).json({ message: `ไม่พบรหัส${options.label}` });
        const existing = await getAdminContent<EditorialItem>(resource, id);
        if (!existing) return res.status(404).json({ message: `ไม่พบ${options.label}` });
        await deleteAdminContent(resource, id);
        if (existing.coverStoragePath) {
          await options
            .removeImages([existing.coverStoragePath])
            .catch((error) =>
              console.error(`[api/admin/${options.listKey}] clean deleted cover`, error)
            );
        }
        return res.status(200).json({ success: true });
      }

      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      return res.status(405).json({ message: 'ระบบไม่รองรับคำสั่งนี้' });
    } catch (error) {
      console.error(`[api/admin/${options.listKey}]`, error);
      const { status, message } = getSafeApiError(error);
      return res.status(status).json({ message });
    }
  };
};
