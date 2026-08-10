import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';

import { useOffSetTop } from 'src/hooks/use-off-set-top';

import { bgBlur } from 'src/theme/css';

import Logo from 'src/components/logo';

import { Typography } from '@mui/material';
import { HEADER } from '../config-layout';
import HeaderShadow from './header-shadow';
import SettingsButton from './settings-button';

// ----------------------------------------------------------------------

export default function HeaderSimple() {
  const theme = useTheme();

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar>
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          height: {
            xs: HEADER.H_MOBILE,
            md: HEADER.H_DESKTOP,
          },
          transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(offsetTop && {
            ...bgBlur({
              color: theme.palette.background.default,
            }),
            height: {
              md: HEADER.H_DESKTOP_OFFSET,
            },
          }),
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Logo />
          <Typography variant="h3" color={theme.palette.primary.main} sx={{ ml: 1 }}>
            วัดบ้านเหล่า - สุขธัมมาราม
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <SettingsButton />

          {/* <Link
            href={paths.faqs}
            component={RouterLink}
            color="inherit"
            sx={{ typography: "subtitle2" }}
          >
            Need help?
          </Link> */}
        </Stack>
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  );
}
