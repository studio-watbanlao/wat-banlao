import { useEffect } from 'react';
import Box from '@mui/material/Box';

import { useAuthContext } from 'src/auth/hooks';
import { SplashScreen } from 'src/components/loading-screen';
import useRouteChangeLoader from 'src/hooks/use-route-change-loader';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import Footer from './footer';
import Header from './header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const router = useRouter();
  const { loading: authLoading, user } = useAuthContext();
  const loading = useRouteChangeLoader();

  useEffect(() => {
    if (['admin', 'super_admin'].includes(user?.role)) router.replace(paths.dashboard.root);
  }, [router, user?.role]);

  if (authLoading || ['admin', 'super_admin'].includes(user?.role)) return <SplashScreen />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, md: 15 },
        }}
      >
        {loading ? <SplashScreen /> : children}
      </Box>

      <Footer />
    </Box>
  );
};
export default MainLayout;
