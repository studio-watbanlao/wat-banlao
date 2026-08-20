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
import { popupBannerFormSchema, type PopupBannerFormValues } from 'src/schemas/popup-banner';
import AdminFormSectionHeader from 'src/sections/admin/admin-form-section-header';
import type { PopupBannerImagePayload, PopupBannerItem } from 'src/types/popup-banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type PreviewFile = File & { preview?: string };
type Props = { popupBanner?: PopupBannerItem };

const fileToPayload = (file: File): Promise<PopupBannerImagePayload> =>
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

const toEndOfSelectedDay = (value: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
};

export default function PopupBannerFormPage({ popupBanner }: Props) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(popupBanner);

  const methods = useForm<PopupBannerFormValues>({
    resolver: zodResolver(popupBannerFormSchema),
    defaultValues: {
      title: popupBanner?.title || '',
      linkUrl: popupBanner?.linkUrl || '',
      displayFrequency: popupBanner?.displayFrequency || 'ONCE_PER_SESSION',
      startsAt: popupBanner?.startsAt || '',
      endsAt: popupBanner?.endsAt || '',
      sortOrder: popupBanner?.sortOrder || 0,
      status: popupBanner?.status || 'PUBLIC',
      image: null,
      currentImageUrl: popupBanner?.imageUrl || '',
    },
    mode: 'onChange',
  });
  const { handleSubmit, setValue, watch } = methods;
  const image = watch('image');

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

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;
      revokePreview(image);
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      setValue('image', Object.assign(file, { preview }), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [image, revokePreview, setValue]
  );

  const save = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        id: popupBanner?.id,
        title: form.title.trim(),
        linkUrl: form.linkUrl.trim(),
        displayFrequency: form.displayFrequency,
        startsAt: form.startsAt,
        endsAt: toEndOfSelectedDay(form.endsAt),
        sortOrder: form.sortOrder,
        status: form.status,
        image: form.image ? await fileToPayload(form.image) : null,
      };
      if (isEditing) await axios.patch('/api/admin/popup-banners', payload);
      else await axios.post('/api/admin/popup-banners', payload);
      router.push(paths.dashboard.popupBanners);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <IconButton
            aria-label="กลับไปหน้าจัดการแบนเนอร์ป๊อปอัป"
            onClick={() => router.push(paths.dashboard.popupBanners)}
          >
            <Iconify icon="ri:arrow-left-line" />
          </IconButton>
          <div>
            <Typography variant="h4">
              {isEditing ? 'แก้ไขแบนเนอร์ป๊อปอัป' : 'เพิ่มแบนเนอร์ป๊อปอัป'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              รูปประชาสัมพันธ์ที่แสดงเหนือหน้าเว็บไซต์
            </Typography>
          </div>
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Form methods={methods} onSubmit={save}>
          <Stack spacing={3} sx={{ width: 1, mx: 'auto', mt: 3 }}>
            <Card>
              <AdminFormSectionHeader
                icon="solar:document-text-bold-duotone"
                title="ข้อมูล Popup Banner"
                subheader="ช่วงเวลา ความถี่ ลำดับ และสถานะการแสดงผล"
              />
              <CardContent>
                <Stack spacing={3}>
                  <Field.Text name="title" required label="ชื่อ Popup Banner" />
                  <Field.Text
                    name="linkUrl"
                    label="ลิงก์เมื่อคลิกรูป (ไม่บังคับ)"
                    placeholder="https://... หรือ /activity"
                  />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.DatePicker
                      name="startsAt"
                      label="วันเริ่มแสดง"
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                    <Field.DatePicker
                      name="endsAt"
                      label="วันสิ้นสุดการแสดง"
                      format="dd/MM/yyyy"
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Select name="displayFrequency" label="ความถี่การแสดง">
                      <MenuItem value="EVERY_VISIT">แสดงทุกครั้งที่เปิดเว็บ</MenuItem>
                      <MenuItem value="ONCE_PER_SESSION">หนึ่งครั้งต่อการเข้าใช้งาน</MenuItem>
                      <MenuItem value="ONCE_PER_DAY">หนึ่งครั้งต่อวัน</MenuItem>
                    </Field.Select>
                    <Field.Text name="sortOrder" type="number" label="ลำดับ" />
                    <Field.Select name="status" label="สถานะ">
                      <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                    </Field.Select>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <AdminFormSectionHeader
                icon="solar:gallery-wide-bold-duotone"
                title="รูป Popup Banner"
                subheader="รูปสี่เหลี่ยมที่แสดงกลางหน้าจอเว็บไซต์"
              />
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="subtitle2">รูป Popup Banner *</Typography>
                  <Field.Upload
                    name="image"
                    file={image || popupBanner?.imageUrl || ''}
                    maxSize={8 * 1024 * 1024}
                    accept={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [] }}
                    onDrop={handleDrop}
                    onDelete={
                      image
                        ? () => {
                            revokePreview(image);
                            setValue('image', null, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                          }
                        : undefined
                    }
                    helperText="แนะนำ 1200 × 1200 px · JPG, PNG หรือ WebP · ไม่เกิน 8 MB"
                    sx={{
                      maxWidth: 560,
                      '& > div:first-of-type': {
                        p: '0 !important',
                        display: 'grid',
                        placeItems: 'center',
                        aspectRatio: '1 / 1',
                      },
                      '& .component-image img': { objectFit: 'contain !important' },
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
              <Button
                color="inherit"
                disabled={saving}
                onClick={() => router.push(paths.dashboard.popupBanners)}
              >
                ยกเลิก
              </Button>
              <LoadingButton type="submit" variant="contained" loading={saving}>
                บันทึกข้อมูล
              </LoadingButton>
            </Stack>
          </Stack>
        </Form>
      </Container>
    </Layout>
  );
}
