import { useQuery } from '@tanstack/react-query';

import { fetchBanner } from 'src/api/banner';
import { BANNER_KEY } from '../key';

export const useGetBanner = () =>
  useQuery({
    queryKey: [BANNER_KEY],
    queryFn: fetchBanner,
    staleTime: 1000 * 60 * 1,
  });
