import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import {
  clearAdminSessionCookies,
  getAdminSessionTokens,
  getAuthUser,
  refreshAdminSession,
  setAdminSessionCookies,
  toAdminUser,
} from 'src/lib/supabase-auth';
import { supabaseRequest, SupabaseRequestError } from 'src/lib/supabase-rest';
import { listTempleAccessForUser, selectTempleAccessForRequest } from 'src/lib/temple-access';
import { claimPendingTempleInvitations } from 'src/lib/temple-invitations';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Vary', 'Cookie');

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const { accessToken, refreshToken } = getAdminSessionTokens(req);

  let user = accessToken ? await getAuthUser(accessToken).catch(() => null) : null;

  if (!user && refreshToken) {
    try {
      const session = await refreshAdminSession(refreshToken);
      setAdminSessionCookies(res, session);
      user = session.user;
    } catch {
      clearAdminSessionCookies(res);
      return res.status(401).json({ message: 'Admin session has expired.' });
    }
  }

  if (!user) {
    clearAdminSessionCookies(res);
    return res.status(401).json({ message: 'Session is invalid.' });
  }

  try {
    await claimPendingTempleInvitations(user);
    const [templeAccesses, profiles] = await Promise.all([
      listTempleAccessForUser(user),
      supabaseRequest<Array<{ display_name?: string; pen_name?: string; avatar_url?: string }>>(
        `profiles?select=*&id=eq.${encodeURIComponent(user.id)}&limit=1`
      ),
    ]);
    const profile = profiles[0];
    const currentAccess = selectTempleAccessForRequest(req, templeAccesses);
    const authUser = toAdminUser(user);
    return res.status(200).json({
      user: {
        ...authUser,
        displayName: profile?.display_name || authUser.displayName,
        photoURL: profile?.avatar_url || authUser.photoURL,
        penName: profile?.pen_name || '',
        templeAccesses,
        currentTempleId: currentAccess?.temple.id || '',
      },
    });
  } catch (error) {
    console.error('[api/auth/me] Failed to load temple access', error);
    if (error instanceof SupabaseRequestError && error.status === 404) {
      return res.status(503).json({
        message: 'ยังไม่ได้ติดตั้งฐานข้อมูล Multi-tenant กรุณารัน migration ล่าสุดก่อน',
      });
    }
    const { status, message } = getSafeApiError(
      error,
      'โหลดข้อมูลสิทธิ์วัดไม่สำเร็จ กรุณาตรวจสอบ Multi-tenant migration'
    );
    return res.status(status).json({ message });
  }
}
