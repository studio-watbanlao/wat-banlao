'use client';

import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import SacredView from 'src/sections/parents/sacred/view/sacred-view';

export const metadata = {
  title: 'Sacred',
};

const SacredPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <SacredView />
      </Container>
    </MainLayout>
  );
};

export default SacredPage;
