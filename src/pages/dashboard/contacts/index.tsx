import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from 'src/utils/zod-resolver';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
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

const TABLE_HEAD = [
  { id: 'subject', label: 'ข้อความติดต่อ', minWidth: 380 },
  { id: 'sender', label: 'ผู้ส่ง', minWidth: 240 },
  { id: 'createdAt', label: 'วันที่ส่ง', width: 180 },
  { id: 'status', label: 'สถานะ', width: 150 },
  { id: '', label: '', width: 120 },
];

export default function ContactManagementPage() {
  const table = useTable({ defaultRowsPerPage: 10 });
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
  const pageContacts = filteredContacts.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
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
      table.onUpdatePageDeleteRow(pageContacts.length);
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
                onChange={(event) => {
                  table.onResetPage();
                  setStatusFilter(event.target.value as StatusFilter);
                }}
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
          <Card>
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 980 }}>
                  <TableHeadCustom headLabel={TABLE_HEAD} />
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={TABLE_HEAD.length} align="center">
                          <CircularProgress size={32} />
                        </TableCell>
                      </TableRow>
                    ) : (
                      pageContacts.map((contact) => {
                        const status = STATUS_META[contact.status];
                        return (
                          <TableRow hover key={contact.id}>
                            <TableCell>
                              <Typography variant="subtitle2">{contact.subject}</Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                                sx={{ display: 'block', maxWidth: 420 }}
                              >
                                {contact.message}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{contact.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {contact.email}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {fDateTime(contact.createdAt, 'dd/MM/yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                variant="soft"
                                label={status.label}
                                color={status.color}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="ดูและแก้ไข">
                                <IconButton onClick={() => openDetail(contact)}>
                                  <Iconify icon="solar:pen-bold" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="ลบ">
                                <LoadingButton
                                  color="error"
                                  loading={deletingId === contact.id}
                                  onClick={() => remove(contact)}
                                  sx={{ minWidth: 40, px: 1 }}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" />
                                </LoadingButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                    <TableNoData notFound={!loading && filteredContacts.length === 0} />
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
            <TablePaginationCustom
              count={filteredContacts.length}
              page={table.page}
              rowsPerPage={table.rowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              labelRowsPerPage="รายการต่อหน้า:"
              dense={table.dense}
              onChangeDense={table.onChangeDense}
            />
          </Card>
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
