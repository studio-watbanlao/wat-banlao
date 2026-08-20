import { Container, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import LuangPuPramuanView from 'src/sections/parents/view/luang-pu-pramuan-view';
import { ManagedPageOverride } from 'src/sections/temple-page/temple-page-view';

export const metadata = {
  title: 'LuangPu Pramuan',
};

const LuangPuPramuanPage = () => {
  return (
    <ManagedPageOverride pageKey="luang-pu-pramuan">
      <MainLayout>
        <Container
          maxWidth={false}
          sx={{
            py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
          }}
        >
          <Typography align="center" sx={{ color: 'text.secondary' }}>
            บูรพาจารย์
          </Typography>
          <Typography variant="h3" align="center" sx={{ mb: 2 }}>
            หลวงปู่ประมวล ญาณวโร
          </Typography>

          <LuangPuPramuanView />
        </Container>
      </MainLayout>
    </ManagedPageOverride>
  );
};
export default LuangPuPramuanPage;
