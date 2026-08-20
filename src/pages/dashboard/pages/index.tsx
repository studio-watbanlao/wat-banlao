import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { TableHeadCustom, TableNoData } from 'src/components/table';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const TABLE_HEAD = [
  { id: 'title', label: 'ชื่อหน้า' },
  { id: 'slug', label: 'URL', minWidth: 220 },
  { id: 'status', label: 'สถานะ', width: 130 },
  { id: 'showInMenu', label: 'เมนู', width: 100, align: 'center' as const },
  { id: '', label: '', width: 120 },
];

export default function TemplePagesList() {
  const router = useRouter();
  const [pages, setPages] = useState<TemplePage[]>([]);
  const [error, setError] = useState('');

  const loadPages = useCallback(async () => {
    try {
      setError('');
      const response = await axios.get('/api/admin/pages');
      setPages(response.data.pages);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const removePage = async (page: TemplePage) => {
    if (!window.confirm(`ลบหน้า “${page.title}” หรือไม่?`)) return;
    try {
      await axios.delete('/api/admin/pages', { params: { id: page.id } });
      await loadPages();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการหน้าคงที่</Typography>
              <Typography variant="body2" color="text.secondary">
                หน้ามาตรฐานและหน้าเฉพาะของวัด
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.pageNew)}
            >
              สร้างหน้าใหม่
            </Button>
          </Stack>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Card>
            <TableContainer sx={{ overflow: 'unset' }}>
              <Scrollbar>
                <Table sx={{ minWidth: 900 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD} />
                  <TableBody>
                    {pages.map((page) => (
                      <TableRow hover key={page.id}>
                        <TableCell>
                          <Stack>
                            <Typography variant="subtitle2">{page.title}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {page.pageType === 'SYSTEM' ? 'หน้ามาตรฐาน' : 'หน้าเฉพาะวัด'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>/{page.slug}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={page.status === 'PUBLIC' ? 'success' : 'default'}
                            label={page.status}
                          />
                        </TableCell>
                        <TableCell align="center">
                          {page.showInMenu ? (
                            <Iconify
                              icon="eva:checkmark-circle-2-fill"
                              sx={{ color: 'success.main' }}
                            />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="แก้ไข">
                            <IconButton
                              onClick={() => router.push(paths.dashboard.pageEdit(page.id))}
                            >
                              <Iconify icon="solar:pen-bold" />
                            </IconButton>
                          </Tooltip>
                          {page.pageType === 'CUSTOM' ? (
                            <Tooltip title="ลบ">
                              <IconButton color="error" onClick={() => removePage(page)}>
                                <Iconify icon="solar:trash-bin-trash-bold" />
                              </IconButton>
                            </Tooltip>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableNoData notFound={pages.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
