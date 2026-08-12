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
import { activityFormSchema, type ActivityFormValues } from 'src/schemas/activity';
import type { ActivityGalleryImage, ActivityImagePayload, ActivityItem } from 'src/types/activity';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';
import { useCurrentTempleAccess } from 'src/hooks/use-current-temple-access';

export const metadata = {
  title: 'เพิ่มกิจกรรม',
};

const EMPTY_FORM: ActivityFormValues = {
  title: '',
  contentType: 'activity',
  type: 'temple',
  description: '',
  content: '',
  status: 'PUBLIC',
  coverImage: null,
  currentImageUrl: '',
  galleryImages: [],
};

type PreviewFile = File & { preview?: string };

type Props = {
  activity?: ActivityItem;
};

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

const fileToPayload = (file: File): Promise<ActivityImagePayload> =>
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

export default function ActivityFormPage({ activity }: Props) {
  const router = useRouter();
  const access = useCurrentTempleAccess();
  const isContributor = access?.role === 'temple_contributor';
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [currentGallery, setCurrentGallery] = useState<ActivityGalleryImage[]>(() =>
    parseGallery(activity?.images)
  );
  const isEditing = Boolean(activity);

  const methods = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: activity
      ? {
          title: activity.title,
          contentType: activity.contentType || 'activity',
          type: activity.type || 'temple',
          description: activity.description || '',
          content: activity.content || '',
          status: activity.status === 'PUBLIC' ? 'PUBLIC' : 'DRAFT',
          coverImage: null,
          currentImageUrl: activity.imageUrl || '',
          galleryImages: [],
        }
      : EMPTY_FORM,
    mode: 'onChange',
  });

  const { handleSubmit, setValue, watch } = methods;
  const coverImage = watch('coverImage');
  const galleryImages = watch('galleryImages');

  useEffect(() => {
    if (isContributor) setValue('status', 'DRAFT', { shouldValidate: true });
  }, [isContributor, setValue]);

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

  const saveActivity = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');

      const [coverPayload, galleryPayloads] = await Promise.all([
        form.coverImage ? fileToPayload(form.coverImage) : null,
        Promise.all(form.galleryImages.map(fileToPayload)),
      ]);

      const payload = {
        id: activity?.id,
        title: form.title.trim(),
        contentType: form.contentType,
        type: form.type,
        description: form.description.trim(),
        content: form.content,
        status: isContributor ? 'DRAFT' : form.status,
        coverImage: coverPayload,
        galleryImages: galleryPayloads,
        keptGallerySources: currentGallery.map((image) => image.src),
      };

      if (isEditing) await axios.patch('/api/admin/activities', payload);
      else await axios.post('/api/admin/activities', payload);

      router.push(paths.dashboard.activity);
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
              aria-label="กลับไปหน้าจัดการกิจกรรม"
              disabled={saving}
              onClick={() => router.push(paths.dashboard.activity)}
            >
              <Iconify icon="ri:arrow-left-line" />
            </IconButton>
            <div>
              <Typography variant="h4">
                {isEditing ? 'แก้ไขกิจกรรมหรือข่าวสาร' : 'เพิ่มกิจกรรมหรือข่าวสาร'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isEditing
                  ? 'ปรับปรุงข้อมูลกิจกรรมหรือข่าวสารสำหรับวัด ชุมชน หรือโรงเรียน'
                  : 'สร้างกิจกรรมหรือข่าวสารใหม่สำหรับวัด ชุมชน หรือโรงเรียน'}
              </Typography>
            </div>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Card>
            <CardContent>
              <Form methods={methods} onSubmit={saveActivity}>
                <Stack spacing={3}>
                  <Typography variant="h6">ข้อมูลกิจกรรมและข่าวสาร</Typography>

                  <Field.Text name="title" required label="ชื่อเรื่อง" />

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Field.Select name="contentType" required label="ประเภทเนื้อหา">
                      <MenuItem value="activity">กิจกรรม</MenuItem>
                      <MenuItem value="news">ข่าวสาร</MenuItem>
                    </Field.Select>
                    <Field.Select name="type" label="ส่วนงาน">
                      <MenuItem value="temple">วัด</MenuItem>
                      <MenuItem value="community">ชุมชน</MenuItem>
                      <MenuItem value="school">โรงเรียน</MenuItem>
                    </Field.Select>
                    <Field.Select name="status" label="สถานะ">
                      {!isContributor ? <MenuItem value="PUBLIC">เผยแพร่</MenuItem> : null}
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                    </Field.Select>
                  </Stack>

                  <Field.Text name="description" multiline minRows={3} label="คำอธิบาย" />
                  {isContributor ? (
                    <Alert severity="info">
                      Contributor บันทึกได้เฉพาะแบบร่าง ผู้ดูแลวัดจะเป็นผู้ตรวจและเผยแพร่
                    </Alert>
                  ) : null}
                  <Field.Editor name="content" label="เนื้อหา" />

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">รูปหน้าปก *</Typography>
                    <Field.Upload
                      name="coverImage"
                      file={coverImage || activity?.imageUrl || ''}
                      maxSize={8 * 1024 * 1024}
                      accept={{
                        'image/jpeg': [],
                        'image/png': [],
                        'image/webp': [],
                      }}
                      onDrop={handleDropCover}
                      onDelete={coverImage ? handleRemoveCover : undefined}
                      helperText="แนะนำอัตราส่วน 4:3 · รองรับ JPG, PNG, WebP · ไม่เกิน 8 MB"
                    />
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="subtitle2">รูป Gallery (สูงสุด 8 รูป)</Typography>
                    <Field.Upload
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

                  <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                    <Button
                      color="inherit"
                      disabled={saving}
                      onClick={() => router.push(paths.dashboard.activity)}
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
