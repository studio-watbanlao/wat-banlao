import { useRouter } from 'next/router';

export function usePublicTenantKey() {
  const router = useRouter();
  const templeId = typeof router.query.templeId === 'string' ? router.query.templeId : '';

  return router.pathname === '/dashboard/templates/preview' && templeId
    ? `preview:${templeId}`
    : 'domain';
}
