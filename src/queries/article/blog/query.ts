import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { InfiniteData } from '@tanstack/react-query';
import { fetchBlog, fetchBlogById } from 'src/api/blog';
import { usePublicTenantKey } from 'src/public-templates/use-public-tenant-key';
import type { EditorialItem } from 'src/types/editorial';
import { ARRICLE_KEY } from '../../key';

export type IBlog = EditorialItem;

interface IBlogPage {
  items: IBlog[];
  nextPage?: number;
}

const PAGE_SIZE = 8;

export const useGetBlog = (): UseInfiniteQueryResult<InfiniteData<IBlogPage>, Error> => {
  const tenantKey = usePublicTenantKey();
  return useInfiniteQuery<IBlogPage, Error>({
    queryKey: [ARRICLE_KEY, tenantKey, 'blog-list'],
    queryFn: async ({ pageParam = 1 }) => {
      const page = Number(pageParam);

      const allData = await fetchBlog();

      const start = (page - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE;

      const items = allData.slice(start, end);

      return {
        items,
        nextPage: end < allData.length ? page + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};

export const useGetBlogById = (id?: string): UseQueryResult<IBlog, Error> => {
  const tenantKey = usePublicTenantKey();
  return useQuery<IBlog, Error>({
    queryKey: [ARRICLE_KEY, tenantKey, 'blog-detail', id],

    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      const item = await fetchBlogById(id);
      if (!item) throw new Error('ไม่พบบทความ');
      return item;
    },

    enabled: Boolean(id),

    staleTime: 1000 * 60 * 5,
  });
};
