import { zodResolver } from '@hookform/resolvers/zod';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import Iconify from 'src/components/iconify';
import Layout from 'src/pages/dashboard/layout';
import { contactAdminFormSchema, type ContactAdminFormValues } from 'src/schemas/contact';
import type { ContactMessage, ContactStatus } from 'src/types/contact';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';
import { fDateTime } from 'src/utils/format-time';

type StatusFilter = ContactStatus | 'ALL';

const STATUS_OPTIONS: Array<{ value: ContactStatus; label: string }> = [
  { value: 'NEW', label: 'ใหม่' },
  { value: 'READ', label: 'อ่านแล้ว' },
  { value: 'IN_PROGRESS', label: 'กำลังดำเนินการ' },
  { value: 'RESOLVED', label: 'เสร็จสิ้น' },
  { value: 'ARCHIVED', label: 'เก็บถาวร' },
];

const STATUS_META: Record<
  ContactStatus,
  { label: string; color: 'error' | 'info' | 'warning' | 'success' | 'default' }
> = {
  NEW: { label: 'ใหม่', color: 'error' },
  READ: { label: 'อ่านแล้ว', color: 'info' },
  IN_PROGRESS: { label: 'กำลังดำเนินการ', color: 'warning' },
  RESOLVED: { label: 'เสร็จสิ้น', color: 'success' },
  ARCHIVED: { label: 'เก็บถาวร', color: 'default' },
};

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState<ContactMessage[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactAdminFormValues>({
    resolver: zodResolver(contactAdminFormSchema),
    mode: 'onChange',
  });

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/admin/contacts');
      setContacts(response.data.contacts || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const filteredContacts = useMemo(
    () =>
      statusFilter === 'ALL'
        ? contacts
        : contacts.filter((contact) => contact.status === statusFilter),
    [contacts, statusFilter]
  );

  const openDetail = (contact: ContactMessage) => {
    reset({
      id: contact.id,
      name: contact.name,
      email: contact.email,
      subject: contact.subject,
      message: contact.message,
      status: contact.status,
      adminNote: contact.adminNote || '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };

  const save = handleSubmit(async (form) => {
    try {
      setSaving(true);
      setError('');
      const response = await axios.patch('/api/admin/contacts', form);
      const updated = response.data.contact as ContactMessage;
      setContacts((current) =>
        current.map((contact) => (contact.id === updated.id ? updated : contact))
      );
      setDialogOpen(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  });

  const remove = async (contact: ContactMessage) => {
    if (!window.confirm(`ลบข้อความจาก “${contact.name}” หรือไม่?`)) return;
    try {
      setDeletingId(contact.id);
      setError('');
      await axios.delete('/api/admin/contacts', { params: { id: contact.id } });
      setContacts((current) => current.filter((item) => item.id !== contact.id));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setDeletingId('');
    }
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ sm: 'center' }}
            justifyContent="space-between"
            spacing={2}
          >
            <div>
              <Typography variant="h4">จัดการข้อความติดต่อ</Typography>
              <Typography variant="body2" color="text.secondary">
                ข้อความที่ผู้ใช้ส่งจากหน้า “ติดต่อเรา”
              </Typography>
            </div>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel>กรองสถานะ</InputLabel>
              <Select
                value={statusFilter}
                label="กรองสถานะ"
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                <MenuItem value="ALL">ทั้งหมด</MenuItem>
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <Typography color="text.secondary">กำลังโหลด...</Typography> : null}

          <Grid container spacing={3}>
            {filteredContacts.map((contact) => {
              const status = STATUS_META[contact.status];
              return (
                <Grid item xs={12} md={6} lg={4} key={contact.id}>
                  <Card sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <div>
                          <Typography variant="h6">{contact.subject}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {contact.name} · {contact.email}
                          </Typography>
                        </div>
                        <Chip size="small" label={status.label} color={status.color} />
                      </Stack>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {contact.message.length > 160
                          ? `${contact.message.slice(0, 160)}…`
                          : contact.message}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 2, display: 'block' }}
                      >
                        {fDateTime(contact.createdAt, 'dd/MM/yyyy HH:mm')}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <Button onClick={() => openDetail(contact)}>ดูและแก้ไข</Button>
                      <LoadingButton
                        color="error"
                        loading={deletingId === contact.id}
                        onClick={() => remove(contact)}
                      >
                        ลบ
                      </LoadingButton>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {!loading && !filteredContacts.length ? (
            <Card sx={{ py: 8, textAlign: 'center' }}>
              <Iconify icon="solar:inbox-line-bold-duotone" width={64} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                ยังไม่มีข้อความติดต่อ
              </Typography>
            </Card>
          ) : null}
        </Stack>
      </Container>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>รายละเอียดข้อความติดต่อ</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }} component="form" onSubmit={save}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    label="ชื่อ"
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    required
                    type="email"
                    label="อีเมล"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Stack>
            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  label="หัวข้อ"
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                />
              )}
            />
            <Controller
              name="message"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  required
                  multiline
                  minRows={6}
                  label="ข้อความ"
                  error={!!errors.message}
                  helperText={errors.message?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>สถานะ</InputLabel>
                  <Select {...field} label="สถานะ">
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />
            <Controller
              name="adminNote"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  multiline
                  minRows={3}
                  label="บันทึกภายในสำหรับแอดมิน"
                  error={!!errors.adminNote}
                  helperText={errors.adminNote?.message}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            ยกเลิก
          </Button>
          <LoadingButton variant="contained" loading={saving} onClick={save}>
            บันทึก
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
