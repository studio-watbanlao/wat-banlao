import { usePublicTemple } from './use-public-temple';

export function usePublicTenantKey() {
  const { data: temple } = usePublicTemple();

  return temple?.id || 'domain';
}
