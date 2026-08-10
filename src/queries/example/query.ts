import { useQuery } from '@tanstack/react-query';

import { fetchExample } from 'src/api/example';
import { EXAMPLE_KEY } from '../key';

export const useGetExample = () =>
  useQuery({
    queryKey: [EXAMPLE_KEY],
    queryFn: fetchExample,
  });
