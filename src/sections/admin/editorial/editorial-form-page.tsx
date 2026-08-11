import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Form, Field } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { editorialFormSchema, type EditorialFormValues } from 'src/schemas/editorial';
import type { EditorialImagePayload, EditorialItem, EditorialResource } from 'src/types/editorial';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type PreviewFile = File & { preview?: string };

type Props = {
  resource: EditorialResource;
  title: string;
  item?: EditorialItem;
};

const toDateTimeLocal = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

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

export default function EditorialFormPage({ resource, title, item }: Props) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(item);
  const endpoint = `/api/admin/${resource === 'blog' ? 'blogs' : 'dharmas'}`;
  const listPath = resource === 'blog' ? paths.dashboard.blogs : paths.dashboard.dharmas;

  const methods = useForm<EditorialFormValues>({
    resolver: zodResolver(editorialFormSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      content: item?.content || '',
      author: item?.author || '',
      createdDate: toDateTimeLocal(item?.createdDate || new Date().toISOString()),
      status: item?.status === 'DRAFT' ? 'DRAFT' : 'PUBLIC',
      coverImage: null,
      currentImageUrl: item?.imageUrl || '',
    },
    mode: 'onChange',
  });

  const { handleSubmit, setValue, watch } = methods;
  const coverImage = watch('coverImage');

  const revokePreview = useCallback((file?: File | null) => {
    const preview = (file as PreviewFile | null)?.preview;
    if (!preview) return;
    URL.revokeObjectURL(preview);
    previewUrls.current.delete(preview);
  }, []);

  useEffect(
    () => () => {
      previewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));
      previewUrls.current.clear();
    },
    []
  );

  const handleDropCover = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      revokePreview(coverImage);
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      setValue('coverImage', Object.assign(file, { preview }), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [coverImage, revokePreview, setValue]
  );

  const handleRemoveCover = useCallback(() => {
    revokePreview(coverImage);
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
  }, [coverImage, revokePreview, setValue]);

  const save = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const coverPayload = form.coverImage ? await fileToPayload(form.coverImage) : null;
      const payload = {
        id: item?.id,
        title: form.title.trim(),
        description: form.description.trim(),
        content: form.content,
        author: form.author.trim(),
        createdDate: form.createdDate ? new Date(form.createdDate).toISOString() : undefined,
        status: form.status,
        coverImage: coverPayload,
      };

      if (isEditing) await axios.patch(endpoint, payload);
      else await axios.post(endpoint, payload);
      router.push(listPath);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              aria-label={`กลับไปหน้าจัดการ${title}`}
              disabled={saving}
              onClick={() => router.push(listPath)}
            >
              <Iconify icon="ri:arrow-left-line" />
            </IconButton>
            <div>
              <Typography variant="h4">
                {isEditing ? `แก้ไข${title}` : `เพิ่ม${title}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing ? `ปรับปรุงข้อมูล${title}` : `สร้าง${title}ใหม่สำหรับเว็บไซต์`}
              </Typography>
            </div>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card>
            <CardContent>
              <Form methods={methods} onSubmit={save}>
                <Stack spacing={3}>
                  <Field.Text name="title" required label={`ชื่อ${title}`} />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text name="author" label="ผู้เขียน" />
                    <Field.Text
                      name="createdDate"
                      type="datetime-local"
                      label="วันที่เผยแพร่"
                      InputLabelProps={{ shrink: true }}
                    />
                    <Field.Select name="status" label="สถานะ">
                      <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                    </Field.Select>
                  </Stack>

                  <Field.Text name="description" multiline minRows={3} label="คำอธิบายย่อ" />
                  <Field.Editor name="content" label="เนื้อหา" />

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">รูปหน้าปก *</Typography>
                    <Field.Upload
                      name="coverImage"
                      file={coverImage || item?.imageUrl || ''}
                      maxSize={8 * 1024 * 1024}
                      accept={{
                        'image/jpeg': [],
                        'image/png': [],
                        'image/webp': [],
                      }}
                      onDrop={handleDropCover}
                      onDelete={coverImage ? handleRemoveCover : undefined}
                      helperText="รองรับ JPG, PNG และ WebP · ไม่เกิน 8 MB"
                    />
                  </Stack>

                  <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button color="inherit" disabled={saving} onClick={() => router.push(listPath)}>
                      ยกเลิก
                    </Button>
                    <LoadingButton
                      type="submit"
                      variant="contained"
                      loading={saving}
                      startIcon={<Iconify icon="ri:save-line" />}
                    >
                      บันทึกข้อมูล
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Form>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
