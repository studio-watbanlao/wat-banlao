import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Field, Form } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { THAI_PROVINCES } from 'src/constants/thai-provinces';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import {
  templeDirectoryFormSchema,
  type TempleDirectoryFormValues,
} from 'src/schemas/temple-directory';
import {
  TEMPLE_DIRECTORY_ENTRY_TYPES,
  type TempleDirectoryEntry,
  type TempleDirectoryImagePayload,
} from 'src/types/temple-directory';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type Props = { entry?: TempleDirectoryEntry };
type PreviewFile = File & { preview?: string };

const EMPTY_FORM: TempleDirectoryFormValues = {
  fullName: '',
  displayTitle: '',
  entryType: 'MONK',
  termStart: '',
  termEnd: '',
  birth: '',
  age: '',
  ordination: '',
  vassa: '',
  templeName: '',
  province: '',
  affiliation: '',
  education: '',
  honoraryAwards: '',
  administrativePositions: '',
  monasticRank: '',
  biography: '',
  sources: '',
  sortOrder: 0,
  status: 'DRAFT',
  profileImage: null,
  currentImageUrl: '',
};

const fileToPayload = (file: File): Promise<TempleDirectoryImagePayload> =>
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

const sectionAvatar = (icon: string) => (
  <Avatar variant="rounded" sx={{ bgcolor: 'primary.lighter', color: 'primary.dark' }}>
    <Iconify icon={icon} />
  </Avatar>
);

