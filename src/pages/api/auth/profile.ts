import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser, updateAuthUserMetadata } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { profileFormSchema } from 'src/schemas/profile';

type ProfileRow = {
  id: string;
  email?: string;
  display_name?: string;
  pen_name?: string;
  avatar_url?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });

    if (req.method === 'GET') {
      const rows = await supabaseRequest<ProfileRow[]>(
        `profiles?select=*&id=eq.${encodeURIComponent(user.id)}&limit=1`
      );
      return res.status(200).json({ profile: rows[0] || null });
    }

    if (req.method === 'PATCH') {
      const parsed = profileFormSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: parsed.error.issues[0]?.message || 'ข้อมูลโปรไฟล์ไม่ถูกต้อง',
        });
      }
      const { displayName, penName } = parsed.data;
      await updateAuthUserMetadata(user.id, {
        ...user.user_metadata,
        display_name: displayName,
      });
      const rows = await supabaseRequest<ProfileRow[]>(
        `profiles?id=eq.${encodeURIComponent(user.id)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=representation' },
          body: JSON.stringify({ display_name: displayName, pen_name: penName || null }),
        }
      );
      return res.status(200).json({ profile: rows[0] });
    }

    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/auth/profile]', error);
    const { status, message } = getSafeApiError(error, 'บันทึกโปรไฟล์ไม่สำเร็จ');
    return res.status(status).json({ message });
  }
}
