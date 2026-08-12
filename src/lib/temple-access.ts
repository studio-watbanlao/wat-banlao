import type { NextApiRequest, NextApiResponse } from 'next';

import type { SupabaseUser } from 'src/lib/supabase-auth';
import { getUserRole } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import {
  TEMPLE_MODULES,
  type Temple,
  type TempleAccess,
  type TempleAction,
  type TempleBranding,
  type TempleDomain,
  type TempleMemberRole,
  type TempleModule,
  type TemplePermissions,
} from 'src/types/temple';

export const TEMPLE_CONTEXT_COOKIE = 'wb_temple_id';
export const DEFAULT_TEMPLE_SLUG = process.env.DEFAULT_TEMPLE_SLUG || 'wat-banlao';

type TempleRow = {
  id: string;
  slug: string;
  name: string;
  status: Temple['status'];
  settings?: Record<string, unknown>;
};

type BrandingRow = {
  logo_url?: string;
  login_background_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  font_family?: string;
  admin_template?: string;
  public_template?: string;
  contact?: Record<string, unknown>;
};

type DomainRow = {
  id: string;
  domain: string;
  is_primary: boolean;
  ownership: TempleDomain['ownership'];
  verification_status: TempleDomain['verificationStatus'];
  registrar?: string;
  expires_at?: string;
};

type ModuleRow = { module_key: TempleModule; enabled: boolean };
type MembershipRow = {
  temple_id: string;
  role: TempleMemberRole;
  permissions?: TemplePermissions;
  status: 'ACTIVE' | 'SUSPENDED';
};

export class TempleAccessError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'TempleAccessError';
  }
}

const normalizeBranding = (row?: BrandingRow): TempleBranding => ({
  logoUrl: row?.logo_url || '',
  loginBackgroundUrl: row?.login_background_url || '',
  faviconUrl: row?.favicon_url || '',
  primaryColor: row?.primary_color || '#6F4E37',
  secondaryColor: row?.secondary_color || '#C89545',
  fontFamily: row?.font_family || '',
  adminTemplate: row?.admin_template || 'classic',
  publicTemplate: row?.public_template || 'custom',
  contact: row?.contact || {},
});

const normalizeDomain = (row: DomainRow): TempleDomain => ({
  id: row.id,
  domain: row.domain,
  isPrimary: row.is_primary,
  ownership: row.ownership,
  verificationStatus: row.verification_status,
  registrar: row.registrar,
  expiresAt: row.expires_at,
});

const emptyModules = () =>
  Object.fromEntries(TEMPLE_MODULES.map((module) => [module, false])) as Record<
    TempleModule,
    boolean
  >;

const hydrateTemple = async (row: TempleRow): Promise<Temple> => {
  const queryId = encodeURIComponent(row.id);
  const [brandingRows, moduleRows, domainRows] = await Promise.all([
    supabaseRequest<BrandingRow[]>(`temple_branding?select=*&temple_id=eq.${queryId}&limit=1`),
    supabaseRequest<ModuleRow[]>(`temple_modules?select=module_key,enabled&temple_id=eq.${queryId}`),
    supabaseRequest<DomainRow[]>(
      `temple_domains?select=*&temple_id=eq.${queryId}&order=is_primary.desc,domain.asc`
    ),
  ]);
  const modules = emptyModules();
  moduleRows.forEach((module) => {
    modules[module.module_key] = module.enabled;
  });
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    settings: row.settings || {},
    branding: normalizeBranding(brandingRows[0]),
    modules,
    domains: domainRows.map(normalizeDomain),
  };
};

