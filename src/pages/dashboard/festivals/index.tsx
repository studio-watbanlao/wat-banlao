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
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import type { FestivalItem } from 'src/types/festival';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const TABLE_HEAD = [
  { id: 'title', label: 'งานประเพณี', minWidth: 360 },
  { id: 'number', label: 'ครั้งที่', width: 110 },
  { id: 'year', label: 'ปี', width: 120 },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: '', label: '', width: 120 },
];

export default function FestivalManagementPage() {
  const table = useTable({ defaultRowsPerPage: 10 });
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadFestivals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/festivals');
      setFestivals(response.data.festivals || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

  const pageFestivals = festivals.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const removeFestival = async (festival: FestivalItem) => {
    if (!window.confirm(`ลบงานประเพณี “${festival.title}” หรือไม่?`)) return;
    try {
      setDeletingId(festival.id);
      setError('');
      await axios.delete('/api/admin/festivals', { params: { id: festival.id } });
      table.onUpdatePageDeleteRow(pageFestivals.length);
      setFestivals((current) => current.filter((item) => item.id !== festival.id));
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
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <div>
              <Typography variant="h4">จัดการงานประเพณี</Typography>
              <Typography variant="body2" color="text.secondary">
                เทศกาลและงานบุญประจำปี
              </Typography>
            </div>
            <Button
              component={RouterLink}
              href={paths.dashboard.festivalNew}
              variant="contained"
              startIcon={<Iconify icon="ri:add-line" />}
            >
              เพิ่มงานประเพณี
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
                      pageFestivals.map((festival) => (
                        <TableRow hover key={festival.id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                variant="rounded"
                                src={festival.imageUrl}
                                alt={festival.title}
                                sx={{ width: 64, height: 48 }}
                              />
                              <Typography variant="subtitle2">{festival.title}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{festival.no || '-'}</TableCell>
                          <TableCell>{festival.year || '-'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={festival.status === 'PUBLIC' ? 'success' : 'default'}
                              label={festival.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="แก้ไข">
                              <IconButton
                                component={RouterLink}
                                href={paths.dashboard.festivalEdit(festival.id)}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบ">
                              <LoadingButton
                                color="error"
                                loading={deletingId === festival.id}
                                onClick={() => removeFestival(festival)}
                                sx={{ minWidth: 40, px: 1 }}
                              >
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </LoadingButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableNoData notFound={!loading && festivals.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <TablePaginationCustom
              count={festivals.length}
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
