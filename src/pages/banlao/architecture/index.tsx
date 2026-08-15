import { Container, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import ArchitectureView from 'src/sections/architecture/view/architecture-view';

export const metadata = {
  title: 'Architecture us',
};

const ArchitecturePage = () => {
  const { data: temple } = usePublicTemple();

  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          {temple?.name || ''}
        </Typography>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          สถาปัตย์และสิ่งสำคัญ
        </Typography>

        <ArchitectureView />
      </Container>
    </MainLayout>
  );
};
export default ArchitecturePage;
