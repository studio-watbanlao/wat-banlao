import type { GetServerSideProps } from 'next';

export default function LegacyArticleIndexPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: {
    destination: '/article/blog',
    permanent: true,
  },
});
