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
import { useCurrentTempleAccess } from 'src/hooks/use-current-temple-access';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { ActivityContentType, ActivityItem, ActivityType } from 'src/types/activity';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { fDateTime } from 'src/utils/format-time';

const TABLE_HEAD = [
  { id: 'title', label: 'ชื่อเรื่อง', minWidth: 320 },
  { id: 'contentType', label: 'ประเภทเนื้อหา', width: 150 },
  { id: 'type', label: 'ส่วนงาน', width: 130 },
  { id: 'createdAt', label: 'วันที่สร้าง', width: 180 },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: '', label: '', width: 120 },
];

const TYPE_LABEL: Record<ActivityType, string> = {
  temple: 'วัด',
  community: 'ชุมชน',
  school: 'โรงเรียน',
};

const CONTENT_TYPE_LABEL: Record<ActivityContentType, string> = {
  activity: 'กิจกรรม',
  news: 'ข่าวสาร',
};

export default function ActivityManagementPage() {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const access = useCurrentTempleAccess();
  const isContributor = access?.role === 'temple_contributor';
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/activities');
      setActivities(response.data.activities || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const pageActivities = activities.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const remove = async (activity: ActivityItem) => {
    if (!window.confirm(`ลบกิจกรรม “${activity.title}” หรือไม่?`)) return;
    try {
      setDeletingId(activity.id);
      setError('');
      await axios.delete('/api/admin/activities', { params: { id: activity.id } });
      table.onUpdatePageDeleteRow(pageActivities.length);
      setActivities((current) => current.filter((item) => item.id !== activity.id));
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
              <Typography variant="h4">จัดการกิจกรรมและข่าวสาร</Typography>
              <Typography variant="body2" color="text.secondary">
                จัดการกิจกรรม ข่าวประชาสัมพันธ์ และข้อมูลที่แสดงในหน้าแรก
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.activityNew)}
            >
              เพิ่มข้อมูล
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
                      pageActivities.map((activity) => (
                        <TableRow hover key={activity.id}>
                          <TableCell>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                variant="rounded"
                                src={activity.imageUrl}
                                alt={activity.title}
                                sx={{ width: 64, height: 48 }}
                              />
                              <Typography variant="subtitle2">{activity.title}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={activity.contentType === 'news' ? 'info' : 'primary'}
                              label={CONTENT_TYPE_LABEL[activity.contentType || 'activity']}
                            />
                          </TableCell>
                          <TableCell>{TYPE_LABEL[activity.type || 'temple']}</TableCell>
                          <TableCell>{fDateTime(activity.createdAt, 'dd/MM/yyyy HH:mm')}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={activity.status === 'PUBLIC' ? 'success' : 'default'}
                              label={activity.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="แก้ไข">
                              <IconButton
                                onClick={() =>
                                  router.push(paths.dashboard.activityEdit(activity.id))
                                }
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            {!isContributor ? (
                              <Tooltip title="ลบ">
                                <LoadingButton
                                  color="error"
                                  loading={deletingId === activity.id}
                                  onClick={() => remove(activity)}
                                  sx={{ minWidth: 40, px: 1 }}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </LoadingButton>
                              </Tooltip>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableNoData notFound={!loading && activities.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <TablePaginationCustom
              count={activities.length}
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
