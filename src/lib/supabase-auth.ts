import type { NextApiRequest, NextApiResponse } from 'next';

export const ADMIN_ACCESS_COOKIE = 'wb_admin_access_token';
export const ADMIN_REFRESH_COOKIE = 'wb_admin_refresh_token';
export const ADMIN_ROLE_COOKIE = 'wb_admin_role';

export type AuthRole = 'user' | 'admin' | 'super_admin';

export type SupabaseUser = {
  id: string;
  email?: string;
  created_at?: string;
  last_sign_in_at?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: SupabaseUser;
};

export class SupabaseAuthError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'SupabaseAuthError';
  }
}

export const getAuthConfig = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const apiKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !apiKey) {
    throw new SupabaseAuthError(
      'Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.',
      503
    );
  }

  return { url, apiKey };
};

const authRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { url, apiKey } = getAuthConfig();
  const response = await fetch(`${url}/auth/v1/${path}`, {
    ...init,
    headers: {
      apikey: apiKey,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new SupabaseAuthError(
      body?.msg || body?.message || body?.error_description || 'Authentication failed.',
      response.status
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const signInAdmin = (email: string, password: string) =>
  authRequest<SupabaseSession>('token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const signInWithGoogleIdToken = (idToken: string) =>
  authRequest<SupabaseSession>('token?grant_type=id_token', {
    method: 'POST',
    body: JSON.stringify({ provider: 'google', id_token: idToken }),
  });

export const refreshAdminSession = (refreshToken: string) =>
  authRequest<SupabaseSession>('token?grant_type=refresh_token', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

export const getAuthUser = (accessToken: string) =>
  authRequest<SupabaseUser>('user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const signOutAdmin = (accessToken: string) =>
  authRequest<void>('logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

export const getUserRole = (user: SupabaseUser): AuthRole => {
  const role = user.app_metadata?.role;
  return role === 'admin' || role === 'super_admin' ? role : 'user';
};

export const isAdminUser = (user: SupabaseUser) =>
  ['admin', 'super_admin'].includes(getUserRole(user));

export const isSuperAdminUser = (user: SupabaseUser) => getUserRole(user) === 'super_admin';

export const toAdminUser = (user: SupabaseUser) => ({
  id: user.id,
  email: user.email,
  displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || user.email,
  photoURL: user.user_metadata?.avatar_url,
  role: getUserRole(user),
});

const serializeCookie = (name: string, value: string, maxAge: number) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const expires = maxAge === 0 ? '; Expires=Thu, 01 Jan 1970 00:00:00 GMT' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${expires}${secure}`;
};

export const setAdminSessionCookies = (res: NextApiResponse, session: SupabaseSession) => {
  res.setHeader('Set-Cookie', [
    serializeCookie(ADMIN_ACCESS_COOKIE, session.access_token, session.expires_in),
    serializeCookie(ADMIN_REFRESH_COOKIE, session.refresh_token, 60 * 60 * 24 * 30),
    serializeCookie(ADMIN_ROLE_COOKIE, getUserRole(session.user), 60 * 60 * 24 * 30),
  ]);
};

export const clearAdminSessionCookies = (res: NextApiResponse) => {
  res.setHeader('Set-Cookie', [
    serializeCookie(ADMIN_ACCESS_COOKIE, '', 0),
    serializeCookie(ADMIN_REFRESH_COOKIE, '', 0),
    serializeCookie(ADMIN_ROLE_COOKIE, '', 0),
  ]);
};

export const getAdminSessionTokens = (req: NextApiRequest) => ({
  accessToken: req.cookies[ADMIN_ACCESS_COOKIE],
  refreshToken: req.cookies[ADMIN_REFRESH_COOKIE],
});

export const resolveSessionUser = async (req: NextApiRequest, res: NextApiResponse) => {
  const { accessToken, refreshToken } = getAdminSessionTokens(req);
  let user = accessToken ? await getAuthUser(accessToken).catch(() => null) : null;

  if (!user && refreshToken) {
    const session = await refreshAdminSession(refreshToken);
    setAdminSessionCookies(res, session);
    user = session.user;
  }

  return user;
};

const getSecretConfig = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new SupabaseAuthError(
      'Supabase Admin is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.',
      503
    );
  }

  return { url, secretKey };
};

const adminRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { url, secretKey } = getSecretConfig();
  const headers = new Headers(init?.headers);
  headers.set('apikey', secretKey);
  headers.set('Content-Type', 'application/json');
  if (!secretKey.startsWith('sb_secret_')) {
    headers.set('Authorization', `Bearer ${secretKey}`);
  }
  const response = await fetch(`${url}/auth/v1/admin/${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new SupabaseAuthError(
      body?.msg || body?.message || 'Supabase Admin request failed.',
      response.status
    );
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const secretAuthRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { url, secretKey } = getSecretConfig();
  const headers = new Headers(init?.headers);
  headers.set('apikey', secretKey);
  headers.set('Authorization', `Bearer ${secretKey}`);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(`${url}/auth/v1/${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new SupabaseAuthError(
      body?.msg || body?.message || 'Supabase Auth request failed.',
      response.status
    );
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

export const listAuthUsers = (page = 1, perPage = 100) =>
  adminRequest<{ users: SupabaseUser[] }>(`users?page=${page}&per_page=${perPage}`);

export const getAuthUserById = (userId: string) =>
  adminRequest<{ user?: SupabaseUser } | SupabaseUser>(`users/${encodeURIComponent(userId)}`);

export const createAuthUser = (
  email: string,
  password: string,
  role: Exclude<AuthRole, 'super_admin'>
) =>
  adminRequest<SupabaseUser>('users', {
    method: 'POST',
    body: JSON.stringify({ email, password, email_confirm: true, app_metadata: { role } }),
  });

export const updateAuthUserRole = (
  userId: string,
  role: Exclude<AuthRole, 'super_admin'>,
  currentAppMetadata: Record<string, unknown> = {}
) =>
  adminRequest<{ user?: SupabaseUser } | SupabaseUser>(`users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify({ app_metadata: { ...currentAppMetadata, role } }),
  });

export const updateAuthUserMetadata = (userId: string, userMetadata: Record<string, unknown>) =>
  adminRequest<{ user?: SupabaseUser } | SupabaseUser>(`users/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    body: JSON.stringify({ user_metadata: userMetadata }),
  });

export const deleteAuthUser = (userId: string) =>
  adminRequest<void>(`users/${encodeURIComponent(userId)}`, { method: 'DELETE' });

export const inviteAuthUserByEmail = (
  email: string,
  redirectTo: string,
  data: Record<string, unknown>
) =>
  secretAuthRequest<{ user?: SupabaseUser } | SupabaseUser>(
    `invite?redirect_to=${encodeURIComponent(redirectTo)}`,
    { method: 'POST', body: JSON.stringify({ email, data }) }
  );

export const updateCurrentAuthPassword = (accessToken: string, password: string) =>
  authRequest<SupabaseUser>('user', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ password }),
  });
