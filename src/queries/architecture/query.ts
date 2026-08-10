import { useQuery } from '@tanstack/react-query';

import { fetchArchitecture, fetchArchitectureById } from 'src/api/architecture';
import { ARCHITECTURE_KEY } from '../key';

export const useGetArchitecture = () =>
  useQuery({
    queryKey: [ARCHITECTURE_KEY],
    queryFn: fetchArchitecture,
    // staleTime: 1000 * 60 * 5,
  });

export const useGetArchitectureById = (id?: string) =>
  useQuery({
    queryKey: [ARCHITECTURE_KEY, id],
    queryFn: () => fetchArchitectureById(id),
    enabled: !!id, // ป้องกัน query ตอน id undefined
  });
