import Box from '@mui/material/Box';

import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';

import { useOffSetTop } from 'src/hooks/use-off-set-top';
import { useResponsive } from 'src/hooks/use-responsive';

import { bgBlur } from 'src/theme/css';

import Logo from 'src/components/logo';

import { alpha, Container, Divider, IconButton, Typography } from '@mui/material';
import { _socials } from 'src/_mock';
import Iconify from 'src/components/iconify';
import HeaderShadow from '../common/header-shadow';
import { HEADER } from '../config-layout';
import { navConfig } from './config-navigation';
import NavDesktop from './nav/desktop';
import NavMobile from './nav/mobile';

const Header = () => {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');

  const offsetTop = useOffSetTop(HEADER.H_DESKTOP);

  return (
    <AppBar>
      <Toolbar
        disableGutters
        sx={{
          transition: theme.transitions.create(['height'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.shorter,
          }),
          ...(offsetTop && {
            ...bgBlur({
              color: theme.palette.background.default,
            }),
          }),
        }}
      >
        <Stack sx={{ width: '100%' }}>
          <Container
            sx={{
              height: 1,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              py: 2,
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
              <Typography
                variant={mdUp ? 'h3' : 'subtitle1'}
                color={theme.palette.primary.main}
                sx={{ ml: 1 }}
              >
                วัดบ้านเหล่า - สุขธัมมาราม
              </Typography>
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

            <Stack alignItems="center" direction={{ xs: 'row', md: 'row-reverse' }}>
              <Stack
                direction="row"
                alignItems={'center'}
                justifyContent={{ xs: 'center', md: 'flex-start' }}
              >
                {_socials.map((social) => (
                  <IconButton
                    key={social.name}
                    href={social.path}
                    target="_blank"
                    sx={{
                      '&:hover': {
                        bgcolor: alpha(social.color, 0.08),
                      },
                    }}
                  >
                    <Iconify color={social.color} icon={social.icon} />
                  </IconButton>
                ))}
              </Stack>

              {/* {mdUp && <LoginButton />} */}

              {!mdUp && (
                <NavMobile
                  data={navConfig}
                  slotProps={{
                    currentRole: 'user',
                  }}
                />
              )}
            </Stack>
          </Container>
          {/* <Divider /> */}

          {mdUp && (
            <Container
              sx={{
                height: '40px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {mdUp && (
                <NavDesktop
                  data={navConfig}
                  slotProps={{
                    currentRole: 'user',
                  }}
                />
              )}
              <Box sx={{ flexGrow: 1 }} />
            </Container>
          )}
          <Divider />
        </Stack>
      </Toolbar>

      {offsetTop && <HeaderShadow />}
    </AppBar>
  );
};

export default Header;
