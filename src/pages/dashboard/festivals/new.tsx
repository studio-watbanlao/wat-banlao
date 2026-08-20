import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Form, RHFEditor, RHFSelect, RHFTextField, RHFUpload } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import AdminFormSectionHeader from 'src/sections/admin/admin-form-section-header';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { festivalFormSchema, type FestivalFormValues } from 'src/schemas/festival';
import type { FestivalGalleryImage, FestivalImagePayload, FestivalItem } from 'src/types/festival';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

export const metadata = {
  title: 'เพิ่ม Festival',
};

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

type PreviewFile = File & { preview?: string };

type Props = {
  festival?: FestivalItem;
};

const parseGallery = (images: FestivalItem['images']): FestivalGalleryImage[] => {
  if (Array.isArray(images)) return images;
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

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

const withPreview = (file: File): PreviewFile =>
  Object.assign(file, { preview: URL.createObjectURL(file) });

const revokePreview = (file?: File | null) => {
  const preview = (file as PreviewFile | null)?.preview;
  if (preview) URL.revokeObjectURL(preview);
};

export default function FestivalFormPage({ festival }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentGallery, setCurrentGallery] = useState<FestivalGalleryImage[]>(() =>
    parseGallery(festival?.images)
  );
  const [removedGalleryPaths, setRemovedGalleryPaths] = useState<string[]>([]);
  const isEditing = Boolean(festival);

  const methods = useForm<FestivalFormValues>({
    resolver: zodResolver(festivalFormSchema),
    defaultValues: festival
      ? {
          title: festival.title,
          year: festival.year,
          no: festival.no || '',
          description: festival.description || '',
          content: festival.content || '',
          videoUrl: festival.videoUrl || '',
          openingUrl: festival.openingUrl || '',
          logoUrl: festival.logoUrl || '',
          status: festival.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
          coverImage: null,
          currentImageUrl: festival.imageUrl || '',
          galleryImages: [],
        }
      : EMPTY_FORM,
    mode: 'onChange',
  });

  const { handleSubmit, setValue, watch } = methods;

  const coverImage = watch('coverImage');
  const galleryImages = watch('galleryImages');

  const handleDropCover = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      revokePreview(coverImage);
      setValue('coverImage', withPreview(file), { shouldDirty: true, shouldValidate: true });
    },
    [coverImage, setValue]
  );

  const handleRemoveCover = useCallback(() => {
    revokePreview(coverImage);
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
  }, [coverImage, setValue]);

  const handleDropGallery = useCallback(
    (acceptedFiles: File[]) => {
      const availableSlots = Math.max(0, 8 - currentGallery.length - galleryImages.length);
      const nextFiles = acceptedFiles.slice(0, availableSlots).map(withPreview);
      setValue('galleryImages', [...galleryImages, ...nextFiles], {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [currentGallery.length, galleryImages, setValue]
  );

  const handleRemoveGallery = useCallback(
    (inputFile: File | string) => {
      if (typeof inputFile === 'string') {
        const removedImage = currentGallery.find((image) => image.image === inputFile);
        if (removedImage?.storagePath) {
          setRemovedGalleryPaths((current) => [...current, removedImage.storagePath!]);
        }
        setCurrentGallery((current) => current.filter((image) => image.image !== inputFile));
        return;
      }
      revokePreview(inputFile);
      setValue(
        'galleryImages',
        galleryImages.filter((file) => file !== inputFile),
        { shouldDirty: true, shouldValidate: true }
      );
    },
    [currentGallery, galleryImages, setValue]
  );

  const handleRemoveAllGallery = useCallback(() => {
    galleryImages.forEach(revokePreview);
    setRemovedGalleryPaths((current) => [
      ...current,
      ...currentGallery
        .map((image) => image.storagePath)
        .filter((path): path is string => Boolean(path)),
    ]);
    setCurrentGallery([]);
    setValue('galleryImages', [], { shouldDirty: true, shouldValidate: true });
  }, [currentGallery, galleryImages, setValue]);

  const saveFestival = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');

      const [coverPayload, galleryPayloads] = await Promise.all([
        form.coverImage ? fileToPayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(fileToPayload)),
      ]);

      const payload = {
        id: festival?.id,
        title: form.title.trim(),
        year: form.year.trim(),
        no: form.no.trim(),
        description: form.description.trim(),
        content: form.content,
        videoUrl: form.videoUrl.trim(),
        openingUrl: form.openingUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        status: form.status,
        coverImage: coverPayload,
        galleryImages: galleryPayloads,
        keptGallerySources: currentGallery.map((image) => image.src),
        removedGalleryPaths,
      };

      if (isEditing) await axios.patch('/api/admin/festivals', payload);
      else await axios.post('/api/admin/festivals', payload);

      router.push(paths.dashboard.festivals);
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
              aria-label="กลับไปหน้ารายการ Festival"
              disabled={saving}
              onClick={() => router.push(paths.dashboard.festivals)}
            >
              <Iconify icon="ri:arrow-left-line" />
            </IconButton>
            <div>
              <Typography variant="h4">
                {isEditing ? 'แก้ไข Festival' : 'เพิ่ม Festival'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing
                  ? 'ปรับปรุงข้อมูลเทศกาลงานบุญบนเว็บไซต์'
                  : 'เพิ่มเทศกาลงานบุญใหม่เข้าสู่เว็บไซต์'}
              </Typography>
            </div>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Form methods={methods} onSubmit={saveFestival}>
            <Stack spacing={3} sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
              <Card>
                <AdminFormSectionHeader
                  icon="solar:document-text-bold-duotone"
                  title="ข้อมูล Festival"
                  subheader="ชื่อ ปี ครั้งที่จัดงาน และสถานะการเผยแพร่"
                />
                <CardContent>
                  <Stack spacing={3}>
                    <RHFTextField name="title" required label="ชื่อ Festival" />

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <RHFTextField name="year" required label="ปี" />
                      <RHFTextField name="no" label="ครั้งที่" />
                      <RHFSelect name="status" label="สถานะ">
                        <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                        <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                      </RHFSelect>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <AdminFormSectionHeader
                  icon="solar:document-text-bold-duotone"
                  title="รายละเอียดเนื้อหา"
                  subheader="คำอธิบายและเนื้อหาเทศกาลฉบับเต็ม"
                />
                <CardContent>
                  <Stack spacing={2}>
                    <RHFTextField name="description" multiline minRows={2} label="คำอธิบาย" />
                    <RHFEditor name="content" label="เนื้อหา" />
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <AdminFormSectionHeader
                  icon="solar:gallery-wide-bold-duotone"
                  title="รูปภาพ"
                  subheader="รูปหน้าปกและ Gallery สำหรับเทศกาล"
                />
                <CardContent>
                  <Stack spacing={3}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2">รูปหน้าปก *</Typography>
                      <RHFUpload
                        name="coverImage"
                        file={coverImage || festival?.imageUrl || ''}
                        maxSize={8 * 1024 * 1024}
                        accept={{
                          'image/jpeg': [],
                          'image/png': [],
                          'image/webp': [],
                        }}
                        onDrop={handleDropCover}
                        onDelete={coverImage ? handleRemoveCover : undefined}
                        helperText="แนะนำอัตราส่วน 4:3 · รองรับ JPG, PNG, WebP · ไม่เกิน 8 MB"
                        sx={{
                          maxWidth: 720,
                          '& > div:first-of-type': {
                            p: '0 !important',
                            display: 'grid',
                            placeItems: 'center',
                            aspectRatio: '4 / 3',
                          },
                          '& .component-image img': { objectFit: 'cover !important' },
                        }}
                      />
                    </Stack>

                    <Stack spacing={1}>
                      <Typography variant="subtitle2">รูป Gallery (สูงสุด 8 รูป)</Typography>
                      <RHFUpload
                        multiple
                        thumbnail
                        name="galleryImages"
                        files={[...currentGallery.map((image) => image.image), ...galleryImages]}
                        maxFiles={8}
                        maxSize={8 * 1024 * 1024}
                        disabled={currentGallery.length + galleryImages.length >= 8}
                        accept={{
                          'image/jpeg': [],
                          'image/png': [],
                          'image/webp': [],
                        }}
                        onDrop={handleDropGallery}
                        onRemove={handleRemoveGallery}
                        onRemoveAll={handleRemoveAllGallery}
                        helperText="รองรับ JPG, PNG และ WebP รูปละไม่เกิน 8 MB"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <AdminFormSectionHeader
                  icon="ri:links-line"
                  title="ลิงก์ที่เกี่ยวข้อง"
                  subheader="วิดีโอ โลโก้ และสื่อภายนอกของเทศกาล"
                />
                <CardContent>
                  <Stack spacing={2}>
                    <RHFTextField name="videoUrl" label="YouTube URL" />
                    <RHFTextField name="openingUrl" label="วิดีโอเปิดงาน URL" />
                    <RHFTextField name="logoUrl" label="Logo URL" />
                  </Stack>
                </CardContent>
              </Card>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                  color="inherit"
                  disabled={saving}
                  onClick={() => router.push(paths.dashboard.festivals)}
                >
                  ยกเลิก
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={saving}
                  startIcon={<Iconify icon="ri:save-line" />}
                >
                  บันทึก Festival
                </LoadingButton>
              </Stack>
            </Stack>
          </Form>
        </Stack>
      </Container>
    </Layout>
  );
}
