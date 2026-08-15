import { useQuery } from '@tanstack/react-query';

import { fetchSacred, fetchSacredById } from 'src/api/sacred';
import { usePublicTenantKey } from 'src/hooks/use-public-tenant-key';
import { SACRED_KEY } from '../key';

export const useGetSacred = () => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [SACRED_KEY, tenantKey],
    queryFn: fetchSacred,
    // staleTime: 1000 * 60 * 5,
  });
};

export const useGetSacredById = (id?: string) => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [SACRED_KEY, tenantKey, id],
    queryFn: () => fetchSacredById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
};
