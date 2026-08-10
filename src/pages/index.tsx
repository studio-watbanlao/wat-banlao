import { SplashScreen } from 'src/components/loading-screen';
import MataData from 'src/components/mata-data/mata-data';
import MainLayout from 'src/layouts/main';
import { useGetExample } from 'src/queries/example';
import { HomeView } from 'src/sections/home/view';

const HomePage = () => {
  const { data, error, isLoading } = useGetExample();

  if (isLoading) return <SplashScreen />;

  if (error instanceof Error) return <div>Error: {error.message}</div>;

  return (
    <MainLayout>
      <MataData />
      <HomeView />
    </MainLayout>
  );
};

export default HomePage;
