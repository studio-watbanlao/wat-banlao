import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { InfiniteData } from '@tanstack/react-query';
import { fetchBlog, fetchBlogById } from 'src/api/blog';
import { ARRICLE_KEY } from '../../key';

export interface IDharma {
  id: string;
  title: string;
  content: string;
  createdDate: string;
  type: string;
  imageUrl: string;
  description: string;
  authorImageUrl: string;
  author: string;
}

interface IDharmaPage {
  items: IDharma[];
  nextPage?: number;
}

const PAGE_SIZE = 8;

export const useGetDharma = (): UseInfiniteQueryResult<InfiniteData<IDharmaPage>, Error> =>
  useInfiniteQuery<IDharmaPage, Error>({
    queryKey: [ARRICLE_KEY, 'dharma-list'],
    queryFn: async ({ pageParam = 1 }) => {
      const page = Number(pageParam);

      // Fetch all blog items
      const allData = await fetchBlog();

      console.log('allData', allData);

      // Filter only items with type "dharma"
      const dharmaData = allData.filter((item: any) => item.type === 'dharma');

      // Pagination
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

export const useGetBlogById = (id?: string): UseQueryResult<IDharma, Error> =>
  useQuery<IDharma, Error>({
    queryKey: [ARRICLE_KEY, 'dharma-detail', id],

    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      return fetchBlogById(id);
    },

    enabled: Boolean(id),

    staleTime: 1000 * 60 * 5,
  });
