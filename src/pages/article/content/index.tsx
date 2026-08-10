import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import { BlogView } from 'src/sections/article/blog/view';

export const metadata = {
  title: 'Blog',
};

const BlogPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <BlogView />
      </Container>
    </MainLayout>
  );
};
export default BlogPage;
