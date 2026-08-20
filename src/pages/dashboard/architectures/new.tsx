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
import { architectureFormSchema, type ArchitectureFormValues } from 'src/schemas/architecture';
import type {
  ArchitectureGalleryImage,
  ArchitectureImagePayload,
  ArchitectureItem,
} from 'src/types/architecture';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

export const metadata = {
  title: 'เพิ่มข้อมูลสถาปัตย์',
};

const EMPTY_FORM: ArchitectureFormValues = {
  title: '',
  year: '',
  description: '',
  content: '',
  videoUrl: '',
  logoUrl: '',
  openingUrl: '',
  status: 'PUBLIC',
  coverImage: null,
  currentImageUrl: '',
  galleryImages: [],
};

type PreviewFile = File & { preview?: string };

type Props = {
  architecture?: ArchitectureItem;
};

const parseGallery = (images: ArchitectureItem['images']): ArchitectureGalleryImage[] => {
  if (Array.isArray(images)) return images;
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const fileToPayload = (file: File): Promise<ArchitectureImagePayload> =>
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

export default function ArchitectureFormPage({ architecture }: Props) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentGallery, setCurrentGallery] = useState<ArchitectureGalleryImage[]>(() =>
    parseGallery(architecture?.images)
  );
  const isEditing = Boolean(architecture);

  const methods = useForm<ArchitectureFormValues>({
    resolver: zodResolver(architectureFormSchema),
    defaultValues: architecture
      ? {
          title: architecture.title,
          year: architecture.year || '',
          description: architecture.description || '',
          content: architecture.content || '',
          videoUrl: architecture.videoUrl || '',
          logoUrl: architecture.logoUrl || '',
          openingUrl: architecture.openingUrl || '',
          status: architecture.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
          coverImage: null,
          currentImageUrl: architecture.imageUrl || '',
          galleryImages: [],
        }
      : EMPTY_FORM,
    mode: 'onChange',
  });

  const { handleSubmit, setValue, watch } = methods;
  const coverImage = watch('coverImage');
  const galleryImages = watch('galleryImages');

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

  const handleDropCover = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      revokePreview(coverImage);
      setValue('coverImage', addPreview(file), { shouldDirty: true, shouldValidate: true });
    },
    [addPreview, coverImage, revokePreview, setValue]
  );

  const handleRemoveCover = useCallback(() => {
    revokePreview(coverImage);
    setValue('coverImage', null, { shouldDirty: true, shouldValidate: true });
  }, [coverImage, revokePreview, setValue]);

  const handleDropGallery = useCallback(
    (acceptedFiles: File[]) => {
      const availableSlots = Math.max(0, 8 - currentGallery.length - galleryImages.length);
      const nextFiles = acceptedFiles.slice(0, availableSlots).map(addPreview);
      setValue('galleryImages', [...galleryImages, ...nextFiles], {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [addPreview, currentGallery.length, galleryImages, setValue]
  );

  const handleRemoveGallery = useCallback(
    (inputFile: File | string) => {
      if (typeof inputFile === 'string') {
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
    [galleryImages, revokePreview, setValue]
  );

  const handleRemoveAllGallery = useCallback(() => {
    galleryImages.forEach(revokePreview);
    setCurrentGallery([]);
    setValue('galleryImages', [], { shouldDirty: true, shouldValidate: true });
  }, [galleryImages, revokePreview, setValue]);

  const saveArchitecture = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');

      const [coverPayload, galleryPayloads] = await Promise.all([
        form.coverImage ? fileToPayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(fileToPayload)),
      ]);

      const payload = {
        id: architecture?.id,
        title: form.title.trim(),
        year: form.year.trim(),
        description: form.description.trim(),
        content: form.content,
        videoUrl: form.videoUrl.trim(),
        logoUrl: form.logoUrl.trim(),
        openingUrl: form.openingUrl.trim(),
        status: form.status,
        coverImage: coverPayload,
        galleryImages: galleryPayloads,
        keptGallerySources: currentGallery.map((image) => image.src),
      };

      if (isEditing) await axios.patch('/api/admin/architectures', payload);
      else await axios.post('/api/admin/architectures', payload);

      router.push(paths.dashboard.architectures);
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
              aria-label="กลับไปหน้าจัดการข้อมูลสถาปัตย์"
              disabled={saving}
              onClick={() => router.push(paths.dashboard.architectures)}
            >
              <Iconify icon="ri:arrow-left-line" />
            </IconButton>
            <div>
              <Typography variant="h4">
                {isEditing ? 'แก้ไขข้อมูลสถาปัตย์' : 'เพิ่มข้อมูลสถาปัตย์'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing
                  ? 'ปรับปรุงข้อมูลสถาปัตยกรรมและสิ่งสำคัญภายในวัด'
                  : 'เพิ่มข้อมูลสถาปัตยกรรมและสิ่งสำคัญภายในวัด'}
              </Typography>
            </div>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card sx={{ width: 1, maxWidth: 1200, mx: 'auto' }}>
            <AdminFormSectionHeader
              icon="solar:document-text-bold-duotone"
              title="ข้อมูลสถาปัตย์"
              subheader="ชื่อ ปีที่สร้าง และสถานะการเผยแพร่"
            />
            <CardContent>
              <Form methods={methods} onSubmit={saveArchitecture}>
                <Stack spacing={3}>
                  <Field.Text name="title" required label="ชื่อ" />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Field.Text name="year" label="ปีที่สร้าง" />
                    <Field.Select name="status" label="สถานะ">
                      <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                    </Field.Select>
                  </Stack>

                  <Card variant="outlined">
                    <AdminFormSectionHeader
                      icon="solar:document-text-bold-duotone"
                      title="รายละเอียดเนื้อหา"
                      subheader="คำอธิบายและเนื้อหาเกี่ยวกับสถาปัตยกรรม"
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <Field.Text name="description" multiline minRows={3} label="คำอธิบาย" />
                        <Field.Editor name="content" label="เนื้อหา" />
                      </Stack>
                    </CardContent>
                  </Card>

                  <Card variant="outlined">
                    <AdminFormSectionHeader
                      icon="solar:gallery-wide-bold-duotone"
                      title="รูปภาพ"
                      subheader="รูปหน้าปกและ Gallery สำหรับแสดงรายละเอียด"
                    />
                    <CardContent>
                      <Stack spacing={3}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2">รูปหน้าปก *</Typography>
                          <Field.Upload
                            name="coverImage"
                            file={coverImage || architecture?.imageUrl || ''}
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
                          <Field.Upload
                            multiple
                            thumbnail
                            name="galleryImages"
                            files={[
                              ...currentGallery.map((image) => image.image),
                              ...galleryImages,
                            ]}
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

                  <Card variant="outlined">
                    <AdminFormSectionHeader
                      icon="ri:links-line"
                      title="ลิงก์ที่เกี่ยวข้อง"
                      subheader="วิดีโอ โลโก้ และสื่อภายนอกที่เกี่ยวข้อง"
                    />
                    <CardContent>
                      <Stack spacing={2}>
                        <Field.Text name="videoUrl" label="YouTube URL" />
                        <Field.Text name="logoUrl" label="Logo URL" />
                        <Field.Text name="openingUrl" label="วิดีโอเปิดงาน URL" />
                      </Stack>
                    </CardContent>
                  </Card>

                  <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button
                      color="inherit"
                      disabled={saving}
                      onClick={() => router.push(paths.dashboard.architectures)}
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
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Layout>
  );
}
