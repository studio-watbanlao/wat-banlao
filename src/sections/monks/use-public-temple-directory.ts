import { useQuery } from '@tanstack/react-query';

import { usePublicTenantKey } from 'src/public-templates/use-public-tenant-key';
import type { TempleDirectoryEntry } from 'src/types/temple-directory';
import axios from 'src/utils/axios';

export function usePublicTempleDirectory() {
  const tenantKey = usePublicTenantKey();
  return useQuery({
    queryKey: ['public-temple-directory', tenantKey],
    queryFn: async () => {
      const response = await axios.get<{ entries: TempleDirectoryEntry[] }>(
        '/api/public/directory'
      );
      return response.data.entries;
    },
    staleTime: 5 * 60 * 1000,
  });
}
