import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import SacredDetailsView from 'src/sections/parents/sacred/sacred-detail-view';

const SacredDetailPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <SacredDetailsView />
      </Container>
    </MainLayout>
  );
};

export default SacredDetailPage;
