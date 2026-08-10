import { Container, Typography } from '@mui/material';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import LuangPuSaView from 'src/sections/parents/view/luang-pu-sa-view';

export const metadata = {
  title: 'Activity',
};

const LuangPuSaPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          บูรพาจารย์
        </Typography>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          หลวงปู่สาธุ์ สุขธมฺโม
        </Typography>

        <LuangPuSaView />
      </Container>
    </MainLayout>
  );
};

export default LuangPuSaPage;
