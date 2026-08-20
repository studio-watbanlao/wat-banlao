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

import { Field, Form } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { templePageFormSchema, type TemplePageFormValues } from 'src/schemas/temple-page';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type PreviewFile = File & { preview?: string };

const fileToPayload = (file: File) =>
  new Promise<{ name: string; type: string; base64: string }>((resolve, reject) => {
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

export default function TemplePageForm({ page }: { page?: TemplePage }) {
  const router = useRouter();
  const previews = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const methods = useForm<TemplePageFormValues>({
    resolver: zodResolver(templePageFormSchema),
    defaultValues: {
      title: page?.title || '',
      pageKey: page?.pageKey || '',
      slug: page?.slug || '',
      pageType: page?.pageType || 'CUSTOM',
      eyebrow: page?.eyebrow || '',
      excerpt: page?.excerpt || '',
      content: page?.content || '',
      status: page?.status || 'DRAFT',
      showInMenu: page?.showInMenu || false,
      sortOrder: page?.sortOrder || 0,
      seoTitle: page?.seoTitle || '',
      seoDescription: page?.seoDescription || '',
      heroImage: null,
      currentHeroImageUrl: page?.heroImageUrl || '',
    },
    mode: 'onChange',
  });
  const { handleSubmit, setValue, watch } = methods;
  const heroImage = watch('heroImage');

  const revokePreview = useCallback((file?: File | null) => {
    const preview = (file as PreviewFile | null)?.preview;
    if (!preview) return;
    URL.revokeObjectURL(preview);
    previews.current.delete(preview);
  }, []);

  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const handleDrop = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      revokePreview(heroImage);
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      setValue('heroImage', Object.assign(file, { preview }), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [heroImage, revokePreview, setValue]
  );

  const save = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        id: page?.id,
        heroImage: form.heroImage ? await fileToPayload(form.heroImage) : null,
      };
      if (page) await axios.patch('/api/admin/pages', payload);
      else await axios.post('/api/admin/pages', payload);
      router.push(paths.dashboard.pages);
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
            <IconButton aria-label="กลับ" onClick={() => router.push(paths.dashboard.pages)}>
              <Iconify icon="ri:arrow-left-line" />
            </IconButton>
            <div>
              <Typography variant="h4">{page ? 'แก้ไขหน้าคงที่' : 'สร้างหน้าใหม่'}</Typography>
              <Typography variant="body2" color="text.secondary">
                เนื้อหาแยกตามวัด
              </Typography>
            </div>
          </Stack>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Form methods={methods} onSubmit={save}>
            <Stack spacing={3}>
              <Card>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="h6">ข้อมูลหน้าและ URL</Typography>
                    <Field.Text name="title" required label="ชื่อหน้า" />
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Field.Text
                        name="pageKey"
                        required
                        disabled={page?.pageType === 'SYSTEM'}
                        label="Page key"
                      />
                      <Field.Text
                        name="slug"
                        required
                        label="URL slug"
                        placeholder="abbot หรือ important-person/abbot"
                      />
                      <Field.Select
                        name="pageType"
                        disabled={page?.pageType === 'SYSTEM'}
                        label="ประเภทหน้า"
                      >
                        <MenuItem value="SYSTEM">หน้ามาตรฐาน</MenuItem>
                        <MenuItem value="CUSTOM">หน้าเฉพาะวัด</MenuItem>
                      </Field.Select>
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <Field.Select name="status" label="สถานะ">
                        <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                        <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                        <MenuItem value="ARCHIVED">เก็บถาวร</MenuItem>
                      </Field.Select>
                      <Field.NumberInput name="sortOrder" label="ลำดับเมนู" />
                    </Stack>
                    <Field.Switch name="showInMenu" label="แสดงในเมนูเว็บไซต์" />
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="h6">เนื้อหา</Typography>
                    <Field.Text name="eyebrow" label="ข้อความเหนือหัวข้อ" />
                    <Field.Text name="excerpt" multiline minRows={3} label="คำอธิบายย่อ" />
                    <Field.Editor name="content" label="เนื้อหาหลัก" />
                    <Field.Upload
                      name="heroImage"
                      file={heroImage || page?.heroImageUrl || ''}
                      maxSize={8 * 1024 * 1024}
                      accept={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [] }}
                      onDrop={handleDrop}
                      onDelete={
                        heroImage
                          ? () => {
                              revokePreview(heroImage);
                              setValue('heroImage', null);
                            }
                          : undefined
                      }
                      helperText="ภาพ Hero JPG, PNG หรือ WebP ไม่เกิน 8 MB"
                    />
                  </Stack>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Stack spacing={2.5}>
                    <Typography variant="h6">SEO</Typography>
                    <Field.Text name="seoTitle" label="SEO title" />
                    <Field.Text
                      name="seoDescription"
                      multiline
                      minRows={2}
                      label="SEO description"
                    />
                  </Stack>
                </CardContent>
              </Card>
              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button color="inherit" onClick={() => router.push(paths.dashboard.pages)}>
                  ยกเลิก
                </Button>
                <LoadingButton type="submit" variant="contained" loading={saving}>
                  บันทึกหน้า
                </LoadingButton>
              </Stack>
            </Stack>
          </Form>
        </Stack>
      </Container>
    </Layout>
  );
}
