import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const normalizeOrder = (pages: TemplePage[]) =>
  pages.map((page, index) => ({ ...page, sortOrder: (index + 1) * 10 }));

const customPagesOnly = (pages: TemplePage[]) => pages.filter((page) => page.pageType === 'CUSTOM');

export default function TempleMenuManagementPage() {
  const [pages, setPages] = useState<TemplePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/pages');
      setPages(customPagesOnly(response.data.pages as TemplePage[]));
      setDirty(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPages();
  }, [loadPages]);

  const toggleVisibility = (id: string) => {
    setPages((currentPages) =>
      currentPages.map((page) =>
        page.id === id ? { ...page, showInMenu: !page.showInMenu } : page
      )
    );
    setDirty(true);
    setSuccess('');
  };

  const movePage = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= pages.length) return;
    setPages((currentPages) => {
      const nextPages = [...currentPages];
      [nextPages[index], nextPages[destination]] = [nextPages[destination], nextPages[index]];
      return normalizeOrder(nextPages);
    });
    setDirty(true);
    setSuccess('');
  };

  const saveMenu = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await axios.patch('/api/admin/pages', {
        action: 'updateMenu',
        items: pages.map((page) => ({
          id: page.id,
          showInMenu: page.showInMenu,
          sortOrder: page.sortOrder,
        })),
      });
      setPages(customPagesOnly(response.data.pages as TemplePage[]));
      setDirty(false);
      setSuccess('บันทึกการจัดเมนูเรียบร้อยแล้ว');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h4">จัดการเมนูเว็บไซต์</Typography>
            <Typography variant="body2" color="text.secondary">
              เลือกหน้าที่ต้องการแสดงบนเมนู และจัดลำดับด้วยปุ่มขึ้นหรือลง
            </Typography>
          </Stack>

          <Alert severity="info">
            หน้านี้จัดการเมนูจาก “หน้าเฉพาะวัด” ส่วนเมนูหลักมากับ Public Template และแก้ไขในโค้ดของ
            Template นั้น หน้าที่เป็นแบบร่างหรือเก็บถาวรจะยังไม่แสดงบนเว็บไซต์
          </Alert>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Card>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
              sx={{ p: 2.5 }}
            >
              <Box>
                <Typography variant="h6">รายการหน้า</Typography>
                <Typography variant="caption" color="text.secondary">
                  เปิดใช้งาน {pages.filter((page) => page.showInMenu).length} จาก {pages.length}{' '}
                  หน้า
                </Typography>
              </Box>
              <LoadingButton
                variant="contained"
                loading={saving}
                disabled={!dirty || loading}
                onClick={saveMenu}
                startIcon={<Iconify icon="solar:diskette-bold" />}
              >
                บันทึกเมนู
              </LoadingButton>
            </Stack>

            <Divider />

            {loading ? (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                กำลังโหลดรายการเมนู...
              </Typography>
            ) : null}

            {!loading && pages.length === 0 ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                ยังไม่มีหน้าสำหรับจัดเป็นเมนู
              </Typography>
            ) : null}

            {!loading
              ? pages.map((page, index) => (
                  <Stack
                    key={page.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      px: { xs: 1.5, sm: 2.5 },
                      py: 1.75,
                      borderBottom: index < pages.length - 1 ? '1px solid' : 0,
                      borderColor: 'divider',
                      bgcolor: page.showInMenu ? 'background.paper' : 'background.neutral',
                    }}
                  >
                    <Stack direction="row" spacing={0.25}>
                      <Tooltip title="เลื่อนขึ้น">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === 0}
                            onClick={() => movePage(index, -1)}
                            aria-label={`เลื่อน ${page.title} ขึ้น`}
                          >
                            <Iconify icon="solar:alt-arrow-up-linear" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="เลื่อนลง">
                        <span>
                          <IconButton
                            size="small"
                            disabled={index === pages.length - 1}
                            onClick={() => movePage(index, 1)}
                            aria-label={`เลื่อน ${page.title} ลง`}
                          >
                            <Iconify icon="solar:alt-arrow-down-linear" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>

                    <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2" noWrap>
                          {page.title}
                        </Typography>
                        <Chip
                          size="small"
                          variant="soft"
                          color={page.status === 'PUBLIC' ? 'success' : 'default'}
                          label={page.status === 'PUBLIC' ? 'เผยแพร่แล้ว' : 'ยังไม่เผยแพร่'}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        /{page.slug} · ลำดับ {page.sortOrder}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="body2"
                        color={page.showInMenu ? 'text.primary' : 'text.secondary'}
                        sx={{ display: { xs: 'none', sm: 'block' } }}
                      >
                        {page.showInMenu ? 'แสดงในเมนู' : 'ซ่อนจากเมนู'}
                      </Typography>
                      <Switch
                        checked={page.showInMenu}
                        onChange={() => toggleVisibility(page.id)}
                        inputProps={{ 'aria-label': `แสดง ${page.title} ในเมนูเว็บไซต์` }}
                      />
                    </Stack>
                  </Stack>
                ))
              : null}
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
