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
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { EditorialItem, EditorialResource } from 'src/types/editorial';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type Props = {
  resource: EditorialResource;
  title: string;
  description: string;
};

const imageLoader = ({ src }: ImageLoaderProps) => src;

export default function EditorialManagementView({ resource, title, description }: Props) {
  const router = useRouter();
  const endpoint = `/api/admin/${resource === 'blog' ? 'blogs' : 'dharmas'}`;
  const listKey = resource === 'blog' ? 'blogs' : 'dharmas';
  const newPath = resource === 'blog' ? paths.dashboard.blogNew : paths.dashboard.dharmaNew;
  const editPath = resource === 'blog' ? paths.dashboard.blogEdit : paths.dashboard.dharmaEdit;
  const [items, setItems] = useState<EditorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(endpoint);
      setItems(response.data[listKey] || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [endpoint, listKey]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const remove = async (item: EditorialItem) => {
    if (!window.confirm(`ลบ${title} “${item.title}” หรือไม่?`)) return;
    try {
      setDeletingId(item.id);
      setError('');
      await axios.delete(endpoint, { params: { id: item.id } });
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <div>
            <Typography variant="h4">จัดการ{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(newPath)}
          >
            เพิ่ม{title}
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? <Typography color="text.secondary">กำลังโหลด...</Typography> : null}

        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card>
                <Box sx={{ height: 230, position: 'relative', bgcolor: 'background.neutral' }}>
                  {item.imageUrl ? (
                    <NextImage
                      loader={imageLoader}
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : null}
                </Box>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <div>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.author || 'ไม่ระบุผู้เขียน'}
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
                  <Button onClick={() => router.push(editPath(item.id))}>แก้ไข</Button>
                  <LoadingButton
                    color="error"
                    loading={deletingId === item.id}
                    onClick={() => remove(item)}
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
            <Iconify icon="solar:document-text-bold-duotone" width={64} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              ยังไม่มี{title}
            </Typography>
          </Card>
        ) : null}
      </Stack>
    </Container>
  );
}
