'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'minimal-shared/hooks';

import { RiFacebookFill, RiInstagramLine } from 'src/components/remix-icon';
import { AccountPopover } from 'src/layouts/components/account-popover';
import { MenuButton } from 'src/layouts/components/menu-button';
import { SignInButton } from 'src/layouts/components/sign-in-button';
import { LayoutSection, MainSection } from 'src/layouts/core';
import { NavDesktop } from 'src/layouts/main/nav/desktop';
import { NavMobile } from 'src/layouts/main/nav/mobile';
import type { NavMainProps } from 'src/layouts/main/nav/types';
import { MainSchoolBrand, MainSchoolLogo } from 'src/layouts/main/school-brand';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

type Props = {
  children: React.ReactNode;
  navData: NavMainProps['data'];
  footerContent?: React.ReactNode;
};

const SOCIALS = [
  { label: 'Facebook', href: 'https://www.facebook.com', icon: RiFacebookFill },
  { label: 'Instagram', href: 'https://www.instagram.com', icon: RiInstagramLine },
] as const;

export function SerenePublicLayout({ children, navData, footerContent }: Props) {
  const menu = useBoolean();
  const { data: temple } = usePublicTemple();

  return (
    <LayoutSection
      sx={{ bgcolor: '#F8F7F2' }}
      headerSection={
        <Box
          component="header"
          sx={{
            top: 0,
            zIndex: 1100,
            position: 'sticky',
            bgcolor: 'rgba(248, 247, 242, 0.94)',
            backdropFilter: 'blur(12px)',
            borderTop: '4px solid',
            borderColor: 'primary.main',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
          }}
        >
          <Container
            maxWidth="xl"
            sx={{ height: { xs: 68, md: 86 }, display: 'flex', alignItems: 'center' }}
          >
            <Box sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}>
              <MenuButton onClick={menu.onTrue} aria-label="เปิดเมนู" />
              <NavMobile data={navData} open={menu.value} onClose={menu.onFalse} />
            </Box>
            <MainSchoolBrand compact />
            <Box sx={{ ml: 'auto', display: { xs: 'none', md: 'flex' }, alignSelf: 'stretch' }}>
              <NavDesktop data={navData} sx={{ '& ul': { gap: 3 } }} />
            </Box>
            <Box sx={{ ml: { xs: 'auto', md: 2 }, display: 'flex', alignItems: 'center' }}>
              <SignInButton />
              <AccountPopover />
            </Box>
          </Container>
        </Box>
      }
      footerSection={
        footerContent ?? (
          <Box component="footer" sx={{ mt: 'auto', color: 'common.white', bgcolor: '#25302B' }}>
            <Container maxWidth="xl" sx={{ py: { xs: 5, md: 7 } }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 4,
                  flexDirection: { xs: 'column', md: 'row' },
                  justifyContent: 'space-between',
                }}
              >
                <Box sx={{ maxWidth: 520 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MainSchoolLogo size={52} />
                    <Typography variant="h5">{temple?.name || 'เว็บไซต์วัด'}</Typography>
                  </Box>
                  <Typography sx={{ mt: 2, color: 'rgba(255,255,255,0.66)', lineHeight: 1.8 }}>
                    พื้นที่แห่งศรัทธา ความสงบ และการเรียนรู้พระธรรมสำหรับทุกคน
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {SOCIALS.map(({ label, href, icon: Icon }) => (
                    <IconButton
                      key={label}
                      component="a"
                      href={href}
                      target="_blank"
                      aria-label={label}
                      sx={{ color: 'common.white' }}
                    >
                      <Icon size={20} />
                    </IconButton>
                  ))}
                </Box>
              </Box>
              <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.14)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.58)' }}>
                © {new Date().getFullYear()} {temple?.name || 'เว็บไซต์วัด'}
              </Typography>
            </Container>
          </Box>
        )
      }
    >
      <MainSection sx={{ bgcolor: '#F8F7F2' }}>{children}</MainSection>
    </LayoutSection>
  );
}
