import MainLayout from 'src/layouts/main';
import ComingSoonView from 'src/sections/coming-soon/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'Coming Soon',
};

export default function ComingSoonPage() {
  return (
    <MainLayout>
      <ComingSoonView />
    </MainLayout>
  );
}
