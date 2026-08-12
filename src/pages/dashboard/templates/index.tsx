import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { useAuthContext } from 'src/auth/hooks';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import type {
  ManagedPublicTemplate,
  PublicTemplateKey,
  PublicTemplateStatus,
} from 'src/public-templates/catalog';
import { resolvePublicTemplateKey } from 'src/public-templates/catalog';
import { PUBLIC_TEMPLE_QUERY_KEY } from 'src/public-templates/use-public-temple';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import PublicTemplatePreviewDialog from 'src/sections/admin/public-template-preview-dialog';
import type { Temple } from 'src/types/temple';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

function TemplatePreview({ template }: { template: ManagedPublicTemplate }) {
  return (
    <Box
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: template.preview.background,
      }}
    >
      <Box sx={{ height: 9, bgcolor: template.preview.accent }} />
      <Box
        sx={{
          height: 36,
          px: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: template.preview.surface,
        }}
      >
        <Box
          sx={{ width: 13, height: 13, borderRadius: '50%', bgcolor: template.preview.accent }}
        />
        <Box
          sx={{
            width: '36%',
            height: 5,
            borderRadius: 4,
            bgcolor: template.preview.text,
            opacity: 0.82,
          }}
        />
        <Box
          sx={{
            ml: 'auto',
            width: '28%',
            height: 4,
            borderRadius: 4,
            bgcolor: template.preview.text,
            opacity: 0.35,
          }}
        />
      </Box>
      <Box sx={{ px: 2, py: 2.5, textAlign: 'center' }}>
        <Box
          sx={{
            width: '55%',
            height: 9,
            mx: 'auto',
            borderRadius: 4,
            bgcolor: template.preview.text,
          }}
        />
        <Box
          sx={{
            width: '72%',
            height: 4,
            mt: 1,
            mx: 'auto',
            borderRadius: 4,
            bgcolor: template.preview.text,
            opacity: 0.35,
          }}
        />
        <Box
          sx={{
            height: 52,
            mt: 2,
            borderRadius: 1.5,
            bgcolor: template.preview.surface,
            border: '1px solid rgba(0,0,0,0.06)',
          }}
        />
      </Box>
      <Box
        sx={{
          height: 24,
          bgcolor: template.key === 'serene' ? '#25302B' : template.preview.surface,
        }}
      />
    </Box>
  );
}

