import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { getThaiBank } from 'src/constants/thai-banks';
import { isSuperAdminUser, resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { uploadBrandingImage } from 'src/lib/supabase-storage';
import { listAllTemples } from 'src/lib/temple-access';
import { DEFAULT_TEMPLE_NAVIGATION } from 'src/lib/temple-navigation';
import { TEMPLE_MODULES, type TempleModule, type TemplePermissions } from 'src/types/temple';
import { resolvePublicTemplateKey } from 'src/public-templates/catalog';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_FAVICON_TYPES = [...ALLOWED_IMAGE_TYPES, 'image/x-icon', 'image/vnd.microsoft.icon'];
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';
const isStatus = (value: unknown): value is 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED' =>
  value === 'ACTIVE' || value === 'SUSPENDED' || value === 'ARCHIVED';
const isModule = (value: unknown): value is TempleModule =>
  TEMPLE_MODULES.includes(value as TempleModule);

const STANDARD_PAGE_PACK = [
  {
    page_key: 'home',
    slug: 'home',
    page_type: 'SYSTEM',
    template_key: 'landing',
    title: 'หน้าแรก',
    status: 'PUBLIC',
    show_in_menu: true,
    sort_order: 10,
    use_legacy_content: true,
  },
  {
    page_key: 'about',
    slug: 'about-us',
    page_type: 'SYSTEM',
    template_key: 'default',
    title: 'เกี่ยวกับวัด',
    status: 'PUBLIC',
    show_in_menu: true,
    sort_order: 20,
  },
  {
    page_key: 'history',
    slug: 'history',
    page_type: 'SYSTEM',
    template_key: 'default',
    title: 'ประวัติวัด',
    status: 'PUBLIC',
    show_in_menu: true,
    sort_order: 30,
  },
  {
    page_key: 'contact',
    slug: 'contact-us',
    page_type: 'SYSTEM',
    template_key: 'default',
    title: 'ติดต่อวัด',
    status: 'PUBLIC',
    show_in_menu: true,
    sort_order: 40,
  },
] as const;

const parseImage = (value: unknown, label: string, allowedTypes = ALLOWED_IMAGE_TYPES) => {
  if (!value || typeof value !== 'object') return null;
  const image = value as { type?: unknown; base64?: unknown };
  if (typeof image.type !== 'string' || !allowedTypes.includes(image.type)) {
    throw Object.assign(new Error(`รองรับ${label}เฉพาะ JPG, PNG และ WebP`), { status: 400 });
  }
  if (typeof image.base64 !== 'string') {
    throw Object.assign(new Error(`ข้อมูล${label}ไม่ถูกต้อง`), { status: 400 });
  }
  const buffer = Buffer.from(image.base64, 'base64');
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) {
    throw Object.assign(new Error(`${label}ต้องมีขนาดไม่เกิน 8 MB`), { status: 400 });
  }
  const extension =
    image.type === 'image/png'
      ? 'png'
      : image.type === 'image/webp'
        ? 'webp'
        : image.type === 'image/x-icon' || image.type === 'image/vnd.microsoft.icon'
          ? 'ico'
          : 'jpg';
  return { buffer, contentType: image.type, extension };
};

const getMembers = () =>
  supabaseRequest<
    Array<{
      temple_id: string;
      user_id: string;
      role: string;
      permissions: TemplePermissions;
      status: string;
    }>
  >('temple_members?select=temple_id,user_id,role,permissions,status&order=created_at.asc');

const coordinate = (value: unknown, label: string, min: number, max: number) => {
  const rawValue = text(value, 32);
  if (!rawValue) return '';
  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || parsedValue < min || parsedValue > max) {
    throw Object.assign(new Error(`${label}ไม่ถูกต้อง`), { status: 400 });
  }
  return rawValue;
};

