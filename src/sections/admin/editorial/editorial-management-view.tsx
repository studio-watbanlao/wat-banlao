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
import NextImage, { type ImageLoaderProps } from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Iconify from 'src/components/iconify';
import { editorialFormSchema, type EditorialFormValues } from 'src/schemas/editorial';
import type { EditorialImagePayload, EditorialItem, EditorialResource } from 'src/types/editorial';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type Props = {
  resource: EditorialResource;
  title: string;
  description: string;
};

const EMPTY_FORM: EditorialFormValues = {
  title: '',
  description: '',
  content: '',
  author: '',
  createdDate: '',
  status: 'PUBLIC',
  coverImage: null,
  currentImageUrl: '',
};

const imageLoader = ({ src }: ImageLoaderProps) => src;

const fileToPayload = (file: File): Promise<EditorialImagePayload> =>
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

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

function CoverInput({
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
  const preview = usePreview(file) || currentUrl;

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
            alt="ตัวอย่างรูปหน้าปก"
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
      {error ? (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function EditorialManagementView({ resource, title, description }: Props) {
  const endpoint = `/api/admin/${resource === 'blog' ? 'blogs' : 'dharmas'}`;
  const listKey = resource === 'blog' ? 'blogs' : 'dharmas';
  const [items, setItems] = useState<EditorialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EditorialItem | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditorialFormValues>({
    resolver: zodResolver(editorialFormSchema),
    defaultValues: EMPTY_FORM,
    mode: 'onChange',
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(endpoint);
      setItems(response.data[listKey] || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [endpoint, listKey]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const openCreate = () => {
    setEditing(null);
    reset({ ...EMPTY_FORM, createdDate: toDateTimeLocal(new Date().toISOString()) });
    setOpen(true);
  };

  const openEdit = (item: EditorialItem) => {
    setEditing(item);
    reset({
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      author: item.author || '',
      createdDate: toDateTimeLocal(item.createdDate),
      status: item.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
      coverImage: null,
      currentImageUrl: item.imageUrl || '',
    });
    setOpen(true);
  };

  const save = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const coverImage = form.coverImage ? await fileToPayload(form.coverImage) : null;
      const payload = {
        id: editing?.id,
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content,
        author: form.author.trim(),
        createdDate: form.createdDate ? new Date(form.createdDate).toISOString() : undefined,
        status: form.status,
        coverImage,
      };
      if (editing) await axios.patch(endpoint, payload);
      else await axios.post(endpoint, payload);
      setOpen(false);
      await loadItems();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  const remove = async (item: EditorialItem) => {
    if (!window.confirm(`ลบ${title} “${item.title}” หรือไม่?`)) return;
    try {
      setDeletingId(item.id);
      setError('');
      await axios.delete(endpoint, { params: { id: item.id } });
      setItems((current) => current.filter((currentItem) => currentItem.id !== item.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  const coverImage = watch('coverImage');

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <div>
            <Typography variant="h4">จัดการ{title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          </div>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={openCreate}
          >
            เพิ่ม{title}
          </Button>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? <Typography color="text.secondary">กำลังโหลด...</Typography> : null}

        <Grid container spacing={3}>
          {items.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <Box sx={{ height: 230, position: 'relative', bgcolor: 'background.neutral' }}>
                  {item.imageUrl ? (
                    <NextImage
                      loader={imageLoader}
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : null}
                </Box>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" spacing={1}>
                    <div>
                      <Typography variant="h6">{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.author || 'ไม่ระบุผู้เขียน'}
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
                    onClick={() => remove(item)}
                  >
                    ลบ
                  </LoadingButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {!loading && !items.length ? (
          <Card sx={{ py: 8, textAlign: 'center' }}>
            <Iconify icon="solar:document-text-bold-duotone" width={64} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              ยังไม่มี{title}
            </Typography>
          </Card>
        ) : null}
      </Stack>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editing ? `แก้ไข${title}` : `เพิ่ม${title}`}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }} component="form" onSubmit={save}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label={`ชื่อ${title}`}
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="author"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="ผู้เขียน"
                    error={!!errors.author}
                    helperText={errors.author?.message}
                  />
                )}
              />
              <Controller
                name="createdDate"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="datetime-local"
                    label="วันที่เผยแพร่"
                    InputLabelProps={{ shrink: true }}
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
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  minRows={2}
                  label="คำอธิบายย่อ"
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <TextField {...field} multiline minRows={10} label="เนื้อหา (รองรับ HTML)" />
              )}
            />
            <Controller
              name="coverImage"
              control={control}
              render={({ field }) => (
                <CoverInput
                  file={coverImage}
                  currentUrl={editing?.imageUrl}
                  error={errors.coverImage?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={saving}>
            ยกเลิก
          </Button>
          <LoadingButton variant="contained" loading={saving} onClick={save}>
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