export default function PublicTemplatesPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<ManagedPublicTemplate[]>([]);
  const [temples, setTemples] = useState<Temple[]>([]);
  const [selected, setSelected] = useState<Record<string, PublicTemplateKey>>({});
  const [savingId, setSavingId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canWriteScaffold, setCanWriteScaffold] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ManagedPublicTemplate | null>(null);
  const [editingKey, setEditingKey] = useState('');
  const [templateForm, setTemplateForm] = useState({
    templateKey: '',
    name: '',
    description: '',
    status: 'DRAFT' as PublicTemplateStatus,
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/public-templates');
      const nextTemples = response.data.temples as Temple[];
      setTemplates(response.data.templates);
      setTemples(nextTemples);
      setCanWriteScaffold(Boolean(response.data.canWriteScaffold));
      setSelected(
        Object.fromEntries(
          nextTemples.map((temple) => [
            temple.id,
            resolvePublicTemplateKey(temple.branding.publicTemplate),
          ])
        )
      );
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
    if (user?.role === 'super_admin') load();
  }, [load, router, user?.role]);

  const openCreateDialog = () => {
    setEditingKey('');
    setTemplateForm({ templateKey: '', name: '', description: '', status: 'DRAFT' });
    setDialogOpen(true);
  };

  const openEditDialog = (template: ManagedPublicTemplate) => {
    setEditingKey(template.key);
    setTemplateForm({
      templateKey: template.key,
      name: template.name,
      description: template.description,
      status: template.status,
    });
    setDialogOpen(true);
  };

  const saveTemplateMetadata = async () => {
    try {
      setSavingId(editingKey || 'new-template');
      setError('');
      setSuccess('');
      if (editingKey) {
        await axios.patch('/api/admin/public-templates', {
          action: 'updateTemplate',
          ...templateForm,
        });
        setSuccess(`บันทึกข้อมูล ${templateForm.name} แล้ว`);
      } else {
        const response = await axios.post('/api/admin/public-templates', templateForm);
        const scaffold = response.data.scaffold as { created: boolean; path: string };
        setSuccess(
          scaffold.created
            ? `สร้าง DRAFT และ folder ${scaffold.path} แล้ว`
            : `สร้าง DRAFT แล้ว — นำ code ลงเครื่องและรัน: ${response.data.command}`
        );
      }
      setDialogOpen(false);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingId('');
    }
  };

  const save = async (temple: Temple) => {
    try {
      setSavingId(temple.id);
      setError('');
      setSuccess('');
      await axios.patch('/api/admin/public-templates', {
        templeId: temple.id,
        templateKey: selected[temple.id],
      });
      await queryClient.invalidateQueries({
        queryKey: PUBLIC_TEMPLE_QUERY_KEY,
        refetchType: 'all',
      });
      setTemples((current) =>
        current.map((item) =>
          item.id === temple.id
            ? { ...item, branding: { ...item.branding, publicTemplate: selected[temple.id] } }
            : item
        )
      );
      setSuccess(
        `เปลี่ยน Template ของ ${temple.name} แล้ว — หน้าเว็บของวัดจะใช้ธีมใหม่ทันที`
      );
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingId('');
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4">จัดการธีมเว็บไซต์</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  แก้ชื่อและรายละเอียด หรือสร้าง DRAFT เพื่อเตรียม folder สำหรับเขียน code ชุดใหม่
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={openCreateDialog}
              >
                เพิ่ม Template
              </Button>
            </Stack>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Box
            sx={{
              display: 'grid',
              gap: 3,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            {templates.map((template) => (
              <Card key={template.key}>
                <CardContent>
                  <TemplatePreview template={template} />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mt: 2.5 }}
                  >
                    <Typography variant="h6">{template.name}</Typography>
                    <Stack direction="row" spacing={1}>
                      <Chip size="small" label={template.key} />
                      <Chip
                        size="small"
                        color={
                          template.status === 'READY'
                            ? 'success'
                            : template.status === 'DRAFT'
                              ? 'warning'
                              : 'default'
                        }
                        label={template.status}
                      />
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {template.description}
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                    {template.features.map((feature) => (
                      <Chip
                        key={feature}
                        size="small"
                        variant="soft"
                        color="primary"
                        label={feature}
                      />
                    ))}
                  </Stack>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 2.5 }}
                  >
                    <Typography
                      variant="caption"
                      color={template.codeAvailable ? 'success.main' : 'warning.main'}
                    >
                      {template.codeAvailable
                        ? 'มี code และ register แล้ว'
                        : `รอเขียน code: ${template.scaffoldPath}`}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        startIcon={<Iconify icon="solar:eye-bold" />}
                        onClick={() => setPreviewTemplate(template)}
                      >
                        ดูตัวอย่าง
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Iconify icon="solar:pen-bold" />}
                        onClick={() => openEditDialog(template)}
                      >
                        แก้ไข
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6">กำหนด Template ให้แต่ละวัด</Typography>
              <Typography variant="body2" color="text.secondary">
                การเปลี่ยนมีผลกับ Public Site ของวัดนั้นโดยไม่กระทบข้อมูลเนื้อหา
              </Typography>
            </Box>
            <TableContainer>
              <Table sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>วัด</TableCell>
                    <TableCell>Template ที่ใช้งาน</TableCell>
                    <TableCell align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    temples.map((temple) => {
                      const original = resolvePublicTemplateKey(temple.branding.publicTemplate);
                      const changed = selected[temple.id] !== original;
                      return (
                        <TableRow key={temple.id} hover>
                          <TableCell>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Avatar
                                src={temple.branding.logoUrl}
                                sx={{ bgcolor: temple.branding.primaryColor }}
                              >
                                {temple.name.slice(0, 1)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2">{temple.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {temple.slug}
                                </Typography>
                              </Box>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={selected[temple.id] || 'custom'}
                              onChange={(event) =>
                                setSelected((current) => ({
                                  ...current,
                                  [temple.id]: event.target.value as PublicTemplateKey,
                                }))
                              }
                              sx={{ minWidth: 220 }}
                            >
                              {templates
                                .filter(
                                  (template) =>
                                    template.status === 'READY' && template.codeAvailable
                                )
                                .map((template) => (
                                  <MenuItem key={template.key} value={template.key}>
                                    {template.name}
                                  </MenuItem>
                                ))}
                            </Select>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              <Button
                                component="a"
                                href={`${paths.dashboard.templates}/preview?${new URLSearchParams({
                                  templeId: temple.id,
                                  template: selected[temple.id] || original,
                                }).toString()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="outlined"
                                startIcon={<Iconify icon="solar:eye-bold" />}
                              >
                                ดูหน้าเว็บ
                              </Button>
                              <Button
                                variant={changed ? 'contained' : 'outlined'}
                                disabled={!changed || Boolean(savingId)}
                                startIcon={
                                  savingId === temple.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <Iconify icon="solar:diskette-bold" />
                                  )
                                }
                                onClick={() => save(temple)}
                              >
                                บันทึก
                              </Button>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>
              {editingKey ? 'แก้ไข Public Template' : 'เพิ่ม Public Template'}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2.5} sx={{ pt: 1 }}>
                <TextField
                  label="Template key"
                  value={templateForm.templateKey}
                  disabled={Boolean(editingKey)}
                  placeholder="modern-temple"
                  helperText={
                    editingKey
                      ? 'ไม่สามารถเปลี่ยน key หลังสร้างได้'
                      : 'ตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น'
                  }
                  onChange={(event) =>
                    setTemplateForm((current) => ({
                      ...current,
                      templateKey: event.target.value.toLowerCase(),
                    }))
                  }
                />
                <TextField
                  required
                  label="ชื่อ Template"
                  value={templateForm.name}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, name: event.target.value }))
                  }
                />
                <TextField
                  multiline
                  minRows={3}
                  label="Description"
                  value={templateForm.description}
                  onChange={(event) =>
                    setTemplateForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
                {editingKey ? (
                  <TextField
                    select
                    label="สถานะ"
                    value={templateForm.status}
                    onChange={(event) =>
                      setTemplateForm((current) => ({
                        ...current,
                        status: event.target.value as PublicTemplateStatus,
                      }))
                    }
                    helperText={
                      !templates.find((template) => template.key === editingKey)?.codeAvailable
                        ? 'ต้อง register code และ deploy ก่อนจึงเปลี่ยนเป็น READY ได้'
                        : ''
                    }
                  >
                    <MenuItem value="DRAFT">DRAFT — รอเขียน code</MenuItem>
                    <MenuItem
                      value="READY"
                      disabled={
                        !templates.find((template) => template.key === editingKey)?.codeAvailable
                      }
                    >
                      READY — พร้อมเลือกใช้
                    </MenuItem>
                    <MenuItem value="ARCHIVED">ARCHIVED — เลิกใช้งาน</MenuItem>
                  </TextField>
                ) : (
                  <Alert severity="info">
                    {canWriteScaffold
                      ? 'ระบบกำลังรันแบบ local: เมื่อบันทึกจะสร้าง folder ให้อัตโนมัติ'
                      : 'บน Cloud ระบบจะสร้าง DRAFT และแสดงคำสั่งสำหรับสร้าง folder ในเครื่องนักพัฒนา'}
                  </Alert>
                )}
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button color="inherit" onClick={() => setDialogOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant="contained"
                disabled={
                  !templateForm.templateKey || !templateForm.name.trim() || Boolean(savingId)
                }
                onClick={saveTemplateMetadata}
              >
                {savingId ? 'กำลังบันทึก...' : editingKey ? 'บันทึก' : 'สร้าง DRAFT'}
              </Button>
            </DialogActions>
          </Dialog>

          <PublicTemplatePreviewDialog
            open={Boolean(previewTemplate)}
            template={previewTemplate}
            temples={temples}
            onClose={() => setPreviewTemplate(null)}
          />
        </Stack>
      </Container>
    </Layout>
  );
}
