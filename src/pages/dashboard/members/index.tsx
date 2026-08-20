import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Field, Form } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { templeInvitationFormSchema, type TempleInvitationFormValues } from 'src/schemas/temple';
import {
  TEMPLE_CONTRIBUTOR_MODULES,
  TEMPLE_MODULES,
  type Temple,
  type TempleInvitation,
  type TempleMemberRole,
  type TempleModule,
  type TemplePermissions,
} from 'src/types/temple';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { zodResolver } from 'src/utils/zod-resolver';

type Member = {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string;
  role: TempleMemberRole;
  permissions: TemplePermissions;
  status: 'ACTIVE' | 'SUSPENDED';
};

const MODULE_LABELS: Record<TempleModule, string> = {
  dashboard: 'ภาพรวม',
  pages: 'หน้าคงที่',
  banners: 'ภาพประชาสัมพันธ์',
  activities: 'กิจกรรม/ประกาศ',
  architectures: 'สถาปัตย์',
  directory: 'ทำเนียบวัด',
  community_leaders: 'ผู้นำชุมชน',
  festivals: 'งานประเพณี',
  blogs: 'บทความ/ข่าว',
  dharmas: 'ธรรมะ',
  contacts: 'ข้อความติดต่อ',
  sacred: 'วัตถุมงคล',
  branding: 'โลโก้และสีประจำวัด',
  members: 'สมาชิกวัด',
  domains: 'ชื่อเว็บไซต์',
};

const ROLE_LABEL: Record<TempleMemberRole, string> = {
  temple_admin: 'ผู้ดูแลวัด',
  temple_editor: 'บรรณาธิการ',
  temple_contributor: 'ผู้เขียนเนื้อหา',
};

const INVITE_DEFAULTS: TempleInvitationFormValues = {
  email: '',
  role: 'temple_contributor',
  modules: ['activities', 'blogs'],
};

