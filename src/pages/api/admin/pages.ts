import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { deleteTemplePageImages, uploadTemplePageImage } from 'src/lib/supabase-storage';
import { requireTempleContentAccess } from 'src/lib/temple-access';
import { getAdminTemplePages } from 'src/lib/temple-page-repository';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const text = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

const parseImage = (value: unknown) => {
  if (!value || typeof value !== 'object') return null;
  const image = value as { type?: unknown; base64?: unknown };
  if (typeof image.type !== 'string' || !ALLOWED_IMAGE_TYPES.includes(image.type)) {
    throw Object.assign(new Error('รองรับรูปเฉพาะ JPG, PNG และ WebP'), { status: 400 });
  }
  const buffer = Buffer.from(typeof image.base64 === 'string' ? image.base64 : '', 'base64');
  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    throw Object.assign(new Error('รูปต้องมีขนาดไม่เกิน 8 MB'), { status: 400 });
  }
  const extension =
    image.type === 'image/png' ? 'png' : image.type === 'image/webp' ? 'webp' : 'jpg';
  return { buffer, contentType: image.type, extension };
};

const toRow = (body: Record<string, unknown>) => ({
  page_key: text(body.pageKey, 100),
  slug: text(body.slug, 240)
    .toLowerCase()
    .replace(/^\/+|\/+$/g, ''),
  page_type: body.pageType === 'SYSTEM' ? 'SYSTEM' : 'CUSTOM',
  template_key: ['default', 'landing', 'biography'].includes(String(body.templateKey))
    ? body.templateKey
    : 'default',
  title: text(body.title, 200),
  eyebrow: text(body.eyebrow, 120) || null,
  excerpt: text(body.excerpt, 500) || null,
  content: typeof body.content === 'string' ? body.content : '',
  status: ['DRAFT', 'PUBLIC', 'ARCHIVED'].includes(String(body.status)) ? body.status : 'DRAFT',
  show_in_menu: Boolean(body.showInMenu),
  sort_order: Number.isInteger(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
  seo_title: text(body.seoTitle, 200) || null,
  seo_description: text(body.seoDescription, 500) || null,
});

export const config = { api: { bodyParser: { sizeLimit: '12mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const access = await requireTempleContentAccess(req, user, 'pages');
    const templeId = access.temple.id;

    if (req.method === 'GET') {
      const id = typeof req.query.id === 'string' ? req.query.id : undefined;
      if (id) return res.status(200).json({ page: await getAdminTemplePages(templeId, id) });
      return res.status(200).json({ pages: await getAdminTemplePages(templeId) });
    }

    if (req.method === 'POST') {
      const id = randomUUID();
      const image = parseImage(req.body?.heroImage);
      const storagePath = image ? `${templeId}/${id}/hero.${image.extension}` : '';
      const imageUrl = image
        ? await uploadTemplePageImage(storagePath, image.buffer, image.contentType)
        : '';
      const rows = await supabaseRequest<Array<{ id: string }>>('temple_pages', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          id,
          temple_id: templeId,
          ...toRow(req.body || {}),
          hero_image_url: imageUrl || null,
          hero_storage_path: storagePath || null,
          use_legacy_content: false,
        }),
      });
      return res.status(201).json({ page: await getAdminTemplePages(templeId, rows[0].id) });
    }

    if (req.method === 'PATCH') {
      if (req.body?.action === 'updateMenu') {
        const items: unknown[] = Array.isArray(req.body?.items)
          ? (req.body.items as unknown[]).slice(0, 200)
          : [];
        const pages = (await getAdminTemplePages(templeId)).filter(
          (page) => page.pageType === 'CUSTOM'
        );
        const pageIds = new Set(pages.map((page) => page.id));
        const menuItems = items
          .map((item: unknown, index: number) => {
            if (!item || typeof item !== 'object') return null;
            const value = item as Record<string, unknown>;
            const id = text(value.id, 64);
            if (!id || !pageIds.has(id)) return null;
            return {
              id,
              showInMenu: Boolean(value.showInMenu),
              sortOrder: Math.min(Math.max(Number(value.sortOrder) || (index + 1) * 10, 0), 9999),
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item));

        if (menuItems.length !== items.length) {
          return res.status(400).json({ message: 'รายการเมนูไม่ถูกต้อง' });
        }

        await Promise.all(
          menuItems.map((item) =>
            supabaseRequest(
              `temple_pages?id=eq.${encodeURIComponent(item.id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
              {
                method: 'PATCH',
                headers: { Prefer: 'return=minimal' },
                body: JSON.stringify({
                  show_in_menu: item.showInMenu,
                  sort_order: item.sortOrder,
                }),
              }
            )
          )
        );
        return res.status(200).json({ pages: await getAdminTemplePages(templeId) });
      }

      const id = text(req.body?.id, 64);
      const existing = id ? await getAdminTemplePages(templeId, id) : null;
      if (!existing) return res.status(404).json({ message: 'ไม่พบหน้าที่ต้องการแก้ไข' });
      const image = parseImage(req.body?.heroImage);
      let storagePath = existing.heroStoragePath;
      let imageUrl = existing.heroImageUrl;
      if (image) {
        storagePath = `${templeId}/${id}/hero.${image.extension}`;
        imageUrl = await uploadTemplePageImage(storagePath, image.buffer, image.contentType);
        if (existing.heroStoragePath && existing.heroStoragePath !== storagePath) {
          await deleteTemplePageImages([existing.heroStoragePath]);
        }
      }
      await supabaseRequest(`temple_pages?id=eq.${id}&temple_id=eq.${templeId}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          ...toRow(req.body || {}),
          hero_image_url: imageUrl || null,
          hero_storage_path: storagePath || null,
          use_legacy_content: false,
        }),
      });
      return res.status(200).json({ page: await getAdminTemplePages(templeId, id) });
    }

    if (req.method === 'DELETE') {
      const id = typeof req.query.id === 'string' ? req.query.id : '';
      const existing = id ? await getAdminTemplePages(templeId, id) : null;
      if (!existing) return res.status(404).json({ message: 'ไม่พบหน้าที่ต้องการลบ' });
      if (existing.pageType === 'SYSTEM') {
        return res.status(400).json({ message: 'หน้ามาตรฐานลบไม่ได้ สามารถเปลี่ยนเป็นแบบร่างได้' });
      }
      await supabaseRequest(`temple_pages?id=eq.${id}&temple_id=eq.${templeId}`, {
        method: 'DELETE',
      });
      if (existing.heroStoragePath) await deleteTemplePageImages([existing.heroStoragePath]);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/pages]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
