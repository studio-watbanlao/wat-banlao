import { useEffect } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';
import AuthLayoutCompact from 'src/layouts/auth/compact';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { authenticated, loading, logout, user } = useAuthContext();

  useEffect(() => {
    if (!loading && !authenticated) router.replace(paths.auth.jwt.login);
    if (['admin', 'super_admin'].includes(user?.role)) router.replace(paths.dashboard.root);
  }, [authenticated, loading, router, user?.role]);

  const handleLogout = async () => {
    await logout();
    router.replace(paths.auth.jwt.login);
  };

  return (
    <AuthLayoutCompact>
      <Stack spacing={3} sx={{ minWidth: 320, textAlign: 'center' }}>
        <Typography variant="h4">รอการอนุมัติสิทธิ์</Typography>
        <Alert severity="info">
          บัญชี {user?.email} เข้าสู่ระบบสำเร็จแล้ว แต่ยังไม่สามารถเข้า Admin UI ได้ กรุณารอ Super
          Admin กำหนด role เป็น Admin
        </Alert>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="center">
          <LoadingButton variant="contained" onClick={() => window.location.reload()}>
            ตรวจสอบสิทธิ์อีกครั้ง
          </LoadingButton>
          <LoadingButton variant="outlined" color="inherit" onClick={handleLogout}>
            ออกจากระบบ
          </LoadingButton>
        </Stack>
      </Stack>
    </AuthLayoutCompact>
  );
}
