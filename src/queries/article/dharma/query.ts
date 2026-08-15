import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { InfiniteData } from '@tanstack/react-query';
import { fetchDharma, fetchDharmaById } from 'src/api/dharma';
import { usePublicTenantKey } from 'src/hooks/use-public-tenant-key';
import type { EditorialItem } from 'src/types/editorial';
import { ARRICLE_KEY } from '../../key';

export type IDharma = EditorialItem;

interface IDharmaPage {
  items: IDharma[];
  nextPage?: number;
}

const PAGE_SIZE = 8;

export const useGetDharma = (): UseInfiniteQueryResult<InfiniteData<IDharmaPage>, Error> => {
  const tenantKey = usePublicTenantKey();
  return useInfiniteQuery<IDharmaPage, Error>({
    queryKey: [ARRICLE_KEY, tenantKey, 'dharma-list'],
    queryFn: async ({ pageParam = 1 }) => {
      const page = Number(pageParam);

      const dharmaData = await fetchDharma();
      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;
      const items = dharmaData.slice(start, end);

      return {
        items,
        nextPage: end < dharmaData.length ? page + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

export const useGetDharmaById = (id?: string): UseQueryResult<IDharma, Error> => {
  const tenantKey = usePublicTenantKey();
  return useQuery<IDharma, Error>({
    queryKey: [ARRICLE_KEY, tenantKey, 'dharma-detail', id],

    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const item = await fetchDharmaById(id);
      if (!item) throw new Error('ไม่พบธรรมะ');
      return item;
    },

    enabled: Boolean(id),

    staleTime: 1000 * 60 * 5,
  });
};
