import { Container } from '@mui/material';

import { fetchFastivalById } from 'src/api/fastival';
import { CONFIG } from 'src/config-global';
import { DEFAULT_CONTENT_IMAGE } from 'src/constants/images';
import { MainLayout } from 'src/layouts/main';
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

  const ogImage = data?.imageUrl || DEFAULT_CONTENT_IMAGE;

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
