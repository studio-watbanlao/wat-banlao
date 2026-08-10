import { useMutation } from '@tanstack/react-query';
import { postBlogById } from 'src/api/blog';

export const usePostBlog = () => {
  return useMutation({
    mutationFn: (id: string) => postBlogById(id),
  });
};
