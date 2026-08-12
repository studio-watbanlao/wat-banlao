import type { GetServerSideProps } from 'next';

import { paths } from 'src/routes/paths';

export default function CommunityIndexPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: paths.community.communityHistory,
    permanent: false,
  },
});
