import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from 'src/utils/zod-resolver';
import { useAuthContext } from 'src/auth/hooks';
import Layout from 'src/pages/dashboard/layout';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { changeRoleFormSchema, createUserFormSchema } from 'src/schemas/user';
import type { ChangeRoleFormValues, CreateUserFormValues } from 'src/schemas/user';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type UserRole = 'user' | 'admin' | 'super_admin';

type ManagedUser = {
  id: string;
  email?: string;
  displayName?: string;
  role: UserRole;
  provider?: string;
  createdAt?: string;
};

const EMPTY_CREATE_FORM: CreateUserFormValues = { email: '', password: '', role: 'user' };

export default function UsersManagementPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthContext();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [roleSaving, setRoleSaving] = useState(false);
  const [error, setError] = useState('');
  const [roleDialogUser, setRoleDialogUser] = useState<ManagedUser | null>(null);

  const {
    control: createControl,
    handleSubmit: handleCreateSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors, isValid: isCreateValid },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: EMPTY_CREATE_FORM,
    mode: 'onChange',
  });

  const {
    control: roleControl,
    handleSubmit: handleRoleSubmit,
    reset: resetRoleForm,
    watch: watchRole,
  } = useForm<ChangeRoleFormValues>({
    resolver: zodResolver(changeRoleFormSchema),
    defaultValues: { role: 'user' },
  });

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role && currentUser.role !== 'super_admin') {
      router.replace(paths.page403);
      return;
    }

    if (currentUser?.role === 'super_admin') loadUsers();
  }, [currentUser?.role, loadUsers, router]);

  const createUser = handleCreateSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      await axios.post('/api/admin/users', form);
      resetCreateForm(EMPTY_CREATE_FORM);
      await loadUsers();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  const openRoleDialog = (managedUser: ManagedUser) => {
    setRoleDialogUser(managedUser);
    resetRoleForm({ role: managedUser.role === 'admin' ? 'admin' : 'user' });
  };

  const closeRoleDialog = () => {
    if (!roleSaving) setRoleDialogUser(null);
  };

  const changeRole = handleRoleSubmit(async (form) => {
    if (!roleDialogUser) return;

    try {
      setRoleSaving(true);
      setError('');
      await axios.patch('/api/admin/users', {
        userId: roleDialogUser.id,
        role: form.role,
      });
      setUsers((current) =>
        current.map((item) => (item.id === roleDialogUser.id ? { ...item, role: form.role } : item))
      );
      setRoleDialogUser(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setRoleSaving(false);
    }
  });

  const removeUser = async (managedUser: ManagedUser) => {
    if (!window.confirm(`ลบผู้ใช้ ${managedUser.email || managedUser.id} หรือไม่?`)) return;

    try {
      setError('');
      await axios.delete('/api/admin/users', { params: { userId: managedUser.id } });
      setUsers((current) => current.filter((item) => item.id !== managedUser.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  };

  const selectedRole = watchRole('role');

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Typography variant="h4">จัดการผู้ใช้งาน</Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              เพิ่มผู้ใช้
            </Typography>
            <Stack
              component="form"
              autoComplete="off"
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              onSubmit={createUser}
            >
              <Controller
                name="email"
                control={createControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email"
                    type="email"
                    autoComplete="off"
                    error={!!createErrors.email}
                    helperText={createErrors.email?.message}
                  />
                )}
              />
              <Controller
                name="password"
                control={createControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    error={!!createErrors.password}
                    helperText={createErrors.password?.message}
                  />
                )}
              />
              <Controller
                name="role"
                control={createControl}
                render={({ field }) => (
                  <FormControl sx={{ minWidth: 140 }}>
                    <InputLabel>Role</InputLabel>
                    <Select {...field} label="Role">
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={saving}
                disabled={!isCreateValid}
              >
                เพิ่มผู้ใช้
              </LoadingButton>
            </Stack>
          </Card>

          <Card>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ผู้ใช้</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>วันที่สร้าง</TableCell>
                    <TableCell align="right">จัดการ</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((managedUser) => {
                    const protectedAccount =
                      managedUser.role === 'super_admin' || managedUser.id === currentUser?.id;

                    return (
                      <TableRow key={managedUser.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{managedUser.displayName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {managedUser.email}
                          </Typography>
                        </TableCell>
                        <TableCell>{managedUser.provider}</TableCell>
                        <TableCell>
                          {protectedAccount ? (
                            managedUser.role
                          ) : (
                            <Button
                              variant="outlined"
                              color="inherit"
                              onClick={() => openRoleDialog(managedUser)}
                            >
                              {managedUser.role === 'admin' ? 'Admin' : 'User'} · เปลี่ยน Role
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>
                          {managedUser.createdAt
                            ? new Date(managedUser.createdAt).toLocaleDateString('th-TH')
                            : '-'}
                        </TableCell>
                        <TableCell align="right">
                          {!protectedAccount && (
                            <Button color="error" onClick={() => removeUser(managedUser)}>
                              ลบ
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {!loading && users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        ไม่พบผู้ใช้งาน
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Stack>
      </Container>

      <Dialog open={Boolean(roleDialogUser)} onClose={closeRoleDialog} fullWidth maxWidth="xs">
        <DialogTitle>เปลี่ยน Role ผู้ใช้งาน</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }} component="form" onSubmit={changeRole}>
            <Alert severity="info">
              กำลังเปลี่ยนสิทธิ์ของ {roleDialogUser?.displayName || roleDialogUser?.email}
            </Alert>
            <Controller
              name="role"
              control={roleControl}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select {...field} label="Role">
                    <MenuItem value="user">User — ยังเข้า Admin UI ไม่ได้</MenuItem>
                    <MenuItem value="admin">Admin — เข้า Admin UI ได้</MenuItem>
                  </Select>
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" disabled={roleSaving} onClick={closeRoleDialog}>
            ยกเลิก
          </Button>
          <LoadingButton
            variant="contained"
            loading={roleSaving}
            disabled={selectedRole === roleDialogUser?.role}
            onClick={changeRole}
          >
            ยืนยันการเปลี่ยน Role
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
