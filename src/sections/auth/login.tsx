'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import GoogleSignInButton from './google-sign-in-button';

import { useAuthContext } from 'src/auth/hooks';
import { getPostLoginPath } from 'src/auth/post-login-path';
import { Form, RHFTextField } from 'src/components/hook-form';
import Iconify from 'src/components/iconify';
import { Logo } from 'src/components/logo';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMainSchoolBrand } from 'src/layouts/main/school-brand';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { getErrorMessage } from 'src/utils/error-message';

// ----------------------------------------------------------------------

const LoginSchema = Yup.object().shape({
  email: Yup.string().required('กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: Yup.string().required('กรุณากรอกรหัสผ่าน'),
});

const defaultValues = {
  email: '',
  password: '',
};

const LoginView = () => {
  const { login, loginWithGoogle } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const password = useBoolean();
  const { school, isLoading: isTempleLoading } = useMainSchoolBrand();
  const [errorMsg, setErrorMsg] = useState('');
  const returnTo = searchParams.get('returnTo');
  const loginBackgroundUrl = isTempleLoading ? '' : school.login_background_url || '';

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      const user = await login(data.email, data.password);
      router.replace(getPostLoginPath(user, returnTo || PATH_AFTER_LOGIN));
    } catch (error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error, 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่'));
    }
  });

  const handleGoogleCredential = async (credential: string) => {
    try {
      setErrorMsg('');
      const user = await loginWithGoogle(credential);
      router.replace(getPostLoginPath(user, returnTo || PATH_AFTER_LOGIN));
    } catch (error) {
      console.error(error);
      setErrorMsg(getErrorMessage(error, 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'));
    }
  };

  return (
    <Box
      sx={{
        width: 1,
        minWidth: 0,
        display: 'grid',
        minHeight: { xs: 'auto', md: 620 },
        gridTemplateColumns: { xs: '1fr', md: '1.08fr 0.92fr' },
      }}
    >
      <Box
        sx={{
          m: { xs: 0, md: 0.5 },
          minHeight: { xs: 210, sm: 270, md: 'auto' },
          overflow: 'hidden',
          position: 'relative',
          borderRadius: { xs: 2, md: 3.5 },
          color: 'common.white',
          backgroundColor: 'primary.darker',
          backgroundImage: (theme) =>
            loginBackgroundUrl
              ? `linear-gradient(180deg, rgba(27, 16, 11, 0.08) 10%, ${theme.palette.primary.darker}F2 100%), url(${loginBackgroundUrl})`
              : `linear-gradient(145deg, ${theme.palette.primary.dark}, ${theme.palette.primary.darker})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::before': {
            content: "''",
            top: -70,
            right: -70,
            width: 190,
            height: 190,
            opacity: 0.2,
            position: 'absolute',
            borderRadius: '50%',
            border: '1px solid currentColor',
          },
        }}
      >
        <Stack
          sx={{
            inset: 0,
            p: { xs: 3, sm: 4, md: 5 },
            position: 'absolute',
            justifyContent: 'flex-end',
          }}
        >
          <Typography
            variant="overline"
            sx={{ mb: 1, color: 'rgba(255,255,255,0.72)', letterSpacing: 1.2 }}
          >
            ระบบจัดการเว็บไซต์วัด
          </Typography>
          <Typography variant="h4" sx={{ maxWidth: 420, fontSize: { xs: 27, sm: 34, md: 36 } }}>
            จัดการข้อมูลวัดได้ในที่เดียว
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mt: 1.5,
              maxWidth: 430,
              color: 'rgba(255,255,255,0.76)',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            อัปเดตกิจกรรม บทความ เทศกาล และข้อมูลสำคัญของวัดได้อย่างสะดวก
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          p: { xs: 3, sm: 5, md: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Stack sx={{ width: 1, maxWidth: 380, minWidth: 0 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
            {isTempleLoading ? (
              <>
                <Skeleton variant="circular" width={48} height={48} sx={{ flexShrink: 0 }} />
                <Stack spacing={0.5} sx={{ flex: 1 }}>
                  <Skeleton width={180} height={24} />
                  <Skeleton width={220} height={18} />
                </Stack>
              </>
            ) : (
              <>
                {school.logo_url ? (
                  <Logo
                    disabledLink
                    src={school.logo_url}
                    alt={school.name}
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      cursor: 'default',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      color: 'primary.main',
                      bgcolor: 'background.neutral',
                    }}
                  >
                    <Iconify icon="solar:buildings-2-linear" width={26} />
                  </Box>
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" noWrap>
                    {school.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    ระบบสำหรับผู้ดูแลและสมาชิกวัด
                  </Typography>
                </Box>
              </>
            )}
          </Stack>

          <Typography variant="h4">เข้าสู่ระบบ</Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 4, color: 'text.secondary' }}>
            กรุณาเลือกวิธีเข้าสู่ระบบเพื่อจัดการข้อมูลของวัด
          </Typography>

          <Form methods={methods} onSubmit={onSubmit}>
            <Stack spacing={2.5}>
              {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

              <GoogleSignInButton onCredential={handleGoogleCredential} />

              <Divider sx={{ color: 'text.disabled', typography: 'caption' }}>
                หรือเข้าสู่ระบบด้วยอีเมล
              </Divider>

              <RHFTextField
                name="email"
                label="อีเมล"
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:letter-linear" width={21} />
                    </InputAdornment>
                  ),
                }}
              />

              <RHFTextField
                name="password"
                label="รหัสผ่าน"
                autoComplete="current-password"
                type={password.value ? 'text' : 'password'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:lock-password-linear" width={21} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        edge="end"
                        onClick={password.onToggle}
                        aria-label={password.value ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                      >
                        <Iconify
                          icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <LoadingButton
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                loading={isSubmitting}
                sx={{ minHeight: 48 }}
              >
                เข้าสู่ระบบ
              </LoadingButton>
            </Stack>
          </Form>
        </Stack>
      </Box>
    </Box>
  );
};

export default LoginView;
