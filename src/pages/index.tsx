import type { GetServerSideProps } from 'next';
import type { NextApiRequest } from 'next';

import MataData from 'src/components/mata-data/mata-data';
import { MainLayout } from 'src/layouts/main';
import { resolvePublicTemple } from 'src/lib/temple-access';
import type { PublicTempleConfig } from 'src/public-templates/use-public-temple';
import { HomeView } from 'src/sections/home/view';
import { ManagedPageOverride } from 'src/sections/temple-page/temple-page-view';

const HomePage = () => {
  return (
    <ManagedPageOverride pageKey="home">
      <MainLayout>
        <MataData />
        <HomeView />
      </MainLayout>
    </ManagedPageOverride>
  );
};

export default HomePage;

export const getServerSideProps: GetServerSideProps<{
  publicTemple?: PublicTempleConfig;
}> = async ({ req, res }) => {
  try {
    const temple = await resolvePublicTemple(req as NextApiRequest);
    const publicTemple: PublicTempleConfig = {
      id: temple.id,
      slug: temple.slug,
      name: temple.name,
      branding: temple.branding,
      primaryDomain: temple.domains.find((domain) => domain.isPrimary)?.domain || '',
    };

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return { props: { publicTemple } };
  } catch {
    return { props: {} };
  }
};
