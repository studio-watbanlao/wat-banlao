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
import Stack from '@mui/material/Stack';
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
import {
  TEMPLE_DIRECTORY_ENTRY_TYPES,
  type TempleDirectoryEntry,
  type TempleDirectoryEntryType,
} from 'src/types/temple-directory';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const TABLE_HEAD = [
  { id: 'fullName', label: 'รายชื่อ', minWidth: 300 },
  { id: 'entryType', label: 'ประเภท', minWidth: 170 },
  { id: 'templeName', label: 'วัด / จังหวัด', minWidth: 240 },
  { id: 'sortOrder', label: 'ลำดับ', width: 100, align: 'center' as const },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: '', label: '', width: 120 },
];

export default function TempleDirectoryPage() {
  const router = useRouter();
  const table = useTable({ defaultOrderBy: 'sortOrder', defaultRowsPerPage: 10 });
  const [entries, setEntries] = useState<TempleDirectoryEntry[]>([]);
  const [search, setSearch] = useState('');
  const [entryTypeFilter, setEntryTypeFilter] = useState<'ALL' | TempleDirectoryEntryType>('ALL');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/directory');
      setEntries(response.data.entries);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase('th');
    const comparator = getComparator<TempleDirectoryEntry>(
      table.order,
      table.orderBy as keyof TempleDirectoryEntry
    );
    const sorted = entries
      .filter((entry) => entryTypeFilter === 'ALL' || entry.entryType === entryTypeFilter)
      .map((entry, index) => [entry, index] as const)
      .sort((left, right) => comparator(left[0], right[0]) || left[1] - right[1])
      .map(([entry]) => entry);
    if (!keyword) return sorted;
    return sorted.filter((entry) =>
      [entry.fullName, entry.displayTitle, entry.templeName, entry.province, entry.affiliation]
        .join(' ')
        .toLocaleLowerCase('th')
        .includes(keyword)
    );
  }, [entries, entryTypeFilter, search, table.order, table.orderBy]);

  const pageEntries = filteredEntries.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );
  const removeEntry = useCallback(async (entry: TempleDirectoryEntry) => {
    if (!window.confirm(`ต้องการลบ “${entry.fullName}” ออกจากทำเนียบวัดหรือไม่?`)) return;
    try {
      setDeleting(entry.id);
      setError('');
      await axios.delete('/api/admin/directory', { params: { id: entry.id } });
      setEntries((current) => current.filter((item) => item.id !== entry.id));
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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <div>
              <Typography variant="h4">จัดการทำเนียบวัด</Typography>
              <Typography variant="body2" color="text.secondary">
                จัดเก็บประวัติ การศึกษา ตำแหน่ง และสมณศักดิ์ของพระภายในวัด
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.directoryNew)}
            >
              เพิ่มรายชื่อ
            </Button>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2.5 }}>
              <TextField
                fullWidth
                value={search}
                onChange={(event) => {
                  table.onResetPage();
                  setSearch(event.target.value);
                }}
                placeholder="ค้นหาชื่อ วัด จังหวัด หรือสังกัด"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ maxWidth: 480 }}
              />
              <TextField
                select
                label="ประเภทบุคคล"
                value={entryTypeFilter}
                onChange={(event) => {
                  table.onResetPage();
                  setEntryTypeFilter(event.target.value as 'ALL' | TempleDirectoryEntryType);
                }}
                sx={{ width: { xs: 1, sm: 240 } }}
              >
                <MenuItem value="ALL">ทั้งหมด</MenuItem>
                {TEMPLE_DIRECTORY_ENTRY_TYPES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1080 }}>
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
                      pageEntries.map((entry) => (
                        <TableRow hover key={entry.id}>
                          <TableCell>
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Avatar src={entry.imageUrl} alt={entry.fullName} />
                              <div>
                                <Typography variant="subtitle2">{entry.fullName}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {entry.displayTitle || 'ยังไม่ได้ระบุชื่อที่ใช้แสดง'}
                                </Typography>
                              </div>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={entry.entryType === 'CURRENT_ABBOT' ? 'primary' : 'default'}
                              label={
                                TEMPLE_DIRECTORY_ENTRY_TYPES.find(
                                  (item) => item.value === entry.entryType
                                )?.label || entry.entryType
                              }
                            />
                            {entry.termStart || entry.termEnd ? (
                              <Typography display="block" variant="caption" color="text.secondary">
                                {[entry.termStart, entry.termEnd || 'ปัจจุบัน']
                                  .filter(Boolean)
                                  .join(' – ')}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{entry.templeName || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.province || 'ยังไม่ได้ระบุจังหวัด'}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">{entry.sortOrder}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              variant="soft"
                              color={entry.status === 'PUBLIC' ? 'success' : 'default'}
                              label={entry.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="แก้ไขข้อมูล">
                              <IconButton
                                onClick={() => router.push(paths.dashboard.directoryEdit(entry.id))}
                              >
                                <Iconify icon="solar:pen-bold" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="ลบข้อมูล">
                              <span>
                                <IconButton
                                  color="error"
                                  disabled={deleting === entry.id}
                                  onClick={() => removeEntry(entry)}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                    <TableNoData notFound={!loading && filteredEntries.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>

            <TablePaginationCustom
              count={filteredEntries.length}
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
