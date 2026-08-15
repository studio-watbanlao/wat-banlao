import { useQuery } from '@tanstack/react-query';

import { fetchArchitecture, fetchArchitectureById } from 'src/api/architecture';
import { usePublicTenantKey } from 'src/hooks/use-public-tenant-key';
import { ARCHITECTURE_KEY } from '../key';

export const useGetArchitecture = () => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [ARCHITECTURE_KEY, tenantKey],
    queryFn: fetchArchitecture,
    // staleTime: 1000 * 60 * 5,
  });
};

export const useGetArchitectureById = (id?: string) => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [ARCHITECTURE_KEY, tenantKey, id],
    queryFn: () => fetchArchitectureById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
};
