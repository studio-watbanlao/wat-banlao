import { useQuery } from '@tanstack/react-query';

import { fetchBanner } from 'src/api/banner';
import { usePublicTenantKey } from 'src/public-templates/use-public-tenant-key';
import { BANNER_KEY } from '../key';

export const useGetBanner = () => {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: [BANNER_KEY, tenantKey],
    queryFn: fetchBanner,
    staleTime: 1000 * 60 * 1,
  });
};
