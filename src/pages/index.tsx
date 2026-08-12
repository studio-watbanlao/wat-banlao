import { SplashScreen } from 'src/components/loading-screen';
import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { useGetExample } from 'src/queries/example';
import { HomeView } from 'src/sections/home/view';
import { ManagedPageOverride } from 'src/sections/temple-page/temple-page-view';
import { getErrorMessage } from 'src/utils/error-message';

const HomePage = () => {
  const { error, isLoading } = useGetExample();

  if (isLoading) return <SplashScreen />;

  if (error) return <div>{getErrorMessage(error, 'ไม่สามารถโหลดหน้าเว็บไซต์ได้')}</div>;

  return (
    <ManagedPageOverride pageKey="home"><MainLayout>
      <MataData />
      <HomeView />
    </MainLayout></ManagedPageOverride>
  );
};

export default HomePage;
