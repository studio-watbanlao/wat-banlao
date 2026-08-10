import type { NextApiRequest, NextApiResponse } from 'next';

import {
  clearAdminSessionCookies,
  getAdminSessionTokens,
  signOutAdmin,
} from 'src/lib/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { accessToken } = getAdminSessionTokens(req);
  if (accessToken) await signOutAdmin(accessToken).catch(() => undefined);

  clearAdminSessionCookies(res);
  return res.status(200).json({ success: true });
}
