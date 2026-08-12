import type { ContentResource } from 'src/lib/supabase-rest';
import { withPublicTenantHeader } from 'src/utils/public-tenant';

type ApiResponse<T> = { data: T };

const getApiOrigin = () => {
  if (typeof window !== 'undefined') return '';

  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  throw new Error('Set SITE_URL when calling the internal content API on the server.');
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${getApiOrigin()}${path}`, {
    ...init,
    headers: withPublicTenantHeader(init?.headers),
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `Content API request failed (${response.status}).`);
  }

  return (body as ApiResponse<T>).data;
};

export const fetchContentList = <T = any>(resource: ContentResource) =>
  request<T[]>(`/api/content/${resource}`);

export const fetchContentById = <T = any>(resource: ContentResource, id?: string) => {
  if (!id) return Promise.resolve(null);
  return request<T>(`/api/content/${resource}/${encodeURIComponent(id)}`);
};

export const postContentView = <T = any>(resource: ContentResource, id: string) =>
  request<T>(`/api/content/${resource}/${encodeURIComponent(id)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'increment_view' }),
  });
