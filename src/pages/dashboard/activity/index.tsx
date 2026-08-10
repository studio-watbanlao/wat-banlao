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

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import type {
  ActivityGalleryImage,
  ActivityImagePayload,
  ActivityItem,
  ActivityStatus,
  ActivityType,
} from 'src/types/activity';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type FormValue = {
  title: string;
  type: ActivityType;
  description: string;
  content: string;
  status: ActivityStatus;
  coverImage: File | null;
  galleryImages: File[];
  currentGallery: ActivityGalleryImage[];
};

const EMPTY_FORM: FormValue = {
  title: '',
  type: 'temple',
  description: '',
  content: '',
  status: 'PUBLIC',
  coverImage: null,
  galleryImages: [],
  currentGallery: [],
};
const imageLoader = ({ src }: ImageLoaderProps) => src;
const parseGallery = (images: ActivityItem['images']): ActivityGalleryImage[] => {
  if (Array.isArray(images)) return images;
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const toPayload = (file: File): Promise<ActivityImagePayload> =>
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
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview]
  );
  return preview;
};

function CoverInput({
  file,
  url,
  onChange,
}: {
  file: File | null;
  url?: string;
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
            loader={imageLoader}
            src={preview}
            alt="Activity cover preview"
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
    </Stack>
  );
}

const TYPE_LABEL: Record<ActivityType, string> = {
  temple: 'วัด',
  community: 'ชุมชน',
  school: 'โรงเรียน',
};

export default function ActivityManagementPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityItem | null>(null);
  const [form, setForm] = useState<FormValue>(EMPTY_FORM);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/activities');
      setActivities(response.data.activities);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const create = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, galleryImages: [], currentGallery: [] });
    setOpen(true);
  };
  const edit = (activity: ActivityItem) => {
    setEditing(activity);
    setForm({
      title: activity.title,
      type: activity.type || 'temple',
      description: activity.description || '',
      content: activity.content || '',
      status: activity.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
      coverImage: null,
      galleryImages: [],
      currentGallery: parseGallery(activity.images),
    });
    setOpen(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      setError('');
      const [coverImage, galleryImages] = await Promise.all([
        form.coverImage ? toPayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(toPayload)),
      ]);
      const payload = {
        id: editing?.id,
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim(),
        content: form.content,
        status: form.status,
        coverImage,
        galleryImages,
        keptGallerySources: form.currentGallery.map((image) => image.src),
      };
      if (editing) await axios.patch('/api/admin/activities', payload);
      else await axios.post('/api/admin/activities', payload);
      setOpen(false);
      await loadActivities();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (activity: ActivityItem) => {
    if (!window.confirm(`ลบกิจกรรม “${activity.title}” หรือไม่?`)) return;
    try {
      setDeletingId(activity.id);
      setError('');
      await axios.delete('/api/admin/activities', { params: { id: activity.id } });
      setActivities((current) => current.filter((item) => item.id !== activity.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการกิจกรรม</Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อมูลหน้า Activity และกิจกรรมในหน้าแรก
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={create}
            >
              เพิ่มกิจกรรม
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && <Typography color="text.secondary">กำลังโหลด...</Typography>}
          <Grid container spacing={3}>
            {activities.map((activity) => (
              <Grid item xs={12} sm={6} md={4} key={activity.id}>
                <Card>
                  <Box sx={{ height: 230, position: 'relative', bgcolor: 'background.neutral' }}>
                    {activity.imageUrl && (
                      <NextImage
                        loader={imageLoader}
                        src={activity.imageUrl}
                        alt={activity.title}
                        fill
                        sizes="(max-width: 900px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <div>
                        <Typography variant="h6">{activity.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {TYPE_LABEL[activity.type || 'temple']}
                        </Typography>
                      </div>
                      <Chip
                        size="small"
                        label={activity.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                        color={activity.status === 'PUBLIC' ? 'success' : 'default'}
                      />
                    </Stack>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <Button onClick={() => edit(activity)}>แก้ไข</Button>
                    <LoadingButton
                      color="error"
                      loading={deletingId === activity.id}
                      onClick={() => remove(activity)}
                    >
                      ลบ
                    </LoadingButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          {!loading && !activities.length && (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Iconify icon="solar:gallery-wide-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มีกิจกรรม
              </Typography>
            </Card>
          )}
        </Stack>
      </Container>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรม'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              required
              label="ชื่อกิจกรรม"
              value={form.title}
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>ประเภท</InputLabel>
                <Select
                  value={form.type}
                  label="ประเภท"
                  onChange={(event) =>
                    setForm((value) => ({ ...value, type: event.target.value as ActivityType }))
                  }
                >
                  <MenuItem value="temple">วัด</MenuItem>
                  <MenuItem value="community">ชุมชน</MenuItem>
                  <MenuItem value="school">โรงเรียน</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={form.status}
                  label="สถานะ"
                  onChange={(event) =>
                    setForm((value) => ({ ...value, status: event.target.value as ActivityStatus }))
                  }
                >
                  <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                  <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              multiline
              minRows={2}
              label="คำอธิบาย"
              value={form.description}
              onChange={(event) =>
                setForm((value) => ({ ...value, description: event.target.value }))
              }
            />
            <TextField
              multiline
              minRows={6}
              label="เนื้อหา (รองรับ HTML)"
              value={form.content}
              onChange={(event) => setForm((value) => ({ ...value, content: event.target.value }))}
            />
            <CoverInput
              file={form.coverImage}
              url={editing?.imageUrl}
              onChange={(file) => setForm((value) => ({ ...value, coverImage: file }))}
            />
            <Stack spacing={1}>
              <Typography variant="subtitle2">รูป Gallery (สูงสุด 8 รูป)</Typography>
              <Grid container spacing={1}>
                {form.currentGallery.map((image) => (
                  <Grid item xs={4} sm={3} key={image.src}>
                    <Box
                      sx={{
                        height: 110,
                        position: 'relative',
                        overflow: 'hidden',
                        borderRadius: 1,
                      }}
                    >
                      <NextImage
                        loader={imageLoader}
                        src={image.image}
                        alt="Activity gallery"
                        fill
                        sizes="200px"
                        style={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() =>
                          setForm((value) => ({
                            ...value,
                            currentGallery: value.currentGallery.filter(
                              (current) => current.src !== image.src
                            ),
                          }))
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
                {form.galleryImages.map((file, index) => (
                  <Grid item xs={4} sm={3} key={`${file.name}-${file.lastModified}`}>
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
                          setForm((value) => ({
                            ...value,
                            galleryImages: value.galleryImages.filter((_, i) => i !== index),
                          }))
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
                disabled={form.currentGallery.length + form.galleryImages.length >= 8}
              >
                เพิ่มรูป Gallery
                <input
                  hidden
                  multiple
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || []);
                    setForm((value) => ({
                      ...value,
                      galleryImages: [...value.galleryImages, ...files].slice(
                        0,
                        8 - value.currentGallery.length
                      ),
                    }));
                    event.target.value = '';
                  }}
                />
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={saving} onClick={() => setOpen(false)}>
            ยกเลิก
          </Button>
          <LoadingButton
            variant="contained"
            loading={saving}
            disabled={!form.title.trim() || (!editing && !form.coverImage)}
            onClick={save}
          >
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
