import { Container, Typography } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import ArchitectureView from 'src/sections/architecture/view/architecture-view';

export const metadata = {
  title: 'Architecture us',
};

const ArchitecturePage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          วัดบ้านเหล่า - สุขธัมมาราม
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