export default function TempleMembersPage() {
  const [tab, setTab] = useState<'members' | 'invitations'>('members');
  const [temple, setTemple] = useState<Temple | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<TempleInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [permissionsSaving, setPermissionsSaving] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingModules, setEditingModules] = useState<TempleModule[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const methods = useForm<TempleInvitationFormValues>({
    resolver: zodResolver(templeInvitationFormSchema),
    defaultValues: INVITE_DEFAULTS,
  });
  const inviteRole = methods.watch('role');
  const pendingInvitations = useMemo(
    () => invitations.filter((invitation) => invitation.status === 'PENDING'),
    [invitations]
  );

  const editableModules = useMemo(() => {
    if (!editingMember || !temple) return [];
    return TEMPLE_MODULES.filter(
      (module) =>
        temple.modules[module] &&
        !['dashboard', 'members', 'domains', 'branding', 'contacts', 'community_leaders'].includes(
          module
        ) &&
        (editingMember.role !== 'temple_contributor' || TEMPLE_CONTRIBUTOR_MODULES.includes(module))
    );
  }, [editingMember, temple]);

  const availableModules = useMemo(
    () =>
      TEMPLE_MODULES.filter(
        (module) =>
          temple?.modules[module] &&
          ![
            'dashboard',
            'members',
            'domains',
            'branding',
            'contacts',
            'community_leaders',
          ].includes(module) &&
          (inviteRole !== 'temple_contributor' || TEMPLE_CONTRIBUTOR_MODULES.includes(module))
      ),
    [inviteRole, temple]
  );

  useEffect(() => {
    if (inviteRole !== 'temple_contributor') return;
    const selected = methods.getValues('modules');
    const contributorModules = selected.filter((module) =>
      TEMPLE_CONTRIBUTOR_MODULES.includes(module as TempleModule)
    );
    methods.setValue(
      'modules',
      contributorModules.length ? contributorModules : ['activities', 'blogs'],
      { shouldValidate: true }
    );
  }, [inviteRole, methods]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/members');
      setTemple(response.data.temple);
      setMembers(response.data.members);
      setInvitations(response.data.invitations);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const invite = methods.handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const response = await axios.post('/api/admin/members', form);
      setSuccess(response.data.message);
      methods.reset(INVITE_DEFAULTS);
      setTab('invitations');
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  const updateStatus = async (member: Member) => {
    try {
      setError('');
      await axios.patch('/api/admin/members', {
        userId: member.userId,
        status: member.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
      });
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const openPermissions = (member: Member) => {
    setEditingMember(member);
    setEditingModules(
      Object.keys(member.permissions).filter((module) => module !== 'dashboard') as TempleModule[]
    );
  };

  const toggleEditingModule = (module: TempleModule) => {
    setEditingModules((current) =>
      current.includes(module) ? current.filter((item) => item !== module) : [...current, module]
    );
  };

  const savePermissions = async () => {
    if (!editingMember) return;
    try {
      setPermissionsSaving(true);
      setError('');
      setSuccess('');
      await axios.patch('/api/admin/members', {
        action: 'update_permissions',
        userId: editingMember.userId,
        modules: editingModules,
      });
      setSuccess(`บันทึกสิทธิ์ของ ${editingMember.displayName} แล้ว`);
      setEditingMember(null);
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setPermissionsSaving(false);
    }
  };

  const removeMember = async (member: Member) => {
    if (!window.confirm(`นำ ${member.displayName} ออกจากวัดหรือไม่?`)) return;
    try {
      setError('');
      await axios.delete('/api/admin/members', { params: { userId: member.userId } });
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const revokeInvitation = async (invitation: TempleInvitation) => {
    if (!window.confirm(`ยกเลิกคำเชิญ ${invitation.email} หรือไม่?`)) return;
    try {
      setError('');
      await axios.delete('/api/admin/members', { params: { invitationId: invitation.id } });
      await load();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h4">สมาชิกวัด</Typography>
            <Typography variant="body2" color="text.secondary">
              {temple?.name || 'วัดที่กำลังเลือก'} · เชิญพระลูกวัดหรือผู้ช่วยเข้ามาสร้างเนื้อหา
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}

          <Card>
            <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ px: 2 }}>
              <Tab value="members" label={`สมาชิก (${members.length})`} />
              <Tab
                value="invitations"
                label={`อีเมลที่รอเข้าระบบ (${pendingInvitations.length})`}
              />
            </Tabs>
          </Card>

          {loading ? (
            <Box sx={{ py: 8, textAlign: 'center' }}>
              <CircularProgress />
            </Box>
          ) : null}

          {!loading && tab === 'members' ? (
            <Card>
              <CardHeader
                title="สมาชิกในวัด"
                subheader="สมาชิกจะเห็นเฉพาะเมนูและส่วนงานที่ได้รับอนุญาต"
              />
              <Divider sx={{ mt: 2 }} />
              <CardContent>
                <Stack spacing={1.5}>
                  {members.map((member) => (
                    <Stack
                      key={member.userId}
                      direction={{ xs: 'column', md: 'row' }}
                      alignItems={{ md: 'center' }}
                      spacing={2}
                      sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
                    >
                      <Avatar src={member.avatarUrl}>{member.displayName.slice(0, 1)}</Avatar>
                      <Stack sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2">{member.displayName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Object.keys(member.permissions)
                            .map((module) => MODULE_LABELS[module as TempleModule])
                            .join(', ') || 'ยังไม่ได้รับสิทธิ์ใช้งานส่วนใด'}
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        color={member.role === 'temple_admin' ? 'primary' : 'default'}
                        label={ROLE_LABEL[member.role]}
                      />
                      <Chip
                        size="small"
                        color={member.status === 'ACTIVE' ? 'success' : 'warning'}
                        label={member.status === 'ACTIVE' ? 'ใช้งาน' : 'ระงับ'}
                      />
                      {member.role !== 'temple_admin' ? (
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="soft"
                            onClick={() => openPermissions(member)}
                          >
                            แก้ไขสิทธิ์
                          </Button>
                          <Button size="small" color="inherit" onClick={() => updateStatus(member)}>
                            {member.status === 'ACTIVE' ? 'ระงับ' : 'เปิดใช้'}
                          </Button>
                          <Button size="small" color="error" onClick={() => removeMember(member)}>
                            นำออก
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  ))}
                  {!members.length ? <Alert severity="info">ยังไม่มีสมาชิกในวัด</Alert> : null}
                </Stack>
              </CardContent>
            </Card>
          ) : null}

          {!loading && tab === 'invitations' ? (
            <Stack spacing={3}>
              <Card>
                <CardHeader
                  avatar={<Iconify icon="solar:letter-bold" />}
                  title="เพิ่มสมาชิกด้วยอีเมล Google"
                  subheader="ไม่มีลิงก์คำเชิญ ผู้ใช้เพียงเข้าสู่ระบบด้วย Google บัญชีเดียวกับอีเมลนี้"
                />
                <Divider sx={{ mt: 2 }} />
                <CardContent>
                  <Form methods={methods} onSubmit={invite}>
                    <Stack spacing={2.5}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <Field.Text name="email" type="email" label="อีเมลผู้รับคำเชิญ" />
                        <Field.Select name="role" label="บทบาท">
                          <MenuItem value="temple_contributor">
                            ผู้เขียนเนื้อหา — สร้างและแก้ไขแบบร่างของตนเอง
                          </MenuItem>
                          <MenuItem value="temple_editor">
                            บรรณาธิการ — สร้างและแก้ไขเนื้อหาในส่วนที่ได้รับสิทธิ์
                          </MenuItem>
                        </Field.Select>
                      </Stack>
                      <Field.MultiCheckbox
                        row
                        name="modules"
                        label="เมนูและส่วนงานที่อนุญาต"
                        options={availableModules.map((module) => ({
                          value: module,
                          label: MODULE_LABELS[module],
                        }))}
                      />
                      <Alert severity="info">
                        สมาชิกจะได้รับสิทธิ์หน้าภาพรวม `/dashboard` ของวัดนี้อัตโนมัติ
                      </Alert>
                      <Stack direction="row" justifyContent="flex-end">
                        <LoadingButton
                          type="submit"
                          variant="contained"
                          loading={saving}
                          startIcon={<Iconify icon="solar:letter-bold" />}
                        >
                          เพิ่มอีเมลผู้ใช้
                        </LoadingButton>
                      </Stack>
                    </Stack>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="รายชื่ออีเมลที่รอเข้าระบบ"
                  subheader="เมื่อเข้าระบบด้วย Google สำเร็จ ระบบจะย้ายไปแสดงในแท็บสมาชิกอัตโนมัติ"
                />
                <Divider sx={{ mt: 2 }} />
                <CardContent>
                  <Stack spacing={1.5}>
                    {pendingInvitations.map((invitation) => (
                      <Stack
                        key={invitation.id}
                        direction={{ xs: 'column', md: 'row' }}
                        alignItems={{ md: 'center' }}
                        spacing={1.5}
                        sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 2 }}
                      >
                        <Stack sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="subtitle2">{invitation.email}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ให้เข้าระบบด้วย Google บัญชีนี้
                          </Typography>
                        </Stack>
                        <Chip size="small" label={ROLE_LABEL[invitation.role]} />
                        <Chip size="small" color="warning" label="รอเข้าระบบ" />
                        <Button
                          color="error"
                          size="small"
                          onClick={() => revokeInvitation(invitation)}
                        >
                          ยกเลิก
                        </Button>
                      </Stack>
                    ))}
                    {!pendingInvitations.length ? (
                      <Alert severity="info">ไม่มีอีเมลที่รอเข้าระบบ</Alert>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          ) : null}
        </Stack>
      </Container>

      <Dialog
        open={Boolean(editingMember)}
        onClose={permissionsSaving ? undefined : () => setEditingMember(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>แก้ไขเมนูและส่วนงานที่อนุญาต</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1">{editingMember?.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {editingMember?.email} · {editingMember ? ROLE_LABEL[editingMember.role] : ''}
              </Typography>
            </Box>
            <Alert severity="info">สมาชิกทุกคนเข้าหน้าภาพรวม `/dashboard` ได้อัตโนมัติ</Alert>
            <FormGroup>
              {editableModules.map((module) => (
                <FormControlLabel
                  key={module}
                  control={
                    <Checkbox
                      checked={editingModules.includes(module)}
                      onChange={() => toggleEditingModule(module)}
                    />
                  }
                  label={MODULE_LABELS[module]}
                />
              ))}
            </FormGroup>
            {!editableModules.length ? (
              <Alert severity="warning">ไม่มีส่วนงานที่เปิดใช้งานสำหรับบทบาทนี้</Alert>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            disabled={permissionsSaving}
            onClick={() => setEditingMember(null)}
          >
            ยกเลิก
          </Button>
          <LoadingButton variant="contained" loading={permissionsSaving} onClick={savePermissions}>
            บันทึกสิทธิ์
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
