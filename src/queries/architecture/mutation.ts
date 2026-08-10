import { useMutation } from '@tanstack/react-query';
import { postArchitectureById } from 'src/api/architecture';

export const usePostArchitecture = () =>
  useMutation({ mutationFn: (id: string) => postArchitectureById(id) });
