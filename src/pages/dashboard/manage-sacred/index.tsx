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
import NextImage, { type ImageLoaderProps } from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { SacredItem } from 'src/types/sacred';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const imageLoader = ({ src }: ImageLoaderProps) => src;

export default function ManageSacredPage() {
  const router = useRouter();
  const [items, setItems] = useState<SacredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/sacred');
      setItems(response.data.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const removeItem = async (item: SacredItem) => {
    if (!window.confirm(`ลบ “${item.title}” หรือไม่?`)) return;
    try {
      setDeletingId(item.id);
      setError('');
      await axios.delete('/api/admin/sacred', { params: { id: item.id } });
      setItems((current) => current.filter((value) => value.id !== item.id));
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
              <Typography variant="h4">จัดการวัตถุมงคล</Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อมูลที่แสดงในหน้า Sacred
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.sacredNew)}
            >
              เพิ่มวัตถุมงคล
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <Typography color="text.secondary">กำลังโหลด...</Typography> : null}

          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
                <Card>
                  <Box sx={{ height: 280, position: 'relative', bgcolor: 'background.neutral' }}>
                    {item.imageUrl ? (
                      <NextImage
                        loader={imageLoader}
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 900px) 50vw, 25vw"
                        style={{ objectFit: 'contain' }}
                      />
                    ) : null}
                  </Box>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <div>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ปี {item.year || '-'}
                        </Typography>
                      </div>
                      <Chip
                        size="small"
                        label={item.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                        color={item.status === 'PUBLIC' ? 'success' : 'default'}
                      />
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button onClick={() => router.push(paths.dashboard.sacredEdit(item.id))}>
                      แก้ไข
                    </Button>
                    <LoadingButton
                      color="error"
                      loading={deletingId === item.id}
                      onClick={() => removeItem(item)}
                    >
                      ลบ
                    </LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {!loading && !items.length ? (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Iconify icon="solar:gallery-wide-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มีข้อมูลวัตถุมงคล
              </Typography>
            </Card>
          ) : null}
        </Stack>
      </Container>
    </Layout>
  );
}
