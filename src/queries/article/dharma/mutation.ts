import { useMutation } from '@tanstack/react-query';
import { postDharmaById } from 'src/api/dharma';

export const usePostDharma = () => {
  return useMutation({
    mutationFn: (id: string) => postDharmaById(id),
  });
};
