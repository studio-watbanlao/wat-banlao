import { useMutation } from '@tanstack/react-query';
import { postActivityById } from 'src/api/activity';

export const usePostActivity = () => {
  return useMutation({
    mutationFn: (id: string) => postActivityById(id),
  });
};
