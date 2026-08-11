import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Layout from 'src/pages/dashboard/layout';
import BannerFormPage from 'src/sections/admin/banner-form-page';
import type { BannerItem } from 'src/types/banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

export const metadata = {
  title: 'แก้ไข Banner',
};

export default function EditBannerPage() {
  const router = useRouter();
  const [banner, setBanner] = useState<BannerItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || typeof router.query.id !== 'string') return;

    const loadBanner = async () => {
      try {
        setError('');
        const response = await axios.get('/api/admin/banners');
        const selectedBanner = (response.data.banners as BannerItem[]).find(
          (item) => item.id === router.query.id
        );

        if (!selectedBanner) throw new Error('ไม่พบ Banner ที่ต้องการแก้ไข');
        setBanner(selectedBanner);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    };

    loadBanner();
  }, [router.isReady, router.query.id]);

  if (banner) return <BannerFormPage banner={banner} />;

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">แก้ไข Banner</Typography>
          {error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <Typography color="text.secondary">กำลังโหลด...</Typography>
          )}
        </Stack>
      </Container>
    </Layout>
  );
}
