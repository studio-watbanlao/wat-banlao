import { useMutation } from '@tanstack/react-query';
import { postFastivalById } from 'src/api/fastival';

export const usePostFastival = () => {
  return useMutation({
    mutationFn: (id: string) => postFastivalById(id),
  });
};
