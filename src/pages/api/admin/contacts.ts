import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import {
  deleteContactMessage,
  getContactMessage,
  getContactMessages,
  updateContactMessage,
} from 'src/lib/contact-repository';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { requireTempleContentAccess } from 'src/lib/temple-access';
import type { ContactStatus } from 'src/types/contact';

const CONTACT_STATUSES: ContactStatus[] = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'];
const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const isStatus = (value: unknown): value is ContactStatus =>
  CONTACT_STATUSES.includes(value as ContactStatus);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const { temple } = await requireTempleContentAccess(req, user, 'contacts');
    const templeId = temple.id;

    if (req.method === 'GET') {
      const contacts = await getContactMessages(templeId);
      return res.status(200).json({ contacts });
    }

    if (req.method === 'PATCH') {
      const id = text(req.body?.id, 64);
      const name = text(req.body?.name, 120);
      const email = text(req.body?.email, 254).toLowerCase();
      const subject = text(req.body?.subject, 200) || 'ติดต่อจากเว็บไซต์';
      const message = text(req.body?.message, 5000);
      const adminNote = text(req.body?.adminNote, 3000);
      const status = req.body?.status;

      if (!id || !name || !EMAIL_PATTERN.test(email) || !message || !isStatus(status)) {
        return res.status(400).json({ message: 'ข้อมูลการติดต่อไม่ถูกต้อง' });
      }
      if (!(await getContactMessage(templeId, id))) {
        return res.status(404).json({ message: 'ไม่พบข้อความติดต่อ' });
      }

      const contact = await updateContactMessage(templeId, id, {
        name,
        email,
        subject,
        message,
        adminNote,
        status,
      });
      return res.status(200).json({ contact });
    }

    if (req.method === 'DELETE') {
      const id = text(req.query.id, 64);
      if (!id) return res.status(400).json({ message: 'ไม่พบรหัสข้อความติดต่อ' });
      if (!(await getContactMessage(templeId, id))) {
        return res.status(404).json({ message: 'ไม่พบข้อความติดต่อ' });
      }
      await deleteContactMessage(templeId, id);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'ระบบไม่รองรับคำสั่งนี้' });
  } catch (error) {
    console.error('[api/admin/contacts]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
