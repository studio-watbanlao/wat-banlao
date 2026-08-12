import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { TempleNavigationItem } from 'src/types/temple-navigation';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const byOrder = <T extends { sortOrder: number }>(a: T, b: T) => a.sortOrder - b.sortOrder;
const customPagesOnly = (pages: TemplePage[]) => pages.filter((page) => page.pageType === 'CUSTOM');

export default function TempleMenuManagementPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [items, setItems] = useState<TempleNavigationItem[]>([]);
  const [customPages, setCustomPages] = useState<TemplePage[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const parents = useMemo(() => items.filter((item) => !item.parentKey).toSorted(byOrder), [items]);

  const loadMenu = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [navigationResponse, pagesResponse] = await Promise.all([
        axios.get('/api/admin/navigation'),
        axios.get('/api/admin/pages'),
      ]);
      setItems(navigationResponse.data.items as TempleNavigationItem[]);
      setCustomPages(customPagesOnly(pagesResponse.data.pages as TemplePage[]));
      setDirty(false);
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
    if (user?.role === 'super_admin') loadMenu();
  }, [loadMenu, router, user?.role]);

  const updateItem = (itemKey: string, values: Partial<TempleNavigationItem>) => {
    setItems((current) =>
      current.map((item) => (item.itemKey === itemKey ? { ...item, ...values } : item))
    );
    setDirty(true);
    setSuccess('');
  };

  const moveItem = (itemKey: string, direction: -1 | 1) => {
    setItems((current) => {
      const selected = current.find((item) => item.itemKey === itemKey);
      if (!selected) return current;
      const siblings = current
        .filter((item) => item.parentKey === selected.parentKey)
        .toSorted(byOrder);
      const index = siblings.findIndex((item) => item.itemKey === itemKey);
      const target = siblings[index + direction];
      if (!target) return current;
      return current.map((item) => {
        if (item.itemKey === selected.itemKey) return { ...item, sortOrder: target.sortOrder };
        if (item.itemKey === target.itemKey) return { ...item, sortOrder: selected.sortOrder };
        return item;
      });
    });
    setDirty(true);
    setSuccess('');
  };

  const toggleCustomPage = (id: string) => {
    setCustomPages((current) =>
      current.map((page) => (page.id === id ? { ...page, showInMenu: !page.showInMenu } : page))
    );
    setDirty(true);
    setSuccess('');
  };

  const saveMenu = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const [navigationResponse, pagesResponse] = await Promise.all([
        axios.patch('/api/admin/navigation', {
          items: items.map(({ itemKey, title, sortOrder, enabled }) => ({
            itemKey,
            title,
            sortOrder,
            enabled,
          })),
        }),
        axios.patch('/api/admin/pages', {
          action: 'updateMenu',
          items: customPages.map((page, index) => ({
            id: page.id,
            showInMenu: page.showInMenu,
            sortOrder: page.sortOrder || (index + 1) * 10,
          })),
        }),
      ]);
      setItems(navigationResponse.data.items as TempleNavigationItem[]);
      setCustomPages(customPagesOnly(pagesResponse.data.pages as TemplePage[]));
      setDirty(false);
      setSuccess('บันทึกเมนูเว็บไซต์เรียบร้อยแล้ว');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const renderMoveButtons = (item: TempleNavigationItem, siblings: TempleNavigationItem[]) => {
    const index = siblings.findIndex((sibling) => sibling.itemKey === item.itemKey);
    return (
      <Stack direction="row" spacing={0.25}>
        <Tooltip title="เลื่อนขึ้น">
          <span>
            <IconButton
              size="small"
              disabled={index === 0}
              onClick={() => moveItem(item.itemKey, -1)}
              aria-label={`เลื่อน ${item.title} ขึ้น`}
            >
              <Iconify icon="solar:alt-arrow-up-linear" />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="เลื่อนลง">
          <span>
            <IconButton
              size="small"
              disabled={index === siblings.length - 1}
              onClick={() => moveItem(item.itemKey, 1)}
              aria-label={`เลื่อน ${item.title} ลง`}
            >
              <Iconify icon="solar:alt-arrow-down-linear" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    );
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h4">จัดการเมนูเว็บไซต์</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                กำหนดชื่อ ลำดับ และการแสดงผลเมนูสำหรับเว็บไซต์ของวัดนี้
              </Typography>
            </Box>
            <Button
              variant="contained"
              loading={saving}
              disabled={!dirty || loading}
              onClick={saveMenu}
              startIcon={<Iconify icon="solar:diskette-bold" />}
            >
              บันทึกเมนู
            </Button>
          </Stack>

          <Alert severity="info">
            การซ่อนเมนูหลักจะซ่อนเมนูย่อยทั้งหมดบนเว็บไซต์ แต่สถานะของเมนูย่อยจะยังถูกเก็บไว้
          </Alert>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Card>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6">เมนูหลักและเมนูย่อย</Typography>
              <Typography variant="caption" color="text.secondary">
                เปิดใช้งาน {items.filter((item) => item.enabled).length} จาก {items.length} รายการ
              </Typography>
            </Box>
            <Divider />

            {loading ? (
              <Typography color="text.secondary" sx={{ p: 3 }}>
                กำลังโหลดเมนู...
              </Typography>
            ) : null}

            {!loading
              ? parents.map((parent, parentIndex) => {
                  const children = items
                    .filter((item) => item.parentKey === parent.itemKey)
                    .toSorted(byOrder);
                  return (
                    <Box
                      key={parent.itemKey}
                      sx={{
                        borderBottom: parentIndex < parents.length - 1 ? '1px solid' : 0,
                        borderColor: 'divider',
                        bgcolor: parent.enabled ? 'background.paper' : 'background.neutral',
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        alignItems={{ md: 'center' }}
                        sx={{ px: 2.5, py: 2 }}
                      >
                        {renderMoveButtons(parent, parents)}
                        <TextField
                          size="small"
                          label="ชื่อเมนูหลัก"
                          value={parent.title}
                          onChange={(event) =>
                            updateItem(parent.itemKey, { title: event.target.value })
                          }
                          sx={{ width: { xs: 1, md: 320 } }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                          {parent.path}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2">
                            {parent.enabled ? 'แสดง' : 'ซ่อน'}
                          </Typography>
                          <Switch
                            checked={parent.enabled}
                            onChange={(_, checked) =>
                              updateItem(parent.itemKey, { enabled: checked })
                            }
                            inputProps={{ 'aria-label': `แสดงเมนู ${parent.title}` }}
                          />
                        </Stack>
                      </Stack>

                      {children.length ? (
                        <Stack spacing={1} sx={{ px: { xs: 2, md: 7 }, pb: 2 }}>
                          {children.map((child) => (
                            <Stack
                              key={child.itemKey}
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={1.5}
                              alignItems={{ md: 'center' }}
                              sx={{
                                p: 1.5,
                                borderRadius: 1.5,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: child.enabled ? 'background.paper' : 'background.neutral',
                              }}
                            >
                              {renderMoveButtons(child, children)}
                              <TextField
                                size="small"
                                label="ชื่อเมนูย่อย"
                                value={child.title}
                                onChange={(event) =>
                                  updateItem(child.itemKey, { title: event.target.value })
                                }
                                sx={{ width: { xs: 1, md: 300 } }}
                              />
                              <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                                {child.path}
                              </Typography>
                              <Switch
                                checked={child.enabled}
                                onChange={(_, checked) =>
                                  updateItem(child.itemKey, { enabled: checked })
                                }
                                inputProps={{ 'aria-label': `แสดงเมนู ${child.title}` }}
                              />
                            </Stack>
                          ))}
                        </Stack>
                      ) : null}
                    </Box>
                  );
                })
              : null}
          </Card>

          <Card>
            <Box sx={{ p: 2.5 }}>
              <Typography variant="h6">หน้าเฉพาะวัด</Typography>
              <Typography variant="caption" color="text.secondary">
                หน้าเนื้อหาที่สร้างเพิ่มและต้องการแสดงเป็นเมนูหลัก
              </Typography>
            </Box>
            <Divider />
            {!loading && !customPages.length ? (
              <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
                ยังไม่มีหน้าเฉพาะวัด
              </Typography>
            ) : null}
            {!loading
              ? customPages.toSorted(byOrder).map((page) => (
                  <Stack
                    key={page.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ px: 2.5, py: 1.75, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
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
                      <Typography variant="caption" color="text.secondary">
                        /{page.slug}
                      </Typography>
                    </Box>
                    <Switch
                      checked={page.showInMenu}
                      onChange={() => toggleCustomPage(page.id)}
                      inputProps={{ 'aria-label': `แสดง ${page.title} ในเมนูเว็บไซต์` }}
                    />
                  </Stack>
                ))
              : null}
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
