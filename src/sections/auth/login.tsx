'use client';

import * as Yup from 'yup';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import GoogleSignInButton from './google-sign-in-button';

import { useRouter, useSearchParams } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { useAuthContext } from 'src/auth/hooks';
import { getPostLoginPath } from 'src/auth/post-login-path';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { getErrorMessage } from 'src/utils/error-message';
import Iconify from 'src/components/iconify';
import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const LoginView = () => {
  const { login, loginWithGoogle } = useAuthContext();

  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      const user = await login(data.email, data.password);
      router.replace(getPostLoginPath(user, returnTo || PATH_AFTER_LOGIN));
    } catch (error) {
      console.error(error);
      reset();
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
    <Stack sx={{ width: 1, minWidth: 0 }}>
      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={2} sx={{ mb: 5 }}>
          <Typography variant="h4">Sign in to Wat Ban lao</Typography>
        </Stack>

        <Stack spacing={2.5}>
          {!!errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <RHFTextField name="email" label="Email address" />

          <RHFTextField
            name="password"
            label="Password"
            type={password.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
            Forgot password?
          </Link>

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Login
          </LoadingButton>

          <Divider>OR</Divider>

          <GoogleSignInButton onCredential={handleGoogleCredential} />
        </Stack>
      </Form>
    </Stack>
  );
};
export default LoginView;
