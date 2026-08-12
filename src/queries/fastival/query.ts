import { useQuery } from '@tanstack/react-query';

import { fetchFastival, fetchFastivalById } from 'src/api/fastival';
import { usePublicTenantKey } from 'src/public-templates/use-public-tenant-key';
import { FASTIVAL_KEY } from '../key';

export const useGetFastival = () => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [FASTIVAL_KEY, tenantKey],
    queryFn: fetchFastival,
    // staleTime: 1000 * 60 * 5,
  });
};

export const useGetFastivalById = (id?: string) => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [FASTIVAL_KEY, tenantKey, id],
    queryFn: () => fetchFastivalById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
};
