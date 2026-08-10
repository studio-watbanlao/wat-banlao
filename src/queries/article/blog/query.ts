import {
  useInfiniteQuery,
  useQuery,
  type UseInfiniteQueryResult,
  type UseQueryResult,
} from '@tanstack/react-query';

import type { InfiniteData } from '@tanstack/react-query';
import { fetchBlog, fetchBlogById } from 'src/api/blog';
import { ARRICLE_KEY } from '../../key';

export interface IBlog {
  id: string;
  title: string;
  content: string;
  createdDate: string;
  type: string;
  imageUrl: string;
  description: string;
  authorImageUrl: string;
  author: string;
  view: string | undefined;
}

interface IBlogPage {
  items: IBlog[];
  nextPage?: number;
}

const PAGE_SIZE = 8;

export const useGetBlog = (): UseInfiniteQueryResult<InfiniteData<IBlogPage>, Error> =>
  useInfiniteQuery<IBlogPage, Error>({
    queryKey: [ARRICLE_KEY, 'dharma-list'],
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

export const useGetBlogById = (id?: string): UseQueryResult<IBlog, Error> =>
  useQuery<IBlog, Error>({
    queryKey: [ARRICLE_KEY, 'dharma-detail', id],

    queryFn: async () => {
      if (!id) throw new Error('ID is required');
      return fetchBlogById(id);
    },

    enabled: Boolean(id),

    staleTime: 1000 * 60 * 5,
  });
