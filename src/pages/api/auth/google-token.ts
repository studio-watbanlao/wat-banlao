import type { NextApiRequest, NextApiResponse } from 'next';

import {
  setAdminSessionCookies,
  signInWithGoogleIdToken,
  SupabaseAuthError,
  toAdminUser,
} from 'src/lib/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const credential = typeof req.body?.credential === 'string' ? req.body.credential : '';
  if (!credential) return res.status(400).json({ message: 'Google credential is required.' });

  try {
    const session = await signInWithGoogleIdToken(credential);
    setAdminSessionCookies(res, session);
    return res.status(200).json({ user: toAdminUser(session.user) });
  } catch (error) {
    console.error('[auth/google-token] Google ID token exchange failed', error);
    const status = error instanceof SupabaseAuthError ? error.status : 500;
    return res.status(status).json({
      message: error instanceof Error ? error.message : 'Google authentication failed.',
    });
  }
}
