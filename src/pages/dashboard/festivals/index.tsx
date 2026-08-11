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
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { festivalFormSchema, type FestivalFormValues } from 'src/schemas/festival';
import type { FestivalGalleryImage, FestivalImagePayload, FestivalItem } from 'src/types/festival';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

const EMPTY_FORM: FestivalFormValues = {
  title: '',
  year: String(new Date().getFullYear() + 543),
  no: '',
  description: '',
  content: '',
  videoUrl: '',
  openingUrl: '',
  logoUrl: '',
  status: 'PUBLIC',
  coverImage: null,
  currentImageUrl: '',
  galleryImages: [],
};

const passthroughLoader = ({ src }: ImageLoaderProps) => src;

const fileToPayload = (file: File): Promise<FestivalImagePayload> =>
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

function CoverField({
  file,
  currentUrl,
  error,
  onChange,
}: {
  file: File | null;
  currentUrl?: string;
  error?: string;
  onChange: (file: File | null) => void;
}) {
  const preview = useFilePreview(file) || currentUrl;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">รูปหน้าปก *</Typography>
      <Box
        sx={{
          height: 260,
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.neutral',
        }}
      >
        {preview ? (
          <NextImage
            loader={passthroughLoader}
            src={preview}
            alt="Festival cover preview"
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
      <Button component="label" variant="outlined" startIcon={<Iconify icon="eva:upload-fill" />}>
        {preview ? 'เปลี่ยนรูปหน้าปก' : 'เลือกรูปหน้าปก'}
        <input
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </Button>
      <Typography variant="caption" color={error ? 'error' : 'text.secondary'}>
        {error || 'แนะนำอัตราส่วน 4:3 · ไม่เกิน 8 MB'}
      </Typography>
    </Stack>
  );
}

export default function FestivalManagementPage() {
  const [festivals, setFestivals] = useState<FestivalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFestival] = useState<FestivalItem | null>(null);
  const [currentGallery, setCurrentGallery] = useState<FestivalGalleryImage[]>([]);
  const [removedGalleryPaths, setRemovedGalleryPaths] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FestivalFormValues>({
    resolver: zodResolver(festivalFormSchema),
    defaultValues: EMPTY_FORM,
    mode: 'onChange',
  });

  const loadFestivals = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/festivals');
      setFestivals(response.data.festivals);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFestivals();
  }, [loadFestivals]);

  const removeCurrentGallery = (image: FestivalGalleryImage) => {
    setCurrentGallery((current) => current.filter((item) => item.src !== image.src));
    if (image.storagePath) setRemovedGalleryPaths((current) => [...current, image.storagePath!]);
  };

  const saveFestival = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const [coverImage, galleryImages] = await Promise.all([
        form.coverImage ? fileToPayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(fileToPayload)),
      ]);
      const payload = {
        id: editingFestival?.id,
        title: form.title.trim(),
        year: form.year.trim(),
        no: form.no.trim(),
        description: form.description.trim(),
        content: form.content,
        videoUrl: form.videoUrl.trim(),
        openingUrl: form.openingUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        status: form.status,
        coverImage,
        galleryImages,
        keptGallerySources: currentGallery.map((image) => image.src),
        removedGalleryPaths,
      };
      if (editingFestival) await axios.patch('/api/admin/festivals', payload);
      else await axios.post('/api/admin/festivals', payload);
      setDialogOpen(false);
      await loadFestivals();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  const removeFestival = async (festival: FestivalItem) => {
    if (!window.confirm(`ลบ Festival “${festival.title}” หรือไม่?`)) return;
    try {
      setDeletingId(festival.id);
      setError('');
      await axios.delete('/api/admin/festivals', { params: { id: festival.id } });
      setFestivals((current) => current.filter((item) => item.id !== festival.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  const coverImage = watch('coverImage');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการ Festival</Typography>
              <Typography variant="body2" color="text.secondary">
                เทศกาลงานบุญประจำปี
              </Typography>
            </div>
            <Button
              component={RouterLink}
              href={paths.dashboard.festivalNew}
              variant="contained"
              startIcon={<Iconify icon="ri:add-line" />}
            >
              เพิ่ม Festival
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && <Typography color="text.secondary">กำลังโหลด...</Typography>}
          <Grid container spacing={3}>
            {festivals.map((festival) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={festival.id}>
                <Card>
                  <Box sx={{ height: 220, position: 'relative', bgcolor: 'background.neutral' }}>
                    {festival.imageUrl && (
                      <NextImage
                        loader={passthroughLoader}
                        src={festival.imageUrl}
                        alt={festival.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <div>
                        <Typography variant="h6">{festival.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ครั้งที่ {festival.no || '-'} · ปี {festival.year}
                        </Typography>
                      </div>
                      <Chip
                        size="small"
                        label={festival.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                        color={festival.status === 'PUBLIC' ? 'success' : 'default'}
                      />
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button
                      component={RouterLink}
                      href={paths.dashboard.festivalEdit(festival.id)}
                    >
                      แก้ไข
                    </Button>
                    <LoadingButton
                      color="error"
                      loading={deletingId === festival.id}
                      onClick={() => removeFestival(festival)}
                    >
                      ลบ
                    </LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {!loading && festivals.length === 0 && (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Iconify icon="solar:calendar-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มี Festival
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editingFestival ? 'แก้ไข Festival' : 'เพิ่ม Festival'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }} component="form" onSubmit={saveFestival}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="ชื่อ Festival"
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="ปี"
                    error={!!errors.year}
                    helperText={errors.year?.message}
                  />
                )}
              />
              <Controller
                name="no"
                control={control}
                render={({ field }) => <TextField {...field} fullWidth label="ครั้งที่" />}
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
                <TextField {...field} multiline minRows={5} label="เนื้อหา (รองรับ HTML)" />
              )}
            />
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <CoverField
                  file={coverImage}
                  currentUrl={editingFestival?.imageUrl}
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
                        <Box
                          sx={{
                            height: 110,
                            position: 'relative',
                            overflow: 'hidden',
                            borderRadius: 1,
                          }}
                        >
                          <NextImage
                            loader={passthroughLoader}
                            src={image.image}
                            alt="Festival gallery"
                            fill
                            sizes="200px"
                            style={{ objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeCurrentGallery(image)}
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
                        <Box
                          sx={{
                            height: 110,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: 'background.neutral',
                            px: 1,
                          }}
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
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Button
                    component="label"
                    variant="outlined"
                    disabled={currentGallery.length + field.value.length >= 8}
                  >
                    <Iconify icon="eva:upload-fill" sx={{ mr: 1 }} />
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
                  {errors.galleryImages ? (
                    <Typography variant="caption" color="error">
                      {errors.galleryImages.message ||
                        (Array.isArray(errors.galleryImages)
                          ? errors.galleryImages.find((item) => item)?.message
                          : '')}
                    </Typography>
                  ) : null}
                </Stack>
              )}
            />
            <Controller
              name="videoUrl"
              control={control}
              render={({ field }) => <TextField {...field} label="YouTube URL" />}
            />
            <Controller
              name="openingUrl"
              control={control}
              render={({ field }) => <TextField {...field} label="วิดีโอเปิดงาน URL" />}
            />
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => <TextField {...field} label="Logo URL" />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={saving} onClick={() => setDialogOpen(false)}>
            ยกเลิก
          </Button>
          <LoadingButton variant="contained" loading={saving} onClick={saveFestival}>
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
