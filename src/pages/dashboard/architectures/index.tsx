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
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import NextImage, { ImageLoaderProps } from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from 'src/utils/zod-resolver';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { architectureFormSchema, type ArchitectureFormValues } from 'src/schemas/architecture';
import type {
  ArchitectureGalleryImage,
  ArchitectureImagePayload,
  ArchitectureItem,
} from 'src/types/architecture';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const EMPTY: ArchitectureFormValues = {
  title: '',
  year: '',
  description: '',
  content: '',
  videoUrl: '',
  logoUrl: '',
  openingUrl: '',
  status: 'PUBLIC',
  coverImage: null,
  currentImageUrl: '',
  galleryImages: [],
};
const loader = ({ src }: ImageLoaderProps) => src;
const filePayload = (file: File): Promise<ArchitectureImagePayload> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`อ่านไฟล์ ${file.name} ไม่สำเร็จ`));
    reader.onload = () =>
      resolve({
        name: file.name,
        type: file.type,
        base64: String(reader.result).split(',')[1] || '',
      });
    reader.readAsDataURL(file);
  });
const usePreview = (file: File | null) => {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(
    () => () => {
      if (url) URL.revokeObjectURL(url);
    },
    [url]
  );
  return url;
};

function Cover({
  file,
  url,
  error,
  onChange,
}: {
  file: File | null;
  url?: string;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  const preview = usePreview(file) || url;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">รูปหน้าปก *</Typography>
      <Box
        sx={{
          height: 280,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'background.neutral',
        }}
      >
        {preview ? (
          <NextImage
            loader={loader}
            src={preview}
            alt="Architecture preview"
            fill
            sizes="800px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
            <Iconify icon="solar:gallery-add-bold" width={48} />
          </Stack>
        )}
      </Box>
      <Button component="label" variant="outlined">
        {preview ? 'เปลี่ยนรูปหน้าปก' : 'เลือกรูปหน้าปก'}
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </Button>
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function ArchitectureManagementPage() {
  const router = useRouter();
  const [items, setItems] = useState<ArchitectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing] = useState<ArchitectureItem | null>(null);
  const [currentGallery, setCurrentGallery] = useState<ArchitectureGalleryImage[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ArchitectureFormValues>({
    resolver: zodResolver(architectureFormSchema),
    defaultValues: EMPTY,
    mode: 'onChange',
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/architectures');
      setItems(response.data.architectures);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);
  const edit = (item: ArchitectureItem) =>
    router.push(paths.dashboard.architectureEdit(item.id));
  const save = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const [coverImage, galleryImages] = await Promise.all([
        form.coverImage ? filePayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(filePayload)),
      ]);
      const payload = {
        id: editing?.id,
        title: form.title.trim(),
        year: form.year.trim(),
        description: form.description.trim(),
        content: form.content,
        videoUrl: form.videoUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        openingUrl: form.openingUrl.trim(),
        status: form.status,
        coverImage,
        galleryImages,
        keptGallerySources: currentGallery.map((image) => image.src),
      };
      if (editing) await axios.patch('/api/admin/architectures', payload);
      else await axios.post('/api/admin/architectures', payload);
      setOpen(false);
      await load();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  });
  const remove = async (item: ArchitectureItem) => {
    if (!window.confirm(`ลบ “${item.title}” หรือไม่?`)) return;
    try {
      setDeleting(item.id);
      setError('');
      await axios.delete('/api/admin/architectures', { params: { id: item.id } });
      setItems((current) => current.filter((value) => value.id !== item.id));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setDeleting('');
    }
  };

  const coverImage = watch('coverImage');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการสถาปัตย์และสิ่งสำคัญ</Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อมูลหน้า Architecture
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => router.push(paths.dashboard.architectureNew)}
            >
              เพิ่มข้อมูล
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && <Typography color="text.secondary">กำลังโหลด...</Typography>}
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card>
                  <Box sx={{ height: 230, position: 'relative', bgcolor: 'background.neutral' }}>
                    {item.imageUrl && (
                      <NextImage
                        loader={loader}
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <div>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          สร้างเมื่อปี {item.year || '-'}
                        </Typography>
                      </div>
                      <Chip
                        size="small"
                        label={item.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                        color={item.status === 'PUBLIC' ? 'success' : 'default'}
                      />
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button onClick={() => edit(item)}>แก้ไข</Button>
                    <LoadingButton
                      color="error"
                      loading={deleting === item.id}
                      onClick={() => remove(item)}
                    >
                      ลบ
                    </LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {!loading && !items.length && (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Typography variant="h6">ยังไม่มีข้อมูลสถาปัตย์</Typography>
            </Card>
          )}
        </Stack>
      </Container>
      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลสถาปัตย์'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }} component="form" onSubmit={save}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="ชื่อ"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="ปีที่สร้าง" />}
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
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} multiline minRows={2} label="คำอธิบาย" />
              )}
            />
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField {...field} multiline minRows={6} label="เนื้อหา (รองรับ HTML)" />
              )}
            />
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <Cover
                  file={coverImage}
                  url={editing?.imageUrl}
                  error={errors.coverImage?.message}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="galleryImages"
              control={control}
              render={({ field }) => (
                <Stack spacing={1}>
                  <Typography variant="subtitle2">รูป Gallery (สูงสุด 8 รูป)</Typography>
                  <Grid container spacing={1}>
                    {currentGallery.map((image) => (
                      <Grid size={{ xs: 4, sm: 3 }} key={image.src}>
                        <Box sx={{ height: 110, position: 'relative', overflow: 'hidden' }}>
                          <NextImage
                            loader={loader}
                            src={image.image}
                            alt="Architecture gallery"
                            fill
                            sizes="200px"
                            style={{ objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() =>
                              setCurrentGallery((current) =>
                                current.filter((c) => c.src !== image.src)
                              )
                            }
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              color: 'white',
                              bgcolor: 'rgba(0,0,0,.55)',
                            }}
                          >
                            <Iconify icon="mingcute:close-line" />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                    {field.value.map((file, index) => (
                      <Grid size={{ xs: 4, sm: 3 }} key={`${file.name}-${file.lastModified}`}>
                        <Stack
                          direction="row"
                          alignItems="center"
                          sx={{ height: 110, px: 1, bgcolor: 'background.neutral' }}
                        >
                          <Typography variant="caption" noWrap>
                            {file.name}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() =>
                              field.onChange(field.value.filter((_, i) => i !== index))
                            }
                          >
                            <Iconify icon="mingcute:close-line" />
                          </IconButton>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={currentGallery.length + field.value.length >= 8}
                  >
                    เพิ่มรูป Gallery
                    <input
                      hidden
                      multiple
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) => {
                        const files = Array.from(event.target.files || []);
                        field.onChange(
                          [...field.value, ...files].slice(0, 8 - currentGallery.length)
                        );
                        event.target.value = '';
                      }}
                    />
                  </Button>
                </Stack>
              )}
            />
            <Controller
              name="videoUrl"
              control={control}
              render={({ field }) => <TextField {...field} label="YouTube URL" />}
            />
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => <TextField {...field} label="Logo URL" />}
            />
            <Controller
              name="openingUrl"
              control={control}
              render={({ field }) => <TextField {...field} label="วิดีโอเปิดงาน URL" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={saving} onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <LoadingButton variant="contained" loading={saving} onClick={save}>
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
