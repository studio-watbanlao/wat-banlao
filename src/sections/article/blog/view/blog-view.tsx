import { Stack, Typography } from '@mui/material';

import BlogList from '../blog-list';

import { usePublicTemple } from 'src/hooks/use-public-temple';

const BlogView = () => {
  const { data: temple } = usePublicTemple();

  return (
    <Stack>
      <Typography align="center" sx={{ color: 'text.secondary' }}>
        {temple?.name || ''}
      </Typography>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        บทความ
      </Typography>
      <BlogList />
    </Stack>
  );
};

export default BlogView;
