import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { BannerItem } from 'src/types/banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const TABLE_HEAD = [
  { id: 'title', label: 'Banner', minWidth: 360 },
  { id: 'sortOrder', label: 'ลำดับ', width: 110, align: 'center' as const },
  { id: 'linkUrl', label: 'ลิงก์ปลายทาง', minWidth: 220 },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: '', label: '', width: 120 },
];

export default function BannerManagementPage() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/banners');
      setBanners(response.data.banners || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const pageBanners = banners.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const removeBanner = async (banner: BannerItem) => {
    if (!window.confirm(`ลบ Banner “${banner.title}” หรือไม่?`)) return;
    try {
      setDeletingId(banner.id);
      setError('');
      await axios.delete('/api/admin/banners', { params: { id: banner.id } });
      table.onUpdatePageDeleteRow(pageBanners.length);
      setBanners((current) => current.filter((item) => item.id !== banner.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Layout>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
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

          <Card>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 940 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD} />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center">
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageBanners.map((banner) => (
                        <TableRow hover key={banner.id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                variant="rounded"
                                src={banner.desktopImageUrl || banner.imageUrl}
                                alt={banner.title}
                                sx={{ width: 80, height: 48 }}
                              />
                              <Typography variant="subtitle2">{banner.title}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="center">{banner.sortOrder}</TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 280 }}>
                              {banner.linkUrl || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={banner.status === 'PUBLIC' ? 'success' : 'default'}
                              label={banner.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="แก้ไข">
                              <IconButton
                                onClick={() => router.push(paths.dashboard.bannerEdit(banner.id))}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ">
                              <LoadingButton
                                color="error"
                                loading={deletingId === banner.id}
                                onClick={() => removeBanner(banner)}
                                sx={{ minWidth: 40, px: 1 }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </LoadingButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableNoData notFound={!loading && banners.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <TablePaginationCustom
              count={banners.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              labelRowsPerPage="รายการต่อหน้า:"
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
