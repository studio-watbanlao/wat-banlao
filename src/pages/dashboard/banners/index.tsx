import { zodResolver } from '@hookform/resolvers/zod';
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
import { Controller, useForm } from 'react-hook-form';

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { bannerFormSchema, type BannerFormValues } from 'src/schemas/banner';
import type { BannerImagePayload, BannerItem } from 'src/types/banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const EMPTY_FORM: BannerFormValues = {
  title: '',
  linkUrl: '',
  sortOrder: 0,
  status: 'PUBLIC',
  desktopImage: null,
  mobileImage: null,
  currentDesktopUrl: '',
  currentMobileUrl: '',
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
  error?: string;
  onChange: (file: File | null) => void;
};

function ImageField({ label, hint, file, currentUrl, error, onChange }: ImageFieldProps) {
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
      <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
        {error || `${hint} · JPG, PNG หรือ WebP ไม่เกิน 8 MB`}
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

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: EMPTY_FORM,
    mode: 'onChange',
  });

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
    reset({ ...EMPTY_FORM, sortOrder: banners.length });
    setDialogOpen(true);
  };

  const openEdit = (banner: BannerItem) => {
    setEditingBanner(banner);
    reset({
      title: banner.title,
      linkUrl: banner.linkUrl || '',
      sortOrder: banner.sortOrder,
      status: banner.status,
      desktopImage: null,
      mobileImage: null,
      currentDesktopUrl: banner.desktopImageUrl || banner.imageUrl || '',
      currentMobileUrl: banner.mobileImageUrl || banner.desktopImageUrl || banner.imageUrl || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const saveBanner = handleSubmit(async (form) => {
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
  });

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

  const desktopImage = watch('desktopImage');
  const mobileImage = watch('mobileImage');

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
          <Stack spacing={3} sx={{ pt: 1 }} component="form" onSubmit={saveBanner}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  required
                  label="ชื่อ Banner"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Controller
              name="linkUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="ลิงก์เมื่อคลิก (ไม่บังคับ)"
                  placeholder="https://... หรือ /activity"
                  error={!!errors.linkUrl}
                  helperText={errors.linkUrl?.message}
                />
              )}
            />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Controller
                name="sortOrder"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ลำดับ"
                    type="number"
                    error={!!errors.sortOrder}
                    helperText={errors.sortOrder?.message}
                  />
                )}
              />
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>สถานะ</InputLabel>
                    <Select {...field} label="สถานะ">
                      <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Controller
                name="desktopImage"
                control={control}
                render={({ field }) => (
                  <ImageField
                    label="รูป Desktop"
                    hint="แนะนำ 1920 × 720 px"
                    file={desktopImage}
                    currentUrl={editingBanner?.desktopImageUrl || editingBanner?.imageUrl}
                    error={errors.desktopImage?.message}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                name="mobileImage"
                control={control}
                render={({ field }) => (
                  <ImageField
                    label="รูป Mobile"
                    hint="แนะนำ 750 × 900 px"
                    file={mobileImage}
                    currentUrl={
                      editingBanner?.mobileImageUrl ||
                      editingBanner?.desktopImageUrl ||
                      editingBanner?.imageUrl
                    }
                    error={errors.mobileImage?.message}
                    onChange={field.onChange}
                  />
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={closeDialog} disabled={saving}>
            ยกเลิก
          </Button>
          <LoadingButton variant="contained" loading={saving} onClick={saveBanner}>
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
