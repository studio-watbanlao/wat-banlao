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
  SacredGalleryImage,
  SacredImagePayload,
  SacredItem,
  SacredStatus,
} from 'src/types/sacred';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type SacredForm = {
  title: string;
  year: string;
  description: string;
  content: string;
  status: SacredStatus;
  coverImage: File | null;
  galleryImages: File[];
  currentGallery: SacredGalleryImage[];
};

const EMPTY_FORM: SacredForm = {
  title: '',
  year: String(new Date().getFullYear() + 543),
  description: '',
  content: '',
  status: 'PUBLIC',
  coverImage: null,
  galleryImages: [],
  currentGallery: [],
};

const passthroughLoader = ({ src }: ImageLoaderProps) => src;

const parseGallery = (images: SacredItem['images']): SacredGalleryImage[] => {
  if (Array.isArray(images)) return images;
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const fileToPayload = (file: File): Promise<SacredImagePayload> =>
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
  url,
  onChange,
}: {
  file: File | null;
  url?: string;
  onChange: (file: File | null) => void;
}) {
  const preview = useFilePreview(file) || url;
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">รูปหน้าปก *</Typography>
      <Box
        sx={{
          height: 320,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'background.neutral',
        }}
      >
        {preview ? (
          <NextImage
            loader={passthroughLoader}
            src={preview}
            alt="Sacred cover preview"
            fill
            sizes="800px"
            style={{ objectFit: 'contain' }}
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
      <Typography variant="caption" color="text.secondary">
        แนะนำอัตราส่วน 3:4 · ไม่เกิน 8 MB
      </Typography>
    </Stack>
  );
}

export default function ManageSacredPage() {
  const [items, setItems] = useState<SacredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SacredItem | null>(null);
  const [form, setForm] = useState<SacredForm>(EMPTY_FORM);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/sacred');
      setItems(response.data.items);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, galleryImages: [], currentGallery: [] });
    setDialogOpen(true);
  };

  const openEdit = (item: SacredItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      year: item.year || '',
      description: item.description || '',
      content: item.content || '',
      status: item.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
      coverImage: null,
      galleryImages: [],
      currentGallery: parseGallery(item.images),
    });
    setDialogOpen(true);
  };

  const saveItem = async () => {
    try {
      setSaving(true);
      setError('');
      const [coverImage, galleryImages] = await Promise.all([
        form.coverImage ? fileToPayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(fileToPayload)),
      ]);
      const payload = {
        id: editing?.id,
        title: form.title.trim(),
        year: form.year.trim(),
        description: form.description.trim(),
        content: form.content,
        status: form.status,
        coverImage,
        galleryImages,
        keptGallerySources: form.currentGallery.map((image) => image.src),
      };
      if (editing) await axios.patch('/api/admin/sacred', payload);
      else await axios.post('/api/admin/sacred', payload);
      setDialogOpen(false);
      await loadItems();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const removeItem = async (item: SacredItem) => {
    if (!window.confirm(`ลบ “${item.title}” หรือไม่?`)) return;
    try {
      setDeletingId(item.id);
      setError('');
      await axios.delete('/api/admin/sacred', { params: { id: item.id } });
      setItems((current) => current.filter((value) => value.id !== item.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  const validForm = Boolean(form.title.trim() && (editing || form.coverImage));

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <div>
              <Typography variant="h4">จัดการวัตถุมงคล</Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อมูลที่แสดงในหน้า Sacred
              </Typography>
            </div>
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={openCreate}
            >
              เพิ่มวัตถุมงคล
            </Button>
          </Stack>
          {error && <Alert severity="error">{error}</Alert>}
          {loading && <Typography color="text.secondary">กำลังโหลด...</Typography>}
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card>
                  <Box sx={{ height: 280, position: 'relative', bgcolor: 'background.neutral' }}>
                    {item.imageUrl && (
                      <NextImage
                        loader={passthroughLoader}
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 900px) 50vw, 25vw"
                        style={{ objectFit: 'contain' }}
                      />
                    )}
                  </Box>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" spacing={1}>
                      <div>
                        <Typography variant="h6">{item.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          ปี {item.year || '-'}
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
                    <Button onClick={() => openEdit(item)}>แก้ไข</Button>
                    <LoadingButton
                      color="error"
                      loading={deletingId === item.id}
                      onClick={() => removeItem(item)}
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
              <Iconify icon="solar:gallery-wide-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มีข้อมูลวัตถุมงคล
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
        <DialogTitle>{editing ? 'แก้ไขวัตถุมงคล' : 'เพิ่มวัตถุมงคล'}</DialogTitle>
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
                label="ปี"
                value={form.year}
                onChange={(event) => setForm((value) => ({ ...value, year: event.target.value }))}
              />
              <FormControl fullWidth>
                <InputLabel>สถานะ</InputLabel>
                <Select
                  value={form.status}
                  label="สถานะ"
                  onChange={(event) =>
                    setForm((value) => ({ ...value, status: event.target.value as SacredStatus }))
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
            <CoverField
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
                        loader={passthroughLoader}
                        src={image.image}
                        alt="Sacred gallery"
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
                      sx={{ height: 110, borderRadius: 1, bgcolor: 'background.neutral', px: 1 }}
                    >
                      <Typography variant="caption" noWrap>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() =>
                          setForm((value) => ({
                            ...value,
                            galleryImages: value.galleryImages.filter(
                              (_, itemIndex) => itemIndex !== index
                            ),
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
          <Button color="inherit" disabled={saving} onClick={() => setDialogOpen(false)}>
            ยกเลิก
          </Button>
          <LoadingButton
            variant="contained"
            loading={saving}
            disabled={!validForm}
            onClick={saveItem}
          >
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
