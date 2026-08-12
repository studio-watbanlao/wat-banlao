import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { SplashScreen } from 'src/components/loading-screen';
import { MainLayout } from 'src/layouts/main';
import { usePublicTemple } from 'src/public-templates/use-public-temple';
import { HomeView } from 'src/sections/home/view';
import { getErrorMessage } from 'src/utils/error-message';

export default function PublicTemplatePreviewPage() {
  const { error, isLoading } = usePublicTemple();

  if (isLoading) return <SplashScreen />;

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{getErrorMessage(error, 'ไม่สามารถโหลดหน้า Preview ได้')}</Alert>
      </Box>
    );
  }

  return (
    <MainLayout>
      <HomeView />
    </MainLayout>
  );
}