export const getTempleById = async (id: string) => {
  const rows = await supabaseRequest<TempleRow[]>(
    `temples?select=*&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return rows[0] ? hydrateTemple(rows[0]) : null;
};

export const getTempleBySlug = async (slug: string) => {
  const rows = await supabaseRequest<TempleRow[]>(
    `temples?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`
  );
  return rows[0] ? hydrateTemple(rows[0]) : null;
};

export const getTempleByDomain = async (domain: string) => {
  const normalizedDomain = domain.toLowerCase().split(':')[0].replace(/^www\./, '');
  const domains = await supabaseRequest<Array<{ temple_id: string }>>(
    `temple_domains?select=temple_id&domain=eq.${encodeURIComponent(normalizedDomain)}&verification_status=eq.VERIFIED&limit=1`
  );
  return domains[0] ? getTempleById(domains[0].temple_id) : null;
};

export const listAllTemples = async () => {
  const rows = await supabaseRequest<TempleRow[]>('temples?select=*&order=name.asc');
  return Promise.all(rows.map(hydrateTemple));
};

const getMemberships = (userId: string) =>
  supabaseRequest<MembershipRow[]>(
    `temple_members?select=temple_id,role,permissions,status&user_id=eq.${encodeURIComponent(userId)}&status=eq.ACTIVE`
  );

export const listTempleAccessForUser = async (user: SupabaseUser): Promise<TempleAccess[]> => {
  if (getUserRole(user) === 'super_admin') {
    const temples = await listAllTemples();
    return temples.map((temple) => ({ temple, role: 'super_admin', permissions: {} }));
  }

  const memberships = await getMemberships(user.id);
  return Promise.all(
    memberships.map(async (membership) => {
      const temple = await getTempleById(membership.temple_id);
      if (!temple) throw new TempleAccessError('ไม่พบข้อมูลวัด', 404);
      return {
        temple,
        role: membership.role,
        permissions: {
          ...(membership.permissions || {}),
          dashboard: ['read'],
        },
      };
    })
  );
};

export const resolveTempleAccess = async (req: NextApiRequest, user: SupabaseUser) => {
  const accesses = await listTempleAccessForUser(user);
  if (!accesses.length) throw new TempleAccessError('บัญชีนี้ยังไม่ได้รับสิทธิ์จัดการวัด', 403);
  const requestedTempleId =
    (typeof req.headers['x-temple-id'] === 'string' ? req.headers['x-temple-id'] : '') ||
    req.cookies[TEMPLE_CONTEXT_COOKIE];
  const selected = requestedTempleId
    ? accesses.find((access) => access.temple.id === requestedTempleId)
    : accesses.find((access) => access.temple.status === 'ACTIVE');
  if (!selected) throw new TempleAccessError('ไม่มีสิทธิ์เข้าถึงวัดที่เลือก', 403);
  if (selected.temple.status !== 'ACTIVE') {
    throw new TempleAccessError('วัดนี้ยังไม่เปิดใช้งาน', 403);
  }
  return selected;
};

export const hasTemplePermission = (
  access: TempleAccess,
  module: TempleModule,
  action: TempleAction
) => {
  if (module === 'dashboard' && action === 'read') return true;
  if (!access.temple.modules[module]) return false;
  if (access.role === 'super_admin') return true;
  return access.permissions[module]?.includes(action) ?? false;
};

export const requireTemplePermission = async (
  req: NextApiRequest,
  user: SupabaseUser,
  module: TempleModule,
  action: TempleAction
) => {
  const access = await resolveTempleAccess(req, user);
  if (!hasTemplePermission(access, module, action)) {
    throw new TempleAccessError('ไม่มีสิทธิ์ดำเนินการในเมนูนี้', 403);
  }
  return access;
};

const actionForMethod = (method?: string): TempleAction => {
  if (method === 'POST') return 'create';
  if (method === 'PATCH' || method === 'PUT') return 'update';
  if (method === 'DELETE') return 'delete';
  return 'read';
};

export const requireTempleContentAccess = async (
  req: NextApiRequest,
  user: SupabaseUser,
  module: TempleModule
) => {
  const access = await requireTemplePermission(req, user, module, actionForMethod(req.method));
  if (
    (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') &&
    req.body?.status === 'PUBLIC' &&
    !hasTemplePermission(access, module, 'publish')
  ) {
    throw new TempleAccessError('ไม่มีสิทธิ์เผยแพร่ข้อมูล', 403);
  }
  return access;
};

export const contributorOwnerId = (access: TempleAccess, user: SupabaseUser) =>
  access.role === 'temple_contributor' ? user.id : undefined;

export const enforceContributorDraft = (access: TempleAccess, status: unknown) => {
  if (access.role === 'temple_contributor' && status !== 'DRAFT') {
    throw new TempleAccessError('Contributor บันทึกได้เฉพาะแบบร่าง กรุณาส่งให้ผู้ดูแลเผยแพร่', 403);
  }
};

export const setTempleContextCookie = (res: NextApiResponse, templeId: string) => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const cookie = `${TEMPLE_CONTEXT_COOKIE}=${encodeURIComponent(templeId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`;
  const existing = res.getHeader('Set-Cookie');
  const cookies = Array.isArray(existing) ? existing : existing ? [String(existing)] : [];
  res.setHeader('Set-Cookie', [...cookies, cookie]);
};

export const setPublicCacheControl = (
  req: NextApiRequest,
  res: NextApiResponse,
  cacheControl: string
) => {
  const hasPreviewTenant = typeof req.headers['x-temple-id'] === 'string';
  res.setHeader('Vary', 'Host, x-temple-id, x-temple-slug');
  res.setHeader(
    'Cache-Control',
    hasPreviewTenant ? 'private, no-store, max-age=0' : cacheControl
  );
};

export const resolvePublicTemple = async (req: NextApiRequest) => {
  const headerTempleId =
    typeof req.headers['x-temple-id'] === 'string' ? req.headers['x-temple-id'].trim() : '';
  if (headerTempleId) {
    const byId = await getTempleById(headerTempleId);
    if (byId?.status === 'ACTIVE') return byId;
  }

  const querySlug = typeof req.query.templeSlug === 'string' ? req.query.templeSlug : '';
  const headerSlug =
    typeof req.headers['x-temple-slug'] === 'string' ? req.headers['x-temple-slug'] : '';
  const configuredSlug = process.env.TEMPLE_SLUG || process.env.NEXT_PUBLIC_TEMPLE_SLUG;
  const explicitSlug = querySlug || headerSlug || configuredSlug;
  if (explicitSlug) {
    const bySlug = await getTempleBySlug(explicitSlug);
    if (bySlug?.status === 'ACTIVE') return bySlug;
  }
  const byDomain = await getTempleByDomain(req.headers.host || '');
  if (byDomain?.status === 'ACTIVE') return byDomain;
  const fallback = await getTempleBySlug(DEFAULT_TEMPLE_SLUG);
  if (fallback?.status === 'ACTIVE') return fallback;
  throw new TempleAccessError('ไม่พบเว็บไซต์วัดสำหรับ Domain นี้', 404);
};
