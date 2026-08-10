import { useQuery } from '@tanstack/react-query';

import { fetchActivity, fetchActivityById } from 'src/api/activity';
import { ACTIVITY_KEY } from '../key';

export const useGetActivity = () =>
  useQuery({
    queryKey: [ACTIVITY_KEY],
    queryFn: fetchActivity,
    // staleTime: 1000 * 60 * 5,
  });

export const useGetActivityById = (id?: string) =>
  useQuery({
    queryKey: [ACTIVITY_KEY, id],
    queryFn: () => fetchActivityById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
