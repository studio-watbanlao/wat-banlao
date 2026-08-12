import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Field, Form } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import {
  templeDomainFormSchema,
  templeMemberFormSchema,
  type TempleDomainFormValues,
  type TempleMemberFormValues,
} from 'src/schemas/temple';
import {
  TEMPLE_MODULES,
  type Temple,
  type TempleDomain,
  type TempleModule,
  type TemplePermissions,
} from 'src/types/temple';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type ManagedUser = { id: string; email?: string; displayName?: string; role: string };
type Member = {
  temple_id: string;
  user_id: string;
  role: 'temple_admin' | 'temple_editor';
  permissions: TemplePermissions;
  status: string;
};

type Props = {
  temple: Temple;
  section: 'domains' | 'members';
};

const MODULE_LABELS: Record<TempleModule, string> = {
  dashboard: 'หน้าภาพรวม',
  pages: 'หน้าคงที่',
  banners: 'Banner',
  activities: 'กิจกรรม',
  architectures: 'สถาปัตย์',
  directory: 'ทำเนียบวัด',
  community_leaders: 'ผู้นำชุมชน',
  festivals: 'งานประเพณี',
  blogs: 'บทความ',
  dharmas: 'ธรรมะ',
  contacts: 'ข้อความติดต่อ',
  sacred: 'วัตถุมงคล',
  branding: 'Branding',
  members: 'ผู้ดูแลวัด',
  domains: 'Domain',
};

const DOMAIN_STATUS = {
  PENDING: { label: 'รอตรวจสอบ', color: 'warning' },
  VERIFIED: { label: 'ยืนยันแล้ว', color: 'success' },
  FAILED: { label: 'ไม่ผ่าน', color: 'error' },
} as const;

