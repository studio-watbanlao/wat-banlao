import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { BannerItem } from 'src/types/banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

export default function BannerManagementPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/banners');
      setBanners(response.data.banners);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const removeBanner = async (banner: BannerItem) => {
    if (!window.confirm(`ลบ Banner “${banner.title}” หรือไม่?`)) return;
    try {
      setDeletingId(banner.id);
      setError('');
      await axios.delete('/api/admin/banners', { params: { id: banner.id } });
      setBanners((current) => current.filter((item) => item.id !== banner.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการ Banner</Typography>
              <Typography variant="body2" color="text.secondary">
                Banner หน้าแรกสำหรับ Desktop และ Mobile
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.bannerNew)}
            >
              เพิ่ม Banner
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <Typography color="text.secondary">กำลังโหลด...</Typography> : null}

          <Grid container spacing={3}>
            {banners.map((banner) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={banner.id}>
                <Card>
                  <Box
                    sx={{
                      height: 210,
                      backgroundImage: `url("${banner.desktopImageUrl || banner.imageUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" noWrap>
                        {banner.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={banner.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                        color={banner.status === 'PUBLIC' ? 'success' : 'default'}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      ลำดับ {banner.sortOrder}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button onClick={() => router.push(paths.dashboard.bannerEdit(banner.id))}>
                      แก้ไข
                    </Button>
                    <LoadingButton
                      color="error"
                      loading={deletingId === banner.id}
                      onClick={() => removeBanner(banner)}
                    >
                      ลบ
                    </LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {!loading && banners.length === 0 ? (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Iconify icon="solar:gallery-wide-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มี Banner
              </Typography>
            </Card>
          ) : null}
        </Stack>
      </Container>
    </Layout>
  );
}
