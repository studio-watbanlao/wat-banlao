import type { ButtonProps } from '@mui/material/Button';

import { useCallback } from 'react';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';

import { useTranslate } from 'src/locales';

import { enqueueSnackbar } from 'src/components/snackbar';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  onClose?: () => void;
};

export function SignOutButton({ onClose, sx, ...other }: Props) {
  const { t } = useTranslate();

  const { logout } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await logout();

      onClose?.();
      window.location.replace(paths.auth.jwt.login);
    } catch (error) {
      console.error(error);
      enqueueSnackbar(t('errors.signOut', { defaultValue: 'ออกจากระบบไม่สำเร็จ' }), { variant: 'error' });
    }
  }, [logout, onClose, t]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} sx={sx} {...other}>
      {t('actions.signOut', { defaultValue: 'ออกจากระบบ' })}
    </Button>
  );
}
