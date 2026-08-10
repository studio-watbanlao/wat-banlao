import { useQuery } from '@tanstack/react-query';

import { fetchSacred, fetchSacredById } from 'src/api/sacred';
import { SACRED_KEY } from '../key';

export const useGetSacred = () =>
  useQuery({
    queryKey: [SACRED_KEY],
    queryFn: fetchSacred,
    // staleTime: 1000 * 60 * 5,
  });

export const useGetSacredById = (id?: string) =>
  useQuery({
    queryKey: [SACRED_KEY, id],
    queryFn: () => fetchSacredById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
