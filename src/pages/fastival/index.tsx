'use client';

import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import { FastivalView } from 'src/sections/fastival/view';

export const metadata = {
  title: 'Fastival',
};

const ActivityPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <FastivalView />
      </Container>
    </MainLayout>
  );
};

export default ActivityPage;
