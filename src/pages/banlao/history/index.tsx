import { Container, Typography, useTheme } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import { HistoryView } from 'src/sections/history/view';
import { ManagedPageOverride } from 'src/sections/temple-page/temple-page-view';

export const metadata = {
  title: 'History us',
};

const HistoryPage = () => {
  const theme = useTheme();
  return (
    <ManagedPageOverride pageKey="history">
      <MainLayout>
        <Container
          maxWidth={false}
          sx={{
            py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
          }}
        >
          <Typography align="center" sx={{ color: 'text.secondary' }}>
            ประวัติความเป็นมา
          </Typography>
          <Typography variant="h3" color={theme.palette.primary.main} align="center" sx={{ mb: 2 }}>
            วัดบ้านเหล่า - สุขธัมมาราม
          </Typography>
          <HistoryView />
        </Container>
      </MainLayout>
    </ManagedPageOverride>
  );
};
export default HistoryPage;
