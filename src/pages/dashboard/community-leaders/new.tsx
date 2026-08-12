import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
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
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Field, Form } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import {
  communityLeaderFormSchema,
  type CommunityLeaderFormValues,
} from 'src/schemas/community-leader';
import {
  COMMUNITY_LEADER_GROUPS,
  COMMUNITY_VILLAGES,
  type CommunityLeader,
  type CommunityLeaderImagePayload,
} from 'src/types/community-leader';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type Props = { leader?: CommunityLeader };
type PreviewFile = File & { preview?: string };

const EMPTY_FORM: CommunityLeaderFormValues = {
  villageKey: 'lao-nong-kham',
  fullName: '',
  role: '',
  responsibility: '',
  phone: '',
  group: 'village-head',
  sortOrder: 0,
  status: 'DRAFT',
  profileImage: null,
  currentImageUrl: '',
};

const fileToPayload = (file: File): Promise<CommunityLeaderImagePayload> =>
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

export default function CommunityLeaderFormPage({ leader }: Props) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(leader);

  const methods = useForm<CommunityLeaderFormValues>({
    resolver: zodResolver(communityLeaderFormSchema),
    defaultValues: leader
      ? {
          villageKey: leader.villageKey,
          fullName: leader.fullName,
          role: leader.role,
          responsibility: leader.responsibility,
          phone: leader.phone,
          group: leader.group,
          sortOrder: leader.sortOrder,
          status: leader.status,
          profileImage: null,
          currentImageUrl: leader.imageUrl,
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

  const saveLeader = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const payload = {
        ...form,
        id: leader?.id,
        fullName: form.fullName.trim(),
        role: form.role.trim(),
        profileImage: form.profileImage ? await fileToPayload(form.profileImage) : null,
      };
      if (isEditing) await axios.patch('/api/admin/community-leaders', payload);
      else await axios.post('/api/admin/community-leaders', payload);
      router.push(paths.dashboard.communityLeaders);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Form methods={methods} onSubmit={saveLeader}>
          <Stack spacing={3}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                aria-label="กลับไปหน้าจัดการผู้นำชุมชน"
                disabled={saving}
                onClick={() => router.push(paths.dashboard.communityLeaders)}
              >
                <Iconify icon="ri:arrow-left-line" />
              </IconButton>
              <div>
                <Typography variant="h4">
                  {isEditing ? 'แก้ไขข้อมูลผู้นำชุมชน' : 'เพิ่มผู้นำชุมชน'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  เลือกหมู่บ้าน ระบุตำแหน่ง และอัปโหลดรูปที่เห็นใบหน้าชัดเจน
                </Typography>
              </div>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Card>
              <CardHeader
                avatar={
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: 'primary.lighter', color: 'primary.dark' }}
                  >
                    <Iconify icon="solar:users-group-rounded-bold" />
                  </Avatar>
                }
                title="ข้อมูลผู้นำและหมู่บ้าน"
                subheader="ข้อมูลหลักที่จะแสดงบนหน้าผู้นำชุมชนบ้านเหล่า"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Select name="villageKey" label="หมู่บ้าน" required>
                      {COMMUNITY_VILLAGES.map((village) => (
                        <MenuItem key={village.key} value={village.key}>
                          {village.name}
                        </MenuItem>
                      ))}
                    </Field.Select>
                    <Field.Text name="fullName" label="ชื่อ–นามสกุลผู้นำ" required />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Select name="group" label="ประเภทตำแหน่ง" required>
                      {COMMUNITY_LEADER_GROUPS.map((group) => (
                        <MenuItem key={group.value} value={group.value}>
                          {group.label}
                        </MenuItem>
                      ))}
                    </Field.Select>
                    <Field.Text
                      name="role"
                      label="ชื่อตำแหน่ง"
                      required
                      placeholder="เช่น ผู้ใหญ่บ้าน หมู่ 4"
                    />
                  </Stack>
                  <Field.Text
                    name="responsibility"
                    label="หน้าที่รับผิดชอบ"
                    multiline
                    rows={3}
                    placeholder="เช่น ดูแลและประสานงานภาพรวมของหมู่บ้าน"
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Field.Text name="phone" label="เบอร์โทรศัพท์ (ไม่บังคับ)" />
                    <Field.Text name="sortOrder" type="number" label="ลำดับการแสดง" />
                    <Field.Select name="status" label="สถานะ">
                      <MenuItem value="DRAFT">แบบร่าง</MenuItem>
                      <MenuItem value="PUBLIC">เผยแพร่</MenuItem>
                    </Field.Select>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="รูปผู้นำ" subheader="รูปจะถูกครอปให้พอดีกับการ์ดบนเว็บไซต์" />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Field.Upload
                  name="profileImage"
                  file={profileImage || leader?.imageUrl || ''}
                  maxSize={8 * 1024 * 1024}
                  accept={{ 'image/jpeg': [], 'image/png': [], 'image/webp': [] }}
                  onDrop={dropProfileImage}
                  onDelete={profileImage ? removeProfileImage : undefined}
                  helperText="แนะนำรูปแนวตั้ง เห็นใบหน้าชัดเจน · JPG, PNG หรือ WebP · ไม่เกิน 8 MB"
                />
              </CardContent>
            </Card>

            <Stack direction="row" justifyContent="flex-end" spacing={2}>
              <Button
                variant="outlined"
                disabled={saving}
                onClick={() => router.push(paths.dashboard.communityLeaders)}
              >
                ยกเลิก
              </Button>
              <LoadingButton type="submit" variant="contained" loading={saving}>
                {isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มผู้นำชุมชน'}
              </LoadingButton>
            </Stack>
          </Stack>
        </Form>
      </Container>
    </Layout>
  );
}
