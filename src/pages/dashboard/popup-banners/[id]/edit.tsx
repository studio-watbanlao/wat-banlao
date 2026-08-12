import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import Layout from 'src/pages/dashboard/layout';
import PopupBannerFormPage from 'src/sections/admin/popup-banner-form-page';
import type { PopupBannerItem } from 'src/types/popup-banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

export default function EditPopupBannerPage() {
  const router = useRouter();
  const [popupBanner, setPopupBanner] = useState<PopupBannerItem | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady || typeof router.query.id !== 'string') return;
    const load = async () => {
      try {
        const response = await axios.get('/api/admin/popup-banners');
        const selected = (response.data.popupBanners as PopupBannerItem[]).find(
          (item) => item.id === router.query.id
        );
        if (!selected) throw new Error('ไม่พบ Popup Banner ที่ต้องการแก้ไข');
        setPopupBanner(selected);
      } catch (requestError) {
        setError(getErrorMessage(requestError));
      }
    };
    load();
  }, [router.isReady, router.query.id]);

  if (popupBanner) return <PopupBannerFormPage popupBanner={popupBanner} />;

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">แก้ไข Popup Banner</Typography>
          {error ? <Alert severity="error">{error}</Alert> : <Typography>กำลังโหลด...</Typography>}
        </Stack>
      </Container>
    </Layout>
  );
}