const brandingContact = (body: NextApiRequest['body'], qrCodeUrl: string) => {
  const selectedBank = getThaiBank(text(body?.bankCode, 20));
  const email = text(body?.email, 320);
  if (email && !EMAIL_PATTERN.test(email)) {
    throw Object.assign(new Error('รูปแบบอีเมลไม่ถูกต้อง'), { status: 400 });
  }
  return {
    ...(body?.contact && typeof body.contact === 'object' ? body.contact : {}),
    nameEnglish: text(body?.nameEnglish, 200),
    address: text(body?.address, 1000),
    openingHours: text(body?.openingHours, 300),
    email,
    latitude: coordinate(body?.mapLatitude, 'ละติจูด', -90, 90),
    longitude: coordinate(body?.mapLongitude, 'ลองจิจูด', -180, 180),
    donation: {
      bankCode: selectedBank?.code || '',
      bankName: selectedBank?.name || '',
      accountNumber: text(body?.bankAccountNumber, 80),
      accountName: text(body?.bankAccountName, 200),
      qrCodeUrl,
      bankLogoUrl: selectedBank?.logoUrl || '',
    },
  };
};

export const config = { api: { bodyParser: { sizeLimit: '56mb' } } };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    if (!isSuperAdminUser(user)) {
      return res.status(403).json({ message: 'สงวนสิทธิ์สำหรับ Super Admin' });
    }

    if (req.method === 'GET') {
      const [temples, members] = await Promise.all([listAllTemples(), getMembers()]);
      return res.status(200).json({ temples, members });
    }

    if (req.method === 'POST') {
      const name = text(req.body?.name, 200);
      const slug = text(req.body?.slug, 100).toLowerCase();
      if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อและ slug ให้ถูกต้อง' });
      }
      const id = randomUUID();
      const modules = Array.isArray(req.body?.modules) ? req.body.modules.filter(isModule) : [];
      const logo = parseImage(req.body?.logoImage, 'โลโก้วัด');
      const favicon = parseImage(req.body?.faviconImage, 'ไอคอนเว็บไซต์', ALLOWED_FAVICON_TYPES);
      const ogImage = parseImage(req.body?.ogImage, 'ภาพตัวอย่างสำหรับการแชร์');
      const loginBackground = parseImage(req.body?.loginBackgroundImage, 'ภาพพื้นหลังหน้า Login');
      const bankQr = parseImage(req.body?.bankQrImage, 'รูป QR Code');
      const logoUrl = logo
        ? await uploadBrandingImage(
            `${id}/logo-${Date.now()}.${logo.extension}`,
            logo.buffer,
            logo.contentType
          )
        : '';
      const loginBackgroundUrl = loginBackground
        ? await uploadBrandingImage(
            `${id}/login-background-${Date.now()}.${loginBackground.extension}`,
            loginBackground.buffer,
            loginBackground.contentType
          )
        : '';
      const faviconUrl = favicon
        ? await uploadBrandingImage(
            `${id}/favicon-${Date.now()}.${favicon.extension}`,
            favicon.buffer,
            favicon.contentType
          )
        : text(req.body?.currentFaviconUrl, 2000);
      const ogImageUrl = ogImage
        ? await uploadBrandingImage(
            `${id}/og-image-${Date.now()}.${ogImage.extension}`,
            ogImage.buffer,
            ogImage.contentType
          )
        : text(req.body?.currentOgImageUrl, 2000);
      const bankQrUrl = bankQr
        ? await uploadBrandingImage(
            `${id}/donation-qr-${Date.now()}.${bankQr.extension}`,
            bankQr.buffer,
            bankQr.contentType
          )
        : text(req.body?.currentBankQrUrl, 2000);
      await supabaseRequest('temples', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ id, name, slug, status: 'ACTIVE', settings: {} }),
      });
      await Promise.all([
        supabaseRequest('temple_branding', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            temple_id: id,
            logo_url: logoUrl || null,
            login_background_url: loginBackgroundUrl || null,
            favicon_url: faviconUrl || null,
            og_image_url: ogImageUrl || null,
            primary_color: text(req.body?.primaryColor, 20) || '#6F4E37',
            secondary_color: text(req.body?.secondaryColor, 20) || '#C89545',
            font_family: text(req.body?.fontFamily, 120) || null,
            admin_template: text(req.body?.adminTemplate, 50) || 'classic',
            public_template: resolvePublicTemplateKey(req.body?.publicTemplate),
            contact: brandingContact(req.body, bankQrUrl),
          }),
        }),
        modules.length
          ? supabaseRequest('temple_modules', {
              method: 'POST',
              headers: { Prefer: 'return=minimal' },
              body: JSON.stringify(
                modules.map((module: TempleModule) => ({ temple_id: id, module_key: module }))
              ),
            })
          : Promise.resolve(),
        supabaseRequest('temple_pages', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(STANDARD_PAGE_PACK.map((page) => ({ ...page, temple_id: id }))),
        }),
        supabaseRequest('temple_navigation_items', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify(
            DEFAULT_TEMPLE_NAVIGATION.map((item) => ({
              temple_id: id,
              item_key: item.itemKey,
              title: item.title,
              path: item.path,
              parent_key: item.parentKey || null,
              sort_order: item.sortOrder,
              enabled: item.enabled,
              deep_match: item.deepMatch,
            }))
          ),
        }),
      ]);
      const createdTemple = await listAllTemples().then((items) =>
        items.find((item) => item.id === id)
      );
      return res.status(201).json({ temple: createdTemple });
    }

    if (req.method === 'PATCH') {
      const action = text(req.body?.action, 50);
      const templeId = text(req.body?.templeId, 64);
      if (!templeId) return res.status(400).json({ message: 'ไม่พบรหัสวัด' });

      if (action === 'updateTemple') {
        const name = text(req.body?.name, 200);
        const slug = text(req.body?.slug, 100).toLowerCase();
        const status = req.body?.status;
        if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !isStatus(status)) {
          return res.status(400).json({ message: 'ข้อมูลวัดไม่ถูกต้อง' });
        }
        const logo = parseImage(req.body?.logoImage, 'โลโก้วัด');
        const favicon = parseImage(req.body?.faviconImage, 'ไอคอนเว็บไซต์', ALLOWED_FAVICON_TYPES);
        const ogImage = parseImage(req.body?.ogImage, 'ภาพตัวอย่างสำหรับการแชร์');
        const loginBackground = parseImage(req.body?.loginBackgroundImage, 'ภาพพื้นหลังหน้า Login');
        const bankQr = parseImage(req.body?.bankQrImage, 'รูป QR Code');
        const logoUrl = logo
          ? await uploadBrandingImage(
              `${templeId}/logo-${Date.now()}.${logo.extension}`,
              logo.buffer,
              logo.contentType
            )
          : text(req.body?.currentLogoUrl, 2000);
        const loginBackgroundUrl = loginBackground
          ? await uploadBrandingImage(
              `${templeId}/login-background-${Date.now()}.${loginBackground.extension}`,
              loginBackground.buffer,
              loginBackground.contentType
            )
          : text(req.body?.currentLoginBackgroundUrl, 2000);
        const faviconUrl = favicon
          ? await uploadBrandingImage(
              `${templeId}/favicon-${Date.now()}.${favicon.extension}`,
              favicon.buffer,
              favicon.contentType
            )
          : text(req.body?.currentFaviconUrl, 2000);
        const ogImageUrl = ogImage
          ? await uploadBrandingImage(
              `${templeId}/og-image-${Date.now()}.${ogImage.extension}`,
              ogImage.buffer,
              ogImage.contentType
            )
          : text(req.body?.currentOgImageUrl, 2000);
        const bankQrUrl = bankQr
          ? await uploadBrandingImage(
              `${templeId}/donation-qr-${Date.now()}.${bankQr.extension}`,
              bankQr.buffer,
              bankQr.contentType
            )
          : text(req.body?.currentBankQrUrl, 2000);
        const enabledModules = Array.isArray(req.body?.modules)
          ? req.body.modules.filter(isModule)
          : [];
        await Promise.all([
          supabaseRequest(`temples?id=eq.${encodeURIComponent(templeId)}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ name, slug, status, settings: req.body?.settings || {} }),
          }),
          supabaseRequest('temple_branding?on_conflict=temple_id', {
            method: 'POST',
            headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
            body: JSON.stringify({
              temple_id: templeId,
              logo_url: logoUrl || null,
              login_background_url: loginBackgroundUrl || null,
              favicon_url: faviconUrl || null,
              og_image_url: ogImageUrl || null,
              primary_color: text(req.body?.primaryColor, 20) || '#6F4E37',
              secondary_color: text(req.body?.secondaryColor, 20) || '#C89545',
              font_family: text(req.body?.fontFamily, 120) || null,
              admin_template: text(req.body?.adminTemplate, 50) || 'classic',
              public_template: resolvePublicTemplateKey(req.body?.publicTemplate),
              contact: brandingContact(req.body, bankQrUrl),
            }),
          }),
          ...TEMPLE_MODULES.map((module) =>
            supabaseRequest('temple_modules?on_conflict=temple_id,module_key', {
              method: 'POST',
              headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
              body: JSON.stringify({
                temple_id: templeId,
                module_key: module,
                enabled: enabledModules.includes(module),
              }),
            })
          ),
        ]);
      } else if (action === 'saveDomain') {
        const domain = text(req.body?.domain, 255)
          .toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/\/$/, '');
        if (!domain || !domain.includes('.')) {
          return res.status(400).json({ message: 'Domain ไม่ถูกต้อง' });
        }
        if (req.body?.isPrimary) {
          await supabaseRequest(`temple_domains?temple_id=eq.${encodeURIComponent(templeId)}`, {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ is_primary: false }),
          });
        }
        const domainId = text(req.body?.domainId, 64) || randomUUID();
        await supabaseRequest('temple_domains?on_conflict=id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({
            id: domainId,
            temple_id: templeId,
            domain,
            is_primary: Boolean(req.body?.isPrimary),
            ownership: req.body?.ownership === 'PLATFORM' ? 'PLATFORM' : 'TEMPLE',
            verification_status: ['PENDING', 'VERIFIED', 'FAILED'].includes(
              req.body?.verificationStatus
            )
              ? req.body.verificationStatus
              : 'PENDING',
            registrar: text(req.body?.registrar, 120) || null,
            expires_at: req.body?.expiresAt || null,
          }),
        });
      } else if (action === 'saveMember') {
        const userId = text(req.body?.userId, 64);
        const role = req.body?.role === 'temple_admin' ? 'temple_admin' : 'temple_editor';
        if (!userId) return res.status(400).json({ message: 'กรุณาเลือกผู้ใช้งาน' });
        await supabaseRequest('temple_members?on_conflict=temple_id,user_id', {
          method: 'POST',
          headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({
            temple_id: templeId,
            user_id: userId,
            role,
            status: req.body?.memberStatus === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE',
            permissions: req.body?.permissions || {},
          }),
        });
      } else {
        return res.status(400).json({ message: 'คำสั่งไม่ถูกต้อง' });
      }

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const templeId = text(req.query.templeId, 64);
      const memberId = text(req.query.userId, 64);
      const domainId = text(req.query.domainId, 64);
      if (memberId && templeId) {
        await supabaseRequest(
          `temple_members?temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(memberId)}`,
          { method: 'DELETE' }
        );
      } else if (domainId && templeId) {
        await supabaseRequest(
          `temple_domains?id=eq.${encodeURIComponent(domainId)}&temple_id=eq.${encodeURIComponent(templeId)}`,
          { method: 'DELETE' }
        );
      } else {
        return res.status(400).json({ message: 'ข้อมูลสำหรับลบไม่ครบถ้วน' });
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/temples]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
