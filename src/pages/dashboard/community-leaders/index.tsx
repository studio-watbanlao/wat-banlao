import { Box, Stack } from '@mui/material';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  getComparator,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { COMMUNITY_VILLAGES, type CommunityLeader } from 'src/types/community-leader';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const TABLE_HEAD = [
  { id: 'fullName', label: 'ผู้นำชุมชน', minWidth: 280 },
  { id: 'villageName', label: 'หมู่บ้าน', minWidth: 220 },
  { id: 'role', label: 'ตำแหน่ง', minWidth: 220 },
  { id: 'sortOrder', label: 'ลำดับ', width: 90, align: 'center' as const },
  { id: 'status', label: 'สถานะ', width: 120 },
  { id: '', label: '', width: 120 },
];

export default function CommunityLeadersAdminPage() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'sortOrder', defaultRowsPerPage: 10 });
  const [leaders, setLeaders] = useState<CommunityLeader[]>([]);
  const [search, setSearch] = useState('');
  const [village, setVillage] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');

  const loadLeaders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/community-leaders');
      setLeaders(response.data.leaders || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaders();
  }, [loadLeaders]);

  const filteredLeaders = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th');
    const comparator = getComparator<CommunityLeader>(
      table.order,
      table.orderBy as keyof CommunityLeader
    );
    return leaders
      .filter((leader) => village === 'all' || leader.villageKey === village)
      .filter((leader) =>
        !keyword
          ? true
          : [leader.fullName, leader.villageName, leader.role, leader.responsibility]
              .join(' ')
              .toLocaleLowerCase('th')
              .includes(keyword)
      )
      .map((leader, index) => [leader, index] as const)
      .sort((left, right) => comparator(left[0], right[0]) || left[1] - right[1])
      .map(([leader]) => leader);
  }, [leaders, search, table.order, table.orderBy, village]);

  const pageLeaders = filteredLeaders.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const removeLeader = useCallback(async (leader: CommunityLeader) => {
    if (!window.confirm(`ต้องการลบ “${leader.fullName}” หรือไม่?`)) return;
    try {
      setDeleting(leader.id);
      setError('');
      await axios.delete('/api/admin/community-leaders', { params: { id: leader.id } });
      setLeaders((current) => current.filter((item) => item.id !== leader.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeleting('');
    }
  }, []);

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <div>
              <Typography variant="h4">จัดการผู้นำชุมชนบ้านเหล่า</Typography>
              <Typography variant="body2" color="text.secondary">
                เพิ่ม แก้ไข และจัดลำดับผู้นำของทั้ง 6 หมู่บ้าน ข้อมูลที่เผยแพร่จะแสดงบนเว็บไซต์ทันที
              </Typography>
            </div>
            <Box>
              <Button
                variant="contained"
                size="medium"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => router.push(paths.dashboard.communityLeaderNew)}
              >
                เพิ่มผู้นำชุมชน
              </Button>
            </Box>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => {
                  table.onResetPage();
                  setSearch(event.target.value);
                }}
                placeholder="ค้นหาชื่อ หมู่บ้าน ตำแหน่ง หรือหน้าที่"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                select
                fullWidth
                label="หมู่บ้าน"
                value={village}
                onChange={(event) => {
                  table.onResetPage();
                  setVillage(event.target.value);
                }}
                sx={{ maxWidth: { md: 320 } }}
              >
                <MenuItem value="all">ทุกหมู่บ้าน</MenuItem>
                {COMMUNITY_VILLAGES.map((item) => (
                  <MenuItem key={item.key} value={item.key}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1050 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center">
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageLeaders.map((leader) => (
                        <TableRow hover key={leader.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={leader.imageUrl} alt={leader.fullName} />
                              <Typography variant="subtitle2">{leader.fullName}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{leader.villageName}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{leader.role}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {leader.responsibility || 'ไม่ได้ระบุหน้าที่เพิ่มเติม'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{leader.sortOrder}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={leader.status === 'PUBLIC' ? 'success' : 'default'}
                              label={leader.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="แก้ไขข้อมูล">
                              <IconButton
                                onClick={() =>
                                  router.push(paths.dashboard.communityLeaderEdit(leader.id))
                                }
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบข้อมูล">
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={deleting === leader.id}
                                  onClick={() => removeLeader(leader)}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableNoData notFound={!loading && filteredLeaders.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={filteredLeaders.length}
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
