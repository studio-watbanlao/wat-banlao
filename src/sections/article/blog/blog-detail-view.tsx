import { useParams } from 'next/navigation';
import { useEffect } from 'react';

import { useGetBlogById } from 'src/queries/article/blog';
import { usePostBlog } from 'src/queries/article/blog/mutation';
import { paths } from 'src/routes/paths';
import EditorialDetailContent from '../editorial-detail-content';

const BlogDetailsView = () => {
  const params = useParams();
  const id = params?.id as string;
  const { data, isLoading } = useGetBlogById(id);
  const { mutate } = usePostBlog();

  useEffect(() => {
    if (id) mutate(id);
  }, [id, mutate]);

  return (
    <EditorialDetailContent
      data={data}
      isLoading={isLoading}
      sectionName="บทความ"
      sectionPath={paths.article.blog.root}
    />
  );
};

export default BlogDetailsView;
