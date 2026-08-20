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
import type { SacredItem } from 'src/types/sacred';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const TABLE_HEAD = [
  { id: 'title', label: 'วัตถุมงคล', minWidth: 380 },
  { id: 'year', label: 'ปี', width: 140 },
  { id: 'view', label: 'ยอดเข้าชม', width: 120, align: 'center' as const },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: '', label: '', width: 120 },
];

export default function ManageSacredPage() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const [items, setItems] = useState<SacredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/sacred');
      setItems(response.data.items || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const pageItems = items.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const removeItem = async (item: SacredItem) => {
    if (!window.confirm(`ลบ “${item.title}” หรือไม่?`)) return;
    try {
      setDeletingId(item.id);
      setError('');
      await axios.delete('/api/admin/sacred', { params: { id: item.id } });
      table.onUpdatePageDeleteRow(pageItems.length);
      setItems((current) => current.filter((value) => value.id !== item.id));
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
              <Typography variant="h4">จัดการวัตถุมงคล</Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อมูลที่แสดงในหน้าวัตถุมงคล
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

          <Card>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD} />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center">
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageItems.map((item) => (
                        <TableRow hover key={item.id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                variant="rounded"
                                src={item.imageUrl}
                                alt={item.title}
                                sx={{ width: 56, height: 56 }}
                              />
                              <Typography variant="subtitle2">{item.title}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{item.year || '-'}</TableCell>
                          <TableCell align="center">{item.view || 0}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={item.status === 'PUBLIC' ? 'success' : 'default'}
                              label={item.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="แก้ไข">
                              <IconButton
                                onClick={() => router.push(paths.dashboard.sacredEdit(item.id))}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ">
                              <LoadingButton
                                color="error"
                                loading={deletingId === item.id}
                                onClick={() => removeItem(item)}
                                sx={{ minWidth: 40, px: 1 }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </LoadingButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableNoData notFound={!loading && items.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <TablePaginationCustom
              count={items.length}
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
