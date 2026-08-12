import { useQuery } from '@tanstack/react-query';

import type { TempleDirectoryEntry } from 'src/types/temple-directory';
import axios from 'src/utils/axios';

export function usePublicTempleDirectory() {
  return useQuery({
    queryKey: ['public-temple-directory'],
    queryFn: async () => {
      const response = await axios.get<{ entries: TempleDirectoryEntry[] }>(
        '/api/public/directory'
      );
      return response.data.entries;
    },
    staleTime: 5 * 60 * 1000,
  });
}
