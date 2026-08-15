import { useQuery } from '@tanstack/react-query';

import { fetchActivity, fetchActivityById } from 'src/api/activity';
import { usePublicTenantKey } from 'src/hooks/use-public-tenant-key';
import { ACTIVITY_KEY } from '../key';

export const useGetActivity = () => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [ACTIVITY_KEY, tenantKey],
    queryFn: fetchActivity,
    // staleTime: 1000 * 60 * 5,
  });
};

export const useGetActivityById = (id?: string) => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [ACTIVITY_KEY, tenantKey, id],
    queryFn: () => fetchActivityById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
};
