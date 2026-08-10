import { Stack, Typography } from '@mui/material';
import BlogList from '../blog-list';

const BlogView = () => {
  return (
    <Stack>
      <Typography align="center" sx={{ color: 'text.secondary' }}>
        วัดบ้านเหล่า - สุขธัมมาราม
      </Typography>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        บทความ
      </Typography>
      <BlogList />
    </Stack>
  );
};

export default BlogView;
