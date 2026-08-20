import type { GetServerSideProps } from 'next';

export default function LegacyArticleDetailPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => ({
  redirect: {
    destination: `/article/blog/${encodeURIComponent(String(params?.id || ''))}`,
    permanent: true,
  },
});
