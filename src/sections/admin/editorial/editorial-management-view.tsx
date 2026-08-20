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
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { EditorialItem, EditorialResource } from 'src/types/editorial';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { fDateTime } from 'src/utils/format-time';

type Props = {
  resource: EditorialResource;
  title: string;
  description: string;
};

const TABLE_HEAD = [
  { id: 'title', label: 'หัวข้อ', minWidth: 380 },
  { id: 'author', label: 'ผู้เขียน', minWidth: 180 },
  { id: 'createdAt', label: 'วันที่สร้าง', width: 180 },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: '', label: '', width: 120 },
];

export default function EditorialManagementView({ resource, title, description }: Props) {
  const router = useRouter();
  const table = useTable({ defaultRowsPerPage: 10 });
  const access = useCurrentTempleAccess();
  const isContributor = access?.role === 'temple_contributor';
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

  const pageItems = items.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const remove = async (item: EditorialItem) => {
    if (!window.confirm(`ลบ${title} “${item.title}” หรือไม่?`)) return;
    try {
      setDeletingId(item.id);
      setError('');
      await axios.delete(endpoint, { params: { id: item.id } });
      table.onUpdatePageDeleteRow(pageItems.length);
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
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
                    pageItems.map((item) => (
                      <TableRow hover key={item.id}>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              variant="rounded"
                              src={item.imageUrl}
                              alt={item.title}
                              sx={{ width: 64, height: 48 }}
                            />
                            <Typography variant="subtitle2">{item.title}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{item.author || 'ไม่ระบุผู้เขียน'}</TableCell>
                        <TableCell>
                          {item.createdAt ? fDateTime(item.createdAt, 'dd/MM/yyyy HH:mm') : '-'}
                        </TableCell>
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
                            <IconButton onClick={() => router.push(editPath(item.id))}>
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          {!isContributor ? (
                            <Tooltip title="ลบ">
                              <LoadingButton
                                color="error"
                                loading={deletingId === item.id}
                                onClick={() => remove(item)}
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
  );
}
