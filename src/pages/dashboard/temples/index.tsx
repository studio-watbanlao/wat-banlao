import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthContext } from 'src/auth/hooks';
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
import type { Temple } from 'src/types/temple';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type TempleTableRow = Temple & {
  moduleCount: number;
  domainCount: number;
};

const TABLE_HEAD = [
  { id: 'name', label: 'วัด', minWidth: 280 },
  { id: 'slug', label: 'Slug', minWidth: 160 },
  { id: 'status', label: 'สถานะ', width: 140 },
  { id: 'moduleCount', label: 'Modules', width: 120, align: 'center' as const },
  { id: 'domainCount', label: 'Domains', width: 120, align: 'center' as const },
  { id: '', label: '', width: 120 },
];

const STATUS_COLOR = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  ARCHIVED: 'default',
} as const;

export default function TemplesManagementPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const table = useTable({ defaultOrderBy: 'name', defaultRowsPerPage: 10 });
  const { onResetPage } = table;
  const [temples, setTemples] = useState<Temple[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTemples = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/temples');
      setTemples(response.data.temples);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role && user.role !== 'super_admin') {
      router.replace(paths.page403);
      return;
    }
    if (user?.role === 'super_admin') loadTemples();
  }, [loadTemples, router, user?.role]);

  const rows = useMemo<TempleTableRow[]>(
    () =>
      temples.map((temple) => ({
        ...temple,
        moduleCount: Object.values(temple.modules).filter(Boolean).length,
        domainCount: temple.domains.length,
      })),
    [temples]
  );

  const filteredRows = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th');
    const comparator = getComparator<TempleTableRow>(
      table.order,
      table.orderBy as keyof TempleTableRow
    );
    const sortedRows = rows
      .map((row, index) => [row, index] as const)
      .sort((left, right) => comparator(left[0], right[0]) || left[1] - right[1])
      .map(([row]) => row);

    if (!keyword) return sortedRows;
    return sortedRows.filter((temple) =>
      [temple.name, temple.slug, ...temple.domains.map((domain) => domain.domain)].some((value) =>
        value.toLocaleLowerCase('th').includes(keyword)
      )
    );
  }, [rows, search, table.order, table.orderBy]);

  const pageRows = filteredRows.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );
  const handleSearch = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onResetPage();
      setSearch(event.target.value);
    },
    [onResetPage]
  );

  return (
    <Layout>
      <Container maxWidth={false} sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <div>
              <Typography variant="h4">จัดการวัด</Typography>
              <Typography variant="body2" color="text.secondary">
                Branding, Domain, Modules และสิทธิ์ผู้ดูแลแต่ละวัด
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.templeNew)}
            >
              เพิ่มวัด
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card>
            <Stack direction="row" sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                value={search}
                onChange={handleSearch}
                placeholder="ค้นหาชื่อวัด, slug หรือ domain"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ maxWidth: 440 }}
              />
            </Stack>

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
                  <TableHeadCustom
                    order={table.order}
                    orderBy={table.orderBy}
                    headLabel={TABLE_HEAD}
                    onSort={table.onSort}
                  />

                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageRows.map((temple) => (
                        <TableRow hover key={temple.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar
                                src={temple.branding.logoUrl}
                                alt={temple.name}
                                sx={{ bgcolor: temple.branding.primaryColor }}
                              >
                                {temple.name.slice(0, 1)}
                              </Avatar>
                              <Typography variant="subtitle2">{temple.name}</Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{temple.slug}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={STATUS_COLOR[temple.status]}
                              label={temple.status}
                            />
                          </TableCell>
                          <TableCell align="center">{temple.moduleCount}</TableCell>
                          <TableCell align="center">{temple.domainCount}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              startIcon={<Iconify icon="solar:settings-bold" />}
                              onClick={() => router.push(paths.dashboard.templeEdit(temple.id))}
                            >
                              ตั้งค่า
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}

                    <TableNoData notFound={!loading && filteredRows.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={filteredRows.length}
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
