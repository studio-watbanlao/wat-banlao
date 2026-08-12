import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { isSuperAdminUser, resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { listAllTemples } from 'src/lib/temple-access';
import { scaffoldPublicTemplate } from 'src/lib/public-template-scaffold';
import {
  isPublicTemplateKey,
  type ManagedPublicTemplate,
  type PublicTemplateStatus,
} from 'src/public-templates/catalog';

const text = (value: unknown, max = 64) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

type TemplateRow = {
  id: string;
  template_key: string;
  name: string;
  description: string;
  features: unknown;
  preview: unknown;
  status: PublicTemplateStatus;
};

const DEFAULT_PREVIEW = {
  background: '#F8F7F2',
  surface: '#FFFFFF',
  accent: '#6F4E37',
  text: '#25302B',
};

const normalizeTemplate = (row: TemplateRow): ManagedPublicTemplate => {
  const preview = row.preview && typeof row.preview === 'object' ? row.preview : {};
  return {
    id: row.id,
    key: row.template_key,
    name: row.name,
    description: row.description,
    features: Array.isArray(row.features)
      ? row.features.filter((feature): feature is string => typeof feature === 'string')
      : [],
    preview: { ...DEFAULT_PREVIEW, ...preview },
    status: row.status,
    codeAvailable: isPublicTemplateKey(row.template_key),
    scaffoldPath: `src/public-templates/${row.template_key}`,
  };
};

const getTemplates = async () => {
  const rows = await supabaseRequest<TemplateRow[]>(
    'public_templates?select=*&order=created_at.asc'
  );
  return rows.map(normalizeTemplate);
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    if (!isSuperAdminUser(user)) {
      return res.status(403).json({ message: 'สงวนสิทธิ์สำหรับ Super Admin' });
    }

    if (req.method === 'GET') {
      if (req.query.catalog === 'true') {
        return res.status(200).json({ templates: await getTemplates() });
      }
      const [temples, templates] = await Promise.all([listAllTemples(), getTemplates()]);
      return res.status(200).json({ templates, temples, canWriteScaffold: process.env.NODE_ENV !== 'production' });
    }

    if (req.method === 'POST') {
      const templateKey = text(req.body?.templateKey).toLowerCase();
      const name = text(req.body?.name, 160);
      const description = text(req.body?.description, 1000);
      if (!name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(templateKey)) {
        return res.status(400).json({ message: 'กรุณากรอกชื่อและ key เช่น modern-temple' });
      }
      if (isPublicTemplateKey(templateKey)) {
        return res.status(409).json({ message: 'มี Template key นี้อยู่แล้ว' });
      }

      const rows = await supabaseRequest<TemplateRow[]>('public_templates', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({
          template_key: templateKey,
          name,
          description,
          status: 'DRAFT',
          features: [],
          preview: DEFAULT_PREVIEW,
        }),
      });

      const scaffold = process.env.NODE_ENV !== 'production'
        ? await scaffoldPublicTemplate(templateKey)
        : { created: false, path: `src/public-templates/${templateKey}` };

      return res.status(201).json({
        template: normalizeTemplate(rows[0]),
        scaffold,
        command: `npm run template:create -- ${templateKey}`,
      });
    }

    if (req.method === 'PATCH') {
      const action = text(req.body?.action);
      if (action === 'updateTemplate') {
        const templateKey = text(req.body?.templateKey).toLowerCase();
        const name = text(req.body?.name, 160);
        const description = text(req.body?.description, 1000);
        const requestedStatus = req.body?.status as PublicTemplateStatus;
        if (!templateKey || !name || !['DRAFT', 'READY', 'ARCHIVED'].includes(requestedStatus)) {
          return res.status(400).json({ message: 'ข้อมูล Template ไม่ถูกต้อง' });
        }
        if (requestedStatus === 'READY' && !isPublicTemplateKey(templateKey)) {
          return res.status(400).json({
            message: 'ยังเปิดใช้งานไม่ได้: ต้องเขียน code, register template และ deploy ก่อน',
          });
        }
        if (requestedStatus !== 'READY') {
          const assignments = await supabaseRequest<Array<{ temple_id: string }>>(
            `temple_branding?select=temple_id&public_template=eq.${encodeURIComponent(templateKey)}&limit=1`
          );
          if (assignments.length) {
            return res.status(409).json({
              message: 'ยังเปลี่ยนสถานะ Template นี้ไม่ได้ เพราะมีวัดกำลังใช้งานอยู่',
            });
          }
        }
        await supabaseRequest(
          `public_templates?template_key=eq.${encodeURIComponent(templateKey)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ name, description, status: requestedStatus }),
          }
        );
        return res.status(200).json({ success: true });
      }

      const templeId = text(req.body?.templeId);
      const templateKey = req.body?.templateKey;
      if (!templeId || !isPublicTemplateKey(templateKey)) {
        return res.status(400).json({ message: 'ข้อมูลวัดหรือ Template ไม่ถูกต้อง' });
      }

      const available = await supabaseRequest<Array<{ status: PublicTemplateStatus }>>(
        `public_templates?select=status&template_key=eq.${encodeURIComponent(templateKey)}&limit=1`
      );
      if (available[0]?.status !== 'READY') {
        return res.status(400).json({ message: 'Template นี้ยังไม่พร้อมใช้งาน' });
      }

      await supabaseRequest('temple_branding?on_conflict=temple_id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({ temple_id: templeId, public_template: templateKey }),
      });

      return res.status(200).json({ success: true, templeId, templateKey });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/public-templates]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
