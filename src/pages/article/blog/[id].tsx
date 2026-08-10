import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import BlogDetailsView from 'src/sections/article/blog/blog-detail-view';

const BlogDetailPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <BlogDetailsView />
      </Container>
    </MainLayout>
  );
};

export default BlogDetailPage;
