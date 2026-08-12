const PUBLIC_API_PREFIXES = ['/api/public/', '/api/content/'];
const PUBLIC_PREVIEW_PATH = '/dashboard/templates/preview';

export const isPublicPreviewPath = (pathname: string) =>
  pathname.replace(/\/+$/, '') === PUBLIC_PREVIEW_PATH;

export const isPublicTenantRequest = (url?: string) =>
  Boolean(url && PUBLIC_API_PREFIXES.some((prefix) => url.startsWith(prefix)));

export const getPublicPreviewTempleId = () => {
  if (typeof window === 'undefined') return '';
  if (!isPublicPreviewPath(window.location.pathname)) return '';

  return new URLSearchParams(window.location.search).get('templeId')?.trim() || '';
};

export const withPublicTenantHeader = (headers?: HeadersInit) => {
  const nextHeaders = new Headers(headers);
  const templeId = getPublicPreviewTempleId();

  if (templeId) nextHeaders.set('x-temple-id', templeId);

  return nextHeaders;
};
