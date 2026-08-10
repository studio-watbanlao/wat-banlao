import { Container } from '@mui/material';
import { fetchFastivalById } from 'src/api/fastival';
import { CONFIG } from 'src/config-global';
import MainLayout from 'src/layouts/main';
import FastivalDetailsView from 'src/sections/fastival/fastival-detail-view';

export const dynamic = 'force-dynamic';

export function extractFirstImage(html?: string) {
  if (!html) return null;

  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const id = params?.id;

  const data = await fetchFastivalById(id);

  if (!data) {
    return {
      title: 'ไม่พบข้อมูล',
      description: 'ไม่พบรายละเอียดเทศกาล',
    };
  }

  const ogImage =
    data?.imageUrl ||
    'https://imagedelivery.net/EEuP_or275XVr8IHP_-n6Q/06be70c1-e5c2-4e43-d23d-878e656e4700/public';

  return {
    title: data.title,
    description: data.description,

    openGraph: {
      title: data.title,
      description: data.description,
      url: `${CONFIG.websiteUrl}/fastival/${id}`, // ✅ ใช้ id ตรงนี้
      type: 'article',
      images: [
        {
          url: `${ogImage}?v=${data.updatedAt || Date.now()}`,
          width: 1200,
          height: 630,
          alt: `${data.title} - รายละเอียดเทศกาลงานบุญวัดบ้านเหล่า`,
        },
      ],
    },

    other: {
      'fb:app_id': '2621251964970311',
    },

    twitter: {
      card: 'summary_large_image',
      images: [`${ogImage}?v=${data.updatedAt || Date.now()}`],
    },
  };
}
const FastivalDetailPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <FastivalDetailsView />
      </Container>
    </MainLayout>
  );
};

export default FastivalDetailPage;
