'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useBoolean } from 'minimal-shared/hooks';

import { MenuButton } from 'src/layouts/components/menu-button';
import { LayoutSection, MainSection } from 'src/layouts/core';
import { MainSchoolBrand, MainSchoolLogo } from 'src/layouts/main/school-brand';
import { NavDesktop } from 'src/layouts/main/nav/desktop';
import { NavMobile } from 'src/layouts/main/nav/mobile';
import type { NavMainProps } from 'src/layouts/main/nav/types';
import { RiFacebookFill, RiInstagramLine } from 'src/components/remix-icon';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

type Props = {
  children: React.ReactNode;
  navData: NavMainProps['data'];
  footerContent?: React.ReactNode;
};

const SOCIAL_LINKS = [
  { label: 'Facebook', href: 'https://www.facebook.com', icon: RiFacebookFill },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: RiInstagramLine },
] as const;

const contactText = (contact: Record<string, unknown> | undefined, key: string) => {
  const value = contact?.[key];
  return typeof value === 'string' ? value : '';
};

export function Template1PublicLayout({ children, navData, footerContent }: Props) {
  const mobileMenu = useBoolean();
  const { data: temple } = usePublicTemple();
  const contact = temple?.branding.contact;
  const address = contactText(contact, 'address');
  const phone = contactText(contact, 'phone');
  const email = contactText(contact, 'email');

  return (
    <LayoutSection
      sx={{ bgcolor: '#F7F0DF' }}
      headerSection={
        <Box
          component="header"
          sx={(theme) => ({
            top: 0,
            zIndex: 1100,
            position: 'sticky',
            color: 'common.white',
            bgcolor: alpha('#10291F', 0.94),
            backdropFilter: 'blur(16px)',
            borderTop: '3px solid',
            borderColor: 'secondary.main',
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.14)}`,
          })}
        >
          <Container
            maxWidth="xl"
            sx={{ minHeight: { xs: 70, md: 88 }, display: 'flex', alignItems: 'center' }}
          >
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
              <MenuButton onClick={mobileMenu.onTrue} aria-label="เปิดเมนู" />
              <NavMobile data={navData} open={mobileMenu.value} onClose={mobileMenu.onFalse} />
            </Box>

            <Box
              sx={{
                '& a, & p, & span': { color: 'common.white' },
                '& img': { filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.24))' },
              }}
            >
              <MainSchoolBrand compact />
            </Box>

            <Box
              sx={{
                ml: 'auto',
                display: { xs: 'none', md: 'flex' },
                alignSelf: 'stretch',
                '--header-nav-color': 'rgba(255,255,255,0.88)',
                '--header-accent-color': 'var(--palette-secondary-main)',
                '--nav-dropdown-bg': '#102F24',
                '--nav-dropdown-color': '#FFF8E8',
                '--nav-dropdown-border-color': 'rgba(242,198,109,0.3)',
                '--nav-dropdown-shadow': '0 22px 55px rgba(2,18,12,0.36)',
                '--nav-dropdown-dot-color': 'rgba(242,198,109,0.52)',
                '--nav-dropdown-item-color': 'rgba(255,248,232,0.82)',
                '--nav-dropdown-item-hover-color': '#F2C66D',
                '--nav-dropdown-item-hover-bg': 'rgba(242,198,109,0.12)',
                '--nav-dropdown-item-active-color': '#F2C66D',
                '--nav-dropdown-item-active-bg': 'rgba(242,198,109,0.16)',
              }}
            >
              <NavDesktop data={navData} sx={{ '& ul': { gap: 2 } }} />
            </Box>
          </Container>
        </Box>
      }
      footerSection={
        footerContent ?? (
          <Box component="footer" sx={{ mt: 'auto', color: 'common.white', bgcolor: '#0A1E17' }}>
            <Box sx={{ height: 3, bgcolor: 'secondary.main' }} />
            <Container maxWidth="xl" sx={{ py: { xs: 5, md: 8 } }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={{ xs: 4, md: 8 }}
                justifyContent="space-between"
              >
                <Box sx={{ maxWidth: 560 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <MainSchoolLogo size={58} />
                    <Typography variant="h5">{temple?.name || 'เว็บไซต์วัด'}</Typography>
                  </Stack>
                  <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.66)', lineHeight: 1.9 }}>
                    ศูนย์รวมแห่งศรัทธา การเรียนรู้พระธรรม และการสืบสานวัฒนธรรมของชุมชน
                  </Typography>
                  {address ? (
                    <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,0.66)' }}>
                      {address}
                    </Typography>
                  ) : null}
                </Box>

                <Box sx={{ minWidth: { md: 260 } }}>
                  <Typography variant="subtitle1" sx={{ color: 'secondary.main' }}>
                    ติดต่อวัด
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 1.5, color: 'rgba(255,255,255,0.7)' }}>
                    <Typography>{phone || 'ดูข้อมูลการติดต่อได้ที่หน้าติดต่อวัด'}</Typography>
                    {email ? <Typography>{email}</Typography> : null}
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 2 }}>
                    {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                      <IconButton
                        key={label}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        sx={{ color: 'common.white', '&:hover': { color: 'secondary.main' } }}
                      >
                        <Icon size={20} />
                      </IconButton>
                    ))}
                  </Stack>
                </Box>
              </Stack>

              <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.14)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.54)' }}>
                © {new Date().getFullYear()} {temple?.name || 'เว็บไซต์วัด'} สงวนลิขสิทธิ์
              </Typography>
            </Container>
          </Box>
        )
      }
    >
      <MainSection sx={{ bgcolor: '#F7F0DF' }}>{children}</MainSection>
    </LayoutSection>
  );
}
