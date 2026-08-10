import { useQuery } from '@tanstack/react-query';

import { fetchFastival, fetchFastivalById } from 'src/api/fastival';
import { FASTIVAL_KEY } from '../key';

export const useGetFastival = () =>
  useQuery({
    queryKey: [FASTIVAL_KEY],
    queryFn: fetchFastival,
    // staleTime: 1000 * 60 * 5,
  });

export const useGetFastivalById = (id?: string) =>
  useQuery({
    queryKey: [FASTIVAL_KEY, id],
    queryFn: () => fetchFastivalById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
