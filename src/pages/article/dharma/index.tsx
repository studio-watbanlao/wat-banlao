import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import DharmaView from 'src/sections/article/dharma/view/dharma-view';

export const metadata = {
  title: 'Article - Dharma',
};

const DharmaPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <DharmaView />
      </Container>
    </MainLayout>
  );
};
export default DharmaPage;