export default function TempleDirectoryFormPage({ entry }: Props) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(entry);

  const methods = useForm<TempleDirectoryFormValues>({
    resolver: zodResolver(templeDirectoryFormSchema),
    defaultValues: entry
      ? {
          fullName: entry.fullName,
          displayTitle: entry.displayTitle,
          entryType: entry.entryType,
          termStart: entry.termStart,
          termEnd: entry.termEnd,
          birth: entry.birth,
          age: entry.age,
          ordination: entry.ordination,
          vassa: entry.vassa,
          templeName: entry.templeName,
          province: entry.province,
          affiliation: entry.affiliation,
          education: entry.education,
          honoraryAwards: entry.honoraryAwards,
          administrativePositions: entry.administrativePositions,
          monasticRank: entry.monasticRank,
          biography: entry.biography,
          sources: entry.sources,
          sortOrder: entry.sortOrder,
          status: entry.status,
          profileImage: null,
          currentImageUrl: entry.imageUrl,
        }
      : EMPTY_FORM,
    mode: 'onChange',
  });
  const { handleSubmit, setValue, watch } = methods;
  const profileImage = watch('profileImage');

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

  const dropProfileImage = useCallback(
    (files: File[]) => {
      const file = files[0];
      if (!file) return;
      revokePreview(profileImage);
      const preview = URL.createObjectURL(file);
      previewUrls.current.add(preview);
      setValue('profileImage', Object.assign(file, { preview }), {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [profileImage, revokePreview, setValue]
  );

  const removeProfileImage = useCallback(() => {
    revokePreview(profileImage);
    setValue('profileImage', null, { shouldDirty: true, shouldValidate: true });
  }, [profileImage, revokePreview, setValue]);

  const saveEntry = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        id: entry?.id,
        fullName: form.fullName.trim(),
        profileImage: form.profileImage ? await fileToPayload(form.profileImage) : null,
      };
      if (isEditing) await axios.patch('/api/admin/directory', payload);
      else await axios.post('/api/admin/directory', payload);
      router.push(paths.dashboard.directory);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Form methods={methods} onSubmit={saveEntry}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                aria-label="กลับไปหน้าจัดการทำเนียบวัด"
                disabled={saving}
                onClick={() => router.push(paths.dashboard.directory)}
              >
                <Iconify icon="ri:arrow-left-line" />
              </IconButton>
              <div>
                <Typography variant="h4">
                  {isEditing ? 'แก้ไขข้อมูลทำเนียบวัด' : 'เพิ่มข้อมูลทำเนียบวัด'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  กรอกเฉพาะข้อมูลที่มี ระบบจะไม่แสดงหัวข้อที่เว้นว่างบนเว็บไซต์
                </Typography>
              </div>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Card>
              <CardHeader
                avatar={sectionAvatar('solar:user-id-bold')}
                title="ข้อมูลหลักและรูปประจำตัว"
                subheader="ชื่อที่แสดง รูปภาพ ลำดับ และสถานะการเผยแพร่"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={3}>
                  <Field.Select name="entryType" required label="ประเภทบุคคล">
                    {TEMPLE_DIRECTORY_ENTRY_TYPES.map((item) => (
                      <MenuItem key={item.value} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Field.Select>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text name="fullName" required label="ชื่อ / สมณศักดิ์" />
                    <Field.Text
                      name="displayTitle"
                      label="ชื่อที่ใช้แสดงใต้รูป"
                      placeholder="เช่น พระธรรมพุทธิมงคล"
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text name="sortOrder" type="number" label="ลำดับการแสดง" />
                    <Field.Select name="status" label="สถานะ">
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                      <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                    </Field.Select>
                  </Stack>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2">รูปประจำตัว *</Typography>
                    <Field.Upload
                      name="profileImage"
                      file={profileImage || entry?.imageUrl || ''}
                      maxSize={8 * 1024 * 1024}
                      accept={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [] }}
                      onDrop={dropProfileImage}
                      onDelete={profileImage ? removeProfileImage : undefined}
                      helperText="แนะนำรูปแนวตั้ง · รองรับ JPG, PNG, WebP · ไม่เกิน 8 MB"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                avatar={sectionAvatar('solar:document-text-bold')}
                title="ข้อมูลพื้นฐาน"
                subheader="ข้อมูลสั้นที่แสดงร่วมกับรูปประจำตัว"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text name="birth" label="เกิด" placeholder="เช่น 4 มกราคม พ.ศ. 2477" />
                    <Field.Text name="age" label="อายุ" placeholder="เช่น 91 ปี" />
                    <Field.Text name="ordination" label="อุปสมบท" />
                    <Field.Text name="vassa" label="พรรษา" />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text name="templeName" label="วัด" />
                    <Controller
                      name="province"
                      control={methods.control}
                      render={({ field, fieldState: { error: fieldError } }) => (
                        <Autocomplete
                          fullWidth
                          options={THAI_PROVINCES}
                          value={field.value || null}
                          onChange={(_, province) => field.onChange(province || '')}
                          onBlur={field.onBlur}
                          noOptionsText="ไม่พบจังหวัด"
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name={field.name}
                              inputRef={field.ref}
                              label="จังหวัด"
                              placeholder="พิมพ์เพื่อค้นหาจังหวัด"
                              error={Boolean(fieldError)}
                              helperText={fieldError?.message}
                              slotProps={{
                                htmlInput: {
                                  ...params.inputProps,
                                  autoComplete: 'new-password',
                                },
                              }}
                            />
                          )}
                        />
                      )}
                    />
                    <Field.Text name="affiliation" label="สังกัด" />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                avatar={sectionAvatar('solar:square-academic-cap-bold')}
                title="การศึกษาและเกียรติคุณ"
                subheader="ใช้เครื่องมือจัดรูปแบบเพื่อแยกหัวข้อและรายการให้อ่านง่าย"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field.Editor name="education" label="การศึกษา" />
                  <Field.Editor name="honoraryAwards" label="เกียรติคุณ / ปริญญากิตติมศักดิ์" />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                avatar={sectionAvatar('solar:case-round-bold')}
                title="ตำแหน่งและสมณศักดิ์"
                subheader="ระบุตำแหน่งปัจจุบัน ตำแหน่งที่ผ่านมา และลำดับสมณศักดิ์"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text
                      name="termStart"
                      label="เริ่มดำรงตำแหน่ง"
                      placeholder="เช่น พ.ศ. 2560"
                    />
                    <Field.Text
                      name="termEnd"
                      label="สิ้นสุดการดำรงตำแหน่ง"
                      placeholder="เว้นว่างหากยังดำรงตำแหน่ง"
                    />
                  </Stack>
                  <Field.Editor name="administrativePositions" label="ตำแหน่ง / ฝ่ายปกครอง" />
                  <Field.Editor name="monasticRank" label="สมณศักดิ์" />
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                avatar={sectionAvatar('solar:book-2-bold')}
                title="ประวัติและแหล่งอ้างอิง"
                subheader="ใช้เครื่องมือจัดรูปแบบสำหรับเนื้อหาแบบละเอียด"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={1}>
                  <Field.Editor name="biography" label="ประวัติ" />
                  <Field.Editor name="sources" label="ที่มา / แหล่งอ้างอิง" />
                </Stack>
              </CardContent>
            </Card>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                disabled={saving}
                onClick={() => router.push(paths.dashboard.directory)}
              >
                ยกเลิก
              </Button>
              <LoadingButton type="submit" variant="contained" loading={saving}>
                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มเข้าทำเนียบวัด'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Form>
      </Container>
    </Layout>
  );
}
