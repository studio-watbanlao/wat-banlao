import { useMutation } from '@tanstack/react-query';
import { postSacredById } from 'src/api/sacred';

export const usePostSacred = () => {
  return useMutation({
    mutationFn: (id: string) => postSacredById(id),
  });
};
