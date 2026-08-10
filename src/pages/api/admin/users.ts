import type { NextApiRequest, NextApiResponse } from 'next';
import { getSafeApiError } from 'src/lib/api-error';

import {
  createAuthUser,
  deleteAuthUser,
  getAuthUserById,
  getUserRole,
  isSuperAdminUser,
  listAuthUsers,
  resolveSessionUser,
  SupabaseAuthError,
  type AuthRole,
  type SupabaseUser,
  updateAuthUserRole,
} from 'src/lib/supabase-auth';

const isEditableRole = (value: unknown): value is 'user' | 'admin' =>
  value === 'user' || value === 'admin';

const unwrapUser = (value: { user?: SupabaseUser } | SupabaseUser) =>
  'user' in value && value.user ? value.user : (value as SupabaseUser);

const serializeUser = (user: SupabaseUser) => ({
  id: user.id,
  email: user.email,
  displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email,
  photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  role: getUserRole(user),
  provider: user.app_metadata?.provider || 'email',
  createdAt: user.created_at,
  lastSignInAt: user.last_sign_in_at,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = await resolveSessionUser(req, res);
    if (!requester) return res.status(401).json({ message: 'Authentication required.' });
    if (!isSuperAdminUser(requester)) {
      return res.status(403).json({ message: 'Super Admin permission is required.' });
    }

    if (req.method === 'GET') {
      const result = await listAuthUsers();
      return res.status(200).json({ users: result.users.map(serializeUser) });
    }

    if (req.method === 'POST') {
      const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      const role = req.body?.role as AuthRole;

      if (!email || password.length < 8 || !isEditableRole(role)) {
        return res
          .status(400)
          .json({ message: 'Valid email, role, and 8-character password required.' });
      }

      const created = await createAuthUser(email, password, role);
      return res.status(201).json({ user: serializeUser(unwrapUser(created)) });
    }

    if (req.method === 'PATCH') {
      const userId = typeof req.body?.userId === 'string' ? req.body.userId : '';
      const role = req.body?.role as AuthRole;
      if (!userId || !isEditableRole(role)) {
        return res.status(400).json({ message: 'Valid user and role are required.' });
      }

      const target = unwrapUser(await getAuthUserById(userId));
      if (getUserRole(target) === 'super_admin') {
        return res.status(403).json({ message: 'Super Admin accounts cannot be changed here.' });
      }

      const updated = unwrapUser(await updateAuthUserRole(userId, role, target.app_metadata));
      return res.status(200).json({ user: serializeUser(updated) });
    }

    if (req.method === 'DELETE') {
      const userId = typeof req.query.userId === 'string' ? req.query.userId : '';
      if (!userId) return res.status(400).json({ message: 'User ID is required.' });
      if (userId === requester.id) {
        return res.status(400).json({ message: 'You cannot delete your own account.' });
      }

      const target = unwrapUser(await getAuthUserById(userId));
      if (getUserRole(target) === 'super_admin') {
        return res.status(403).json({ message: 'Super Admin accounts cannot be deleted here.' });
      }

      await deleteAuthUser(userId);
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/users]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
