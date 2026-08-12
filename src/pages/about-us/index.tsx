import { Container } from '@mui/system';

import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import AboutUsView from 'src/sections/about-us/view/about-us-view';
import { ManagedPageOverride } from 'src/sections/temple-page/temple-page-view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'About us',
};

export default function AboutPage() {
  return (
    <ManagedPageOverride pageKey="about"><MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <AboutUsView />
      </Container>
    </MainLayout></ManagedPageOverride>
  );
}
