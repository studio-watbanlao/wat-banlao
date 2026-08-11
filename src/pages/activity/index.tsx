'use client';

import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import { ActivityView } from 'src/sections/activity/view';

export const metadata = {
  title: 'Activity',
};

const ActivityPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <ActivityView />
      </Container>
    </MainLayout>
  );
};

export default ActivityPage;