export default function TempleAccessManagement({ temple, section }: Props) {
  const [domains, setDomains] = useState<TempleDomain[]>(temple.domains);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingDomain, setSavingDomain] = useState(false);
  const [savingMember, setSavingMember] = useState(false);

  const availableModules = useMemo(
    () =>
      TEMPLE_MODULES.filter((module) => temple.modules[module] && module !== 'community_leaders'),
    [temple.modules]
  );
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);

  const domainMethods = useForm<TempleDomainFormValues>({
    resolver: zodResolver(templeDomainFormSchema),
    defaultValues: {
      domain: '',
      ownership: 'TEMPLE',
      verificationStatus: 'PENDING',
      registrar: '',
      expiresAt: '',
      isPrimary: temple.domains.length === 0,
    },
  });
  const memberMethods = useForm<TempleMemberFormValues>({
    resolver: zodResolver(templeMemberFormSchema),
    defaultValues: {
      userId: '',
      role: 'temple_editor',
      modules: availableModules,
    },
  });

  const loadAccessData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const templeRequest = axios.get('/api/admin/temples');
      const usersRequest = section === 'members' ? axios.get('/api/admin/users') : null;
      const [templeResponse, usersResponse] = await Promise.all([templeRequest, usersRequest]);
      const currentTemple = (templeResponse.data.temples as Temple[]).find(
        (item) => item.id === temple.id
      );
      setDomains(currentTemple?.domains || []);
      setMembers(
        (templeResponse.data.members as Member[]).filter((member) => member.temple_id === temple.id)
      );
      if (usersResponse) setUsers(usersResponse.data.users);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [section, temple.id]);

  useEffect(() => {
    loadAccessData();
  }, [loadAccessData]);

  const saveDomain = domainMethods.handleSubmit(async (form) => {
    try {
      setSavingDomain(true);
      setError('');
      await axios.patch('/api/admin/temples', {
        action: 'saveDomain',
        templeId: temple.id,
        ...form,
        expiresAt: form.expiresAt || null,
      });
      domainMethods.reset({
        domain: '',
        ownership: 'TEMPLE',
        verificationStatus: 'PENDING',
        registrar: '',
        expiresAt: '',
        isPrimary: false,
      });
      await loadAccessData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingDomain(false);
    }
  });

  const saveMember = memberMethods.handleSubmit(async (form) => {
    try {
      setSavingMember(true);
      setError('');
      const actions =
        form.role === 'temple_admin'
          ? ['read', 'create', 'update', 'delete', 'publish']
          : ['read', 'create', 'update'];
      const permissions = Object.fromEntries(
        form.modules.map((module) => [module, actions])
      ) as TemplePermissions;
      await axios.patch('/api/admin/temples', {
        action: 'saveMember',
        templeId: temple.id,
        userId: form.userId,
        role: form.role,
        permissions,
      });
      memberMethods.reset({ userId: '', role: 'temple_editor', modules: form.modules });
      await loadAccessData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSavingMember(false);
    }
  });

  const removeMember = async (userId: string) => {
    if (!window.confirm('นำผู้ดูแลคนนี้ออกจากวัดหรือไม่?')) return;
    try {
      setError('');
      await axios.delete('/api/admin/temples', { params: { templeId: temple.id, userId } });
      await loadAccessData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const removeDomain = async (domainId: string) => {
    if (!window.confirm('ลบ Domain นี้หรือไม่?')) return;
    try {
      setError('');
      await axios.delete('/api/admin/temples', { params: { templeId: temple.id, domainId } });
      await loadAccessData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const renderDomains = () => (
    <Card>
      <CardHeader
        avatar={
          <Avatar variant="rounded" sx={{ bgcolor: 'info.lighter', color: 'info.dark' }}>
            <Iconify icon="solar:global-bold" />
          </Avatar>
        }
        title="Domains ของวัด"
        subheader="Domain ที่ยืนยันแล้วจะใช้ระบุเว็บไซต์วัดจาก request host"
        action={<Chip label={`${domains.length} Domains`} />}
      />
      {loading ? <LinearProgress /> : <Divider sx={{ pt: 2 }} />}
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            {!loading && domains.length === 0 ? (
              <Alert severity="info">ยังไม่มี Domain กรุณาเพิ่ม Domain แรกของวัด</Alert>
            ) : null}
            {domains.map((domain) => {
              const status = DOMAIN_STATUS[domain.verificationStatus];
              return (
                <Box
                  key={domain.id}
                  sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }}
                    spacing={1.5}
                  >
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {domain.domain}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {domain.ownership === 'TEMPLE'
                          ? 'วัดเป็นผู้ถือครอง'
                          : 'Platform เป็นผู้ถือครอง'}
                        {domain.registrar ? ` · ${domain.registrar}` : ''}
                      </Typography>
                    </Stack>
                    {domain.isPrimary ? (
                      <Chip size="small" color="primary" label="Primary" />
                    ) : null}
                    <Chip size="small" color={status.color} label={status.label} />
                    <Button color="error" size="small" onClick={() => removeDomain(domain.id)}>
                      ลบ
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Divider />
          <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.neutral', borderRadius: 2 }}>
            <Form methods={domainMethods} onSubmit={saveDomain}>
              <Stack spacing={2.5}>
                <div>
                  <Typography variant="h6">เพิ่ม Domain</Typography>
                  <Typography variant="body2" color="text.secondary">
                    กรอกเฉพาะชื่อ Domain ไม่ต้องใส่ https:// หรือ path
                  </Typography>
                </div>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Field.Text name="domain" label="Domain" placeholder="wat-example.com" />
                  <Field.Select name="ownership" label="ผู้ถือครอง">
                    <MenuItem value="TEMPLE">วัดซื้อเอง</MenuItem>
                    <MenuItem value="PLATFORM">Platform ซื้อให้</MenuItem>
                  </Field.Select>
                  <Field.Select name="verificationStatus" label="สถานะตรวจสอบ">
                    <MenuItem value="PENDING">รอตรวจสอบ</MenuItem>
                    <MenuItem value="VERIFIED">ยืนยันแล้ว</MenuItem>
                    <MenuItem value="FAILED">ไม่ผ่าน</MenuItem>
                  </Field.Select>
                </Stack>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ md: 'center' }}
                  spacing={2}
                >
                  <Field.Text name="registrar" label="Registrar" />
                  <Field.DatePicker
                    name="expiresAt"
                    label="วันหมดอายุ"
                    format="dd/MM/yyyy"
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <Field.Checkbox name="isPrimary" label="ตั้งเป็น Primary Domain" />
                  <LoadingButton type="submit" variant="contained" loading={savingDomain}>
                    เพิ่ม Domain
                  </LoadingButton>
                </Stack>
              </Stack>
            </Form>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderMembers = () => (
    <Card>
      <CardHeader
        avatar={
          <Avatar variant="rounded" sx={{ bgcolor: 'warning.lighter', color: 'warning.dark' }}>
            <Iconify icon="solar:users-group-rounded-bold" />
          </Avatar>
        }
        title="ผู้ดูแลและสิทธิ์"
        subheader="กำหนดว่าแต่ละคนเห็นและจัดการ Module ใดของวัดนี้ได้บ้าง"
        action={<Chip label={`${members.length} คน`} />}
      />
      {loading ? <LinearProgress /> : <Divider sx={{ pt: 2 }} />}
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={1.5}>
            {!loading && members.length === 0 ? (
              <Alert severity="info">ยังไม่ได้กำหนดผู้ดูแลให้วัดนี้</Alert>
            ) : null}
            {members.map((member) => {
              const managedUser = usersById.get(member.user_id);
              const moduleLabels = Object.keys(member.permissions)
                .map((module) => MODULE_LABELS[module as TempleModule] || module)
                .join(', ');
              return (
                <Box
                  key={member.user_id}
                  sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1.5 }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar>
                      {(managedUser?.displayName || managedUser?.email || 'U').slice(0, 1)}
                    </Avatar>
                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {managedUser?.displayName || managedUser?.email || member.user_id}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {moduleLabels || 'ไม่มีสิทธิ์'}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      color={member.role === 'temple_admin' ? 'primary' : 'default'}
                      label={member.role === 'temple_admin' ? 'Temple Admin' : 'Temple Editor'}
                    />
                    <Button color="error" size="small" onClick={() => removeMember(member.user_id)}>
                      นำออก
                    </Button>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          <Divider />
          <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: 'background.neutral', borderRadius: 2 }}>
            <Form methods={memberMethods} onSubmit={saveMember}>
              <Stack spacing={2.5}>
                <div>
                  <Typography variant="h6">เพิ่มหรือแก้ไขผู้ดูแล</Typography>
                  <Typography variant="body2" color="text.secondary">
                    เลือกผู้ใช้เดิมอีกครั้งเพื่ออัปเดต Role และสิทธิ์
                  </Typography>
                </div>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <Field.Select name="userId" label="ผู้ใช้งาน">
                    {users
                      .filter((user) => user.role !== 'super_admin')
                      .map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.displayName || user.email}
                        </MenuItem>
                      ))}
                  </Field.Select>
                  <Field.Select name="role" label="Role">
                    <MenuItem value="temple_admin">Temple Admin — จัดการและเผยแพร่</MenuItem>
                    <MenuItem value="temple_editor">Temple Editor — สร้างและแก้ไข</MenuItem>
                  </Field.Select>
                </Stack>
                <Field.MultiCheckbox
                  row
                  name="modules"
                  label="Modules ที่ผู้ดูแลมองเห็นและจัดการได้"
                  options={availableModules.map((module) => ({
                    value: module,
                    label: MODULE_LABELS[module],
                  }))}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <LoadingButton type="submit" variant="contained" loading={savingMember}>
                    บันทึกสิทธิ์ผู้ดูแล
                  </LoadingButton>
                </Stack>
              </Stack>
            </Form>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {section === 'domains' ? renderDomains() : renderMembers()}
    </Stack>
  );
}
