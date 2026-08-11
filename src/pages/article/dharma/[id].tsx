import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import DharmaDetailsView from 'src/sections/article/dharma/dharma-detail-view';

const DharmaDetailPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <DharmaDetailsView />
      </Container>
    </MainLayout>
  );
};

export default DharmaDetailPage;
