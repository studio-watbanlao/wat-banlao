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
  ArchitectureGalleryImage,
  ArchitectureImagePayload,
  ArchitectureItem,
  ArchitectureStatus,
} from 'src/types/architecture';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type FormValue = {
  title: string;
  year: string;
  description: string;
  content: string;
  videoUrl: string;
  logoUrl: string;
  openingUrl: string;
  status: ArchitectureStatus;
  coverImage: File | null;
  galleryImages: File[];
  currentGallery: ArchitectureGalleryImage[];
};
const EMPTY: FormValue = {
  title: '',
  year: '',
  description: '',
  content: '',
  videoUrl: '',
  logoUrl: '',
  openingUrl: '',
  status: 'PUBLIC',
  coverImage: null,
  galleryImages: [],
  currentGallery: [],
};
const loader = ({ src }: ImageLoaderProps) => src;
const parseGallery = (value: ArchitectureItem['images']): ArchitectureGalleryImage[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const result = JSON.parse(value);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
};
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
    </Stack>
  );
}

export default function ArchitectureManagementPage() {
  const [items, setItems] = useState<ArchitectureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ArchitectureItem | null>(null);
  const [form, setForm] = useState<FormValue>(EMPTY);

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
  const create = () => {
    setEditing(null);
    setForm({ ...EMPTY, galleryImages: [], currentGallery: [] });
    setOpen(true);
  };
  const edit = (item: ArchitectureItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      year: item.year || '',
      description: item.description || '',
      content: item.content || '',
      videoUrl: item.videoUrl || '',
      logoUrl: item.logoUrl || '',
      openingUrl: item.openingUrl || '',
      status: item.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
      coverImage: null,
      galleryImages: [],
      currentGallery: parseGallery(item.images),
    });
    setOpen(true);
  };
  const save = async () => {
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
        keptGallerySources: form.currentGallery.map((image) => image.src),
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
  };
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
              onClick={create}
            >
              เพิ่มข้อมูล
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && <Typography color="text.secondary">กำลังโหลด...</Typography>}
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
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
          <Stack spacing={3} sx={{ pt: 1 }}>
            <TextField
              required
              label="ชื่อ"
              value={form.title}
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="ปีที่สร้าง"
                value={form.year}
                onChange={(event) => setForm((value) => ({ ...value, year: event.target.value }))}
              />
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={form.status}
                  label="สถานะ"
                  onChange={(event) =>
                    setForm((value) => ({
                      ...value,
                      status: event.target.value as ArchitectureStatus,
                    }))
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
            <Cover
              file={form.coverImage}
              url={editing?.imageUrl}
              onChange={(file) => setForm((value) => ({ ...value, coverImage: file }))}
            />
            <Stack spacing={1}>
              <Typography variant="subtitle2">รูป Gallery (สูงสุด 8 รูป)</Typography>
              <Grid container spacing={1}>
                {form.currentGallery.map((image) => (
                  <Grid item xs={4} sm={3} key={image.src}>
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
            <TextField
              label="YouTube URL"
              value={form.videoUrl}
              onChange={(event) => setForm((value) => ({ ...value, videoUrl: event.target.value }))}
            />
            <TextField
              label="Logo URL"
              value={form.logoUrl}
              onChange={(event) => setForm((value) => ({ ...value, logoUrl: event.target.value }))}
            />
            <TextField
              label="วิดีโอเปิดงาน URL"
              value={form.openingUrl}
              onChange={(event) =>
                setForm((value) => ({ ...value, openingUrl: event.target.value }))
              }
            />
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
