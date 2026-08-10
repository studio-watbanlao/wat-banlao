import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import type { BannerImagePayload, BannerItem, BannerStatus } from 'src/types/banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type BannerForm = {
  title: string;
  linkUrl: string;
  sortOrder: number;
  status: BannerStatus;
  desktopImage: File | null;
  mobileImage: File | null;
};

const EMPTY_FORM: BannerForm = {
  title: '',
  linkUrl: '',
  sortOrder: 0,
  status: 'PUBLIC',
  desktopImage: null,
  mobileImage: null,
};

const fileToPayload = (file: File): Promise<BannerImagePayload> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`อ่านไฟล์ ${file.name} ไม่สำเร็จ`));
    reader.onload = () => {
      const result = String(reader.result);
      resolve({ name: file.name, type: file.type, base64: result.split(',')[1] || '' });
    };
    reader.readAsDataURL(file);
  });

const useFilePreview = (file: File | null) => {
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  return preview;
};

type ImageFieldProps = {
  label: string;
  hint: string;
  file: File | null;
  currentUrl?: string;
  onChange: (file: File | null) => void;
};

function ImageField({ label, hint, file, currentUrl, onChange }: ImageFieldProps) {
  const preview = useFilePreview(file) || currentUrl;

  return (
    <Stack spacing={1} sx={{ flex: 1 }}>
      <Typography variant="subtitle2">{label}</Typography>
      <Box
        sx={{
          height: 180,
          borderRadius: 1.5,
          border: '1px dashed',
          borderColor: 'divider',
          bgcolor: 'background.neutral',
          backgroundImage: preview ? `url("${preview}")` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {!preview && <Iconify icon="solar:gallery-add-bold" width={42} />}
      </Box>
      <Button component="label" variant="outlined" startIcon={<Iconify icon="eva:upload-fill" />}>
        {preview ? 'เปลี่ยนรูป' : 'เลือกรูป'}
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </Button>
      <Typography variant="caption" color="text.secondary">
        {hint} · JPG, PNG หรือ WebP ไม่เกิน 8 MB
      </Typography>
    </Stack>
  );
}

export default function BannerManagementPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);
  const [form, setForm] = useState<BannerForm>(EMPTY_FORM);

  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/banners');
      setBanners(response.data.banners);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const openCreate = () => {
    setEditingBanner(null);
    setForm({ ...EMPTY_FORM, sortOrder: banners.length });
    setDialogOpen(true);
  };

  const openEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    setForm({
      title: banner.title,
      linkUrl: banner.linkUrl || '',
      sortOrder: banner.sortOrder,
      status: banner.status,
      desktopImage: null,
      mobileImage: null,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const saveBanner = async () => {
    try {
      setSaving(true);
      setError('');
      const [desktopImage, mobileImage] = await Promise.all([
        form.desktopImage ? fileToPayload(form.desktopImage) : null,
        form.mobileImage ? fileToPayload(form.mobileImage) : null,
      ]);
      const payload = {
        id: editingBanner?.id,
        title: form.title.trim(),
        linkUrl: form.linkUrl.trim(),
        sortOrder: form.sortOrder,
        status: form.status,
        desktopImage,
        mobileImage,
      };

      if (editingBanner) await axios.patch('/api/admin/banners', payload);
      else await axios.post('/api/admin/banners', payload);

      setDialogOpen(false);
      await loadBanners();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const removeBanner = async (banner: BannerItem) => {
    if (!window.confirm(`ลบ Banner “${banner.title}” หรือไม่?`)) return;
    try {
      setDeletingId(banner.id);
      setError('');
      await axios.delete('/api/admin/banners', { params: { id: banner.id } });
      setBanners((current) => current.filter((item) => item.id !== banner.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  const validForm =
    Boolean(form.title.trim()) &&
    (Boolean(editingBanner) || (Boolean(form.desktopImage) && Boolean(form.mobileImage)));

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการ Banner</Typography>
              <Typography variant="body2" color="text.secondary">
                Banner หน้าแรกสำหรับ Desktop และ Mobile
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={openCreate}
            >
              เพิ่ม Banner
            </Button>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}
          {loading && <Typography color="text.secondary">กำลังโหลด...</Typography>}

          <Grid container spacing={3}>
            {banners.map((banner) => (
              <Grid item xs={12} md={6} lg={4} key={banner.id}>
                <Card>
                  <Box
                    sx={{
                      height: 210,
                      backgroundImage: `url("${banner.desktopImageUrl || banner.imageUrl}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography variant="h6" noWrap>
                        {banner.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={banner.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                        color={banner.status === 'PUBLIC' ? 'success' : 'default'}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      ลำดับ {banner.sortOrder}
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button onClick={() => openEdit(banner)}>แก้ไข</Button>
                    <LoadingButton
                      color="error"
                      loading={deletingId === banner.id}
                      onClick={() => removeBanner(banner)}
                    >
                      ลบ
                    </LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {!loading && banners.length === 0 && (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Iconify icon="solar:gallery-wide-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มี Banner
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingBanner ? 'แก้ไข Banner' : 'เพิ่ม Banner'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              required
              label="ชื่อ Banner"
              value={form.title}
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
            />
            <TextField
              fullWidth
              label="ลิงก์เมื่อคลิก (ไม่บังคับ)"
              placeholder="https://... หรือ /activity"
              value={form.linkUrl}
              onChange={(event) => setForm((value) => ({ ...value, linkUrl: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="ลำดับ"
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((value) => ({ ...value, sortOrder: Number(event.target.value) }))
                }
              />
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={form.status}
                  label="สถานะ"
                  onChange={(event) =>
                    setForm((value) => ({ ...value, status: event.target.value as BannerStatus }))
                  }
                >
                  <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                  <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <ImageField
                label="รูป Desktop"
                hint="แนะนำ 1920 × 720 px"
                file={form.desktopImage}
                currentUrl={editingBanner?.desktopImageUrl || editingBanner?.imageUrl}
                onChange={(file) => setForm((value) => ({ ...value, desktopImage: file }))}
              />
              <ImageField
                label="รูป Mobile"
                hint="แนะนำ 750 × 900 px"
                file={form.mobileImage}
                currentUrl={
                  editingBanner?.mobileImageUrl ||
                  editingBanner?.desktopImageUrl ||
                  editingBanner?.imageUrl
                }
                onChange={(file) => setForm((value) => ({ ...value, mobileImage: file }))}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={closeDialog} disabled={saving}>
            ยกเลิก
          </Button>
          <LoadingButton
            variant="contained"
            loading={saving}
            disabled={!validForm}
            onClick={saveBanner}
          >
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
