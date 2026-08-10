import type { NextApiRequest, NextApiResponse } from 'next';

import {
  setAdminSessionCookies,
  signInAdmin,
  SupabaseAuthError,
  toAdminUser,
} from 'src/lib/supabase-auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const session = await signInAdmin(email, password);
    setAdminSessionCookies(res, session);
    return res.status(200).json({ user: toAdminUser(session.user) });
  } catch (error) {
    const status = error instanceof SupabaseAuthError ? error.status : 500;
    const responseStatus = status === 400 ? 401 : status;
    const message =
      responseStatus === 401
        ? 'Email or password is incorrect.'
        : error instanceof Error
          ? error.message
          : 'Login failed.';

    return res.status(responseStatus).json({ message });
  }
}
