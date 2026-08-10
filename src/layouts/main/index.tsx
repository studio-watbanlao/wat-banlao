import Box from '@mui/material/Box';

import { SplashScreen } from 'src/components/loading-screen';
import useRouteChangeLoader from 'src/hooks/use-route-change-loader';
import { usePathname } from 'src/routes/hooks';
import Footer from './footer';
import Header from './header';

type MainLayoutProps = {
  children: React.ReactNode;
};

const MainLayout = ({ children }: MainLayoutProps) => {
  const pathname = usePathname();
  const loading = useRouteChangeLoader();
  const homePage = pathname === '/';

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
