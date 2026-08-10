import type { NextApiRequest, NextApiResponse } from 'next';

import {
  clearAdminSessionCookies,
  getAdminSessionTokens,
  getAuthUser,
  refreshAdminSession,
  setAdminSessionCookies,
  toAdminUser,
} from 'src/lib/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { accessToken, refreshToken } = getAdminSessionTokens(req);

  try {
    let user = accessToken ? await getAuthUser(accessToken).catch(() => null) : null;

    if (!user && refreshToken) {
      const session = await refreshAdminSession(refreshToken);
      setAdminSessionCookies(res, session);
      user = session.user;
    }

    if (!user) {
      clearAdminSessionCookies(res);
      return res.status(401).json({ message: 'Session is invalid.' });
    }

    return res.status(200).json({ user: toAdminUser(user) });
  } catch {
    clearAdminSessionCookies(res);
    return res.status(401).json({ message: 'Admin session has expired.' });
  }
}
