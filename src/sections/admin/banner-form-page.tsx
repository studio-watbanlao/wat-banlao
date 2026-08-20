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
import AdminFormSectionHeader from 'src/sections/admin/admin-form-section-header';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { bannerFormSchema, type BannerFormValues } from 'src/schemas/banner';
import type { BannerImagePayload, BannerItem } from 'src/types/banner';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type PreviewFile = File & { preview?: string };

type Props = {
  banner?: BannerItem;
  initialSortOrder?: number;
};

const fileToPayload = (file: File): Promise<BannerImagePayload> =>
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

export default function BannerFormPage({ banner, initialSortOrder = 0 }: Props) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(banner);

  const currentDesktopUrl = banner?.desktopImageUrl || banner?.imageUrl || '';
  const hasCustomMobileImage = Boolean(
    banner?.mobileStoragePath ||
    (banner?.mobileImageUrl && banner.mobileImageUrl !== currentDesktopUrl)
  );
  const initialMobileUrl = hasCustomMobileImage ? banner?.mobileImageUrl || '' : '';
  const [currentMobileUrl, setCurrentMobileUrl] = useState(initialMobileUrl);

  const methods = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      title: banner?.title || '',
      linkUrl: banner?.linkUrl || '',
      sortOrder: banner?.sortOrder ?? initialSortOrder,
      status: banner?.status || 'PUBLIC',
      desktopImage: null,
      mobileImage: null,
      currentDesktopUrl,
      currentMobileUrl,
    },
    mode: 'onChange',
  });

  const { handleSubmit, setValue, watch } = methods;
  const desktopImage = watch('desktopImage');
  const mobileImage = watch('mobileImage');

  const addPreview = useCallback((file: File): PreviewFile => {
    const preview = URL.createObjectURL(file);
    previewUrls.current.add(preview);
    return Object.assign(file, { preview });
  }, []);

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

  const handleDropImage = useCallback(
    (field: 'desktopImage' | 'mobileImage', currentFile: File | null) =>
      (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        revokePreview(currentFile);
        setValue(field, addPreview(file), { shouldDirty: true, shouldValidate: true });
      },
    [addPreview, revokePreview, setValue]
  );

  const handleRemoveImage = useCallback(
    (field: 'desktopImage' | 'mobileImage', currentFile: File | null) => () => {
      revokePreview(currentFile);
      setValue(field, null, { shouldDirty: true, shouldValidate: true });
    },
    [revokePreview, setValue]
  );

  const saveBanner = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');

      const [desktopPayload, mobilePayload] = await Promise.all([
        form.desktopImage ? fileToPayload(form.desktopImage) : null,
        form.mobileImage ? fileToPayload(form.mobileImage) : null,
      ]);
      const payload = {
        id: banner?.id,
        title: form.title.trim(),
        linkUrl: form.linkUrl.trim(),
        sortOrder: form.sortOrder,
        status: form.status,
        desktopImage: desktopPayload,
        mobileImage: mobilePayload,
        removeMobileImage: Boolean(banner && !mobilePayload && !currentMobileUrl),
      };

      if (isEditing) await axios.patch('/api/admin/banners', payload);
      else await axios.post('/api/admin/banners', payload);

      router.push(paths.dashboard.banners);
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
              aria-label="กลับไปหน้าจัดการ Banner"
              disabled={saving}
              onClick={() => router.push(paths.dashboard.banners)}
            >
              <Iconify icon="ri:arrow-left-line" />
            </IconButton>
            <div>
              <Typography variant="h4">{isEditing ? 'แก้ไข Banner' : 'เพิ่ม Banner'}</Typography>
              <Typography variant="body2" color="text.secondary">
                รูป Desktop ใช้เป็นรูปหลัก ส่วนรูป Mobile เพิ่มเฉพาะเมื่อต้องการภาพแนวตั้ง
              </Typography>
            </div>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Form methods={methods} onSubmit={saveBanner}>
            <Stack spacing={3} sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
              <Card>
                <AdminFormSectionHeader
                  icon="solar:document-text-bold-duotone"
                  title="ข้อมูล Banner"
                  subheader="ชื่อ ลิงก์ปลายทาง ลำดับ และสถานะการเผยแพร่"
                />
                <CardContent>
                  <Stack spacing={3}>
                    <Field.Text name="title" required label="ชื่อ Banner" />
                    <Field.Text
                      name="linkUrl"
                      label="ลิงก์เมื่อคลิก (ไม่บังคับ)"
                      placeholder="https://... หรือ /activity"
                    />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                  title="รูป Banner"
                  subheader="กำหนดรูปสำหรับหน้าจอ Desktop และ Mobile แยกกัน"
                />
                <CardContent>
                  <Stack spacing={3}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2">รูป Desktop *</Typography>
                        <Field.Upload
                          name="desktopImage"
                          file={desktopImage || currentDesktopUrl}
                          maxSize={8 * 1024 * 1024}
                          accept={{
                            'image/jpeg': [],
                            'image/png': [],
                            'image/webp': [],
                          }}
                          onDrop={handleDropImage('desktopImage', desktopImage)}
                          onDelete={
                            desktopImage
                              ? handleRemoveImage('desktopImage', desktopImage)
                              : undefined
                          }
                          helperText="แนะนำ 1920 × 720 px · รองรับ JPG, PNG, WebP · ไม่เกิน 8 MB"
                          sx={{
                            '& > div:first-of-type': {
                              p: '0 !important',
                              display: 'grid',
                              placeItems: 'center',
                              aspectRatio: '8 / 3',
                            },
                            '& .upload-placeholder-illustration': { maxWidth: 120 },
                            '& .component-image img': { objectFit: 'cover !important' },
                          }}
                        />
                      </Stack>

                      <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="subtitle2">รูป Mobile (ไม่บังคับ)</Typography>
                        <Field.Upload
                          name="mobileImage"
                          file={mobileImage || currentMobileUrl}
                          maxSize={8 * 1024 * 1024}
                          accept={{
                            'image/jpeg': [],
                            'image/png': [],
                            'image/webp': [],
                          }}
                          onDrop={handleDropImage('mobileImage', mobileImage)}
                          onDelete={
                            mobileImage
                              ? handleRemoveImage('mobileImage', mobileImage)
                              : currentMobileUrl
                                ? () => setCurrentMobileUrl('')
                                : undefined
                          }
                          helperText="หากไม่เลือก ระบบจะใช้รูป Desktop · แนะนำ 750 × 900 px · ไม่เกิน 8 MB"
                          sx={{
                            maxWidth: 420,
                            '& > div:first-of-type': {
                              p: '0 !important',
                              display: 'grid',
                              placeItems: 'center',
                              aspectRatio: '5 / 6',
                            },
                            '& .upload-placeholder-illustration': { maxWidth: 140 },
                            '& .component-image img': { objectFit: 'cover !important' },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                  color="inherit"
                  disabled={saving}
                  onClick={() => router.push(paths.dashboard.banners)}
                >
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
        </Stack>
      </Container>
    </Layout>
  );
}
