import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { createContactMessage } from 'src/lib/contact-repository';

const text = (value: unknown, maxLength: number) =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'ระบบไม่รองรับคำสั่งนี้' });
  }

  try {
    // Honeypot field: bots receive a success response without writing data.
    if (text(req.body?.company, 100)) return res.status(201).json({ success: true });

    const name = text(req.body?.name, 120);
    const email = text(req.body?.email, 254).toLowerCase();
    const subject = text(req.body?.subject, 200) || 'ติดต่อจากเว็บไซต์';
    const message = text(req.body?.message, 5000);

    if (!name || !EMAIL_PATTERN.test(email) || !message) {
      return res.status(400).json({ message: 'กรุณากรอกชื่อ อีเมล และข้อความให้ถูกต้อง' });
    }

    const contact = await createContactMessage({ name, email, subject, message });
    return res.status(201).json({ success: true, id: contact.id });
  } catch (error) {
    console.error('[api/contact]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
