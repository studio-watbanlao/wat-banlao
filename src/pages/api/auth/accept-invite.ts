import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import {
  getAuthUser,
  setAdminSessionCookies,
  updateCurrentAuthPassword,
} from 'src/lib/supabase-auth';
import { acceptTempleInvitation } from 'src/lib/temple-invitations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const accessToken = typeof req.body?.accessToken === 'string' ? req.body.accessToken : '';
    const refreshToken = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : '';
    const invitation = typeof req.body?.invitation === 'string' ? req.body.invitation : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const expiresIn = Number(req.body?.expiresIn) || 3600;
    if (!accessToken || !refreshToken || !invitation || password.length < 8) {
      return res.status(400).json({ message: 'ลิงก์คำเชิญหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const user = await getAuthUser(accessToken);
    await updateCurrentAuthPassword(accessToken, password);
    const accepted = await acceptTempleInvitation(invitation, user);
    setAdminSessionCookies(res, {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn,
      user,
    });
    return res.status(200).json({ success: true, invitation: accepted });
  } catch (error) {
    console.error('[api/auth/accept-invite]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}

