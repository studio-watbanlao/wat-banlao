'use client';

import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import AuthLayoutCompact from 'src/layouts/auth/compact';
import Iconify from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import axios from 'src/utils/axios';
import { getErrorMessage } from 'src/utils/error-message';

type InviteSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export default function InviteAcceptancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showPassword = useBoolean();
  const [session, setSession] = useState<InviteSession | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = hash.get('access_token') || '';
    const refreshToken = hash.get('refresh_token') || '';
    if (accessToken && refreshToken) {
      setSession({
        accessToken,
        refreshToken,
        expiresIn: Number(hash.get('expires_in')) || 3600,
      });
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    } else {
      setError(hash.get('error_description') || 'ลิงก์คำเชิญไม่ถูกต้องหรือหมดอายุแล้ว');
    }
  }, []);

  const accept = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!session) return;
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setError('ยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await axios.post('/api/auth/accept-invite', {
        ...session,
        password,
        invitation: searchParams.get('invitation') || '',
      });
      window.location.assign('/dashboard');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthLayoutCompact>
      <Stack component="form" spacing={3} onSubmit={accept}>
        <Stack spacing={1}>
          <Typography variant="h4">ตอบรับคำเชิญเข้าระบบวัด</Typography>
          <Typography variant="body2" color="text.secondary">
            ตั้งรหัสผ่านสำหรับเข้าสู่ระบบ หลังยืนยันแล้วจะเห็นเฉพาะวัดและเมนูที่ได้รับสิทธิ์
          </Typography>
        </Stack>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="รหัสผ่านใหม่"
          type={showPassword.value ? 'text' : 'password'}
          value={password}
          autoComplete="new-password"
          onChange={(event) => setPassword(event.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={showPassword.onToggle} edge="end" aria-label="แสดงหรือซ่อนรหัสผ่าน">
                    <Iconify icon={showPassword.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          label="ยืนยันรหัสผ่าน"
          type={showPassword.value ? 'text' : 'password'}
          value={confirmPassword}
          autoComplete="new-password"
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
        <LoadingButton type="submit" variant="contained" size="large" loading={saving} disabled={!session}>
          ยืนยันและเข้าสู่ระบบ
        </LoadingButton>
        {!session ? (
          <LoadingButton color="inherit" onClick={() => router.push('/auth/login')}>
            กลับหน้าเข้าสู่ระบบ
          </LoadingButton>
        ) : null}
      </Stack>
    </AuthLayoutCompact>
  );
}
