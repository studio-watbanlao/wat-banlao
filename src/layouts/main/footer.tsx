'use client';

import type { Breakpoint } from '@mui/material/styles';
import { varAlpha } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { MainSchoolLogo, useMainSchoolBrand } from './school-brand';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { CONFIG } from 'src/config-global';
import { useTranslate } from 'src/locales';
import {
  RiHome5Line,
  RiMailLine,
  RiArticleLine,
  RiCalendarLine,
} from 'src/components/remix-icon';


// ----------------------------------------------------------------------

const QUICK_LINKS = [
  { label: 'หน้าหลัก', href: '/', icon: <RiHome5Line size={18} /> },
  { label: 'ประวัติวัดบ้านเหล่า', href: paths.banlao.history, icon: <RiArticleLine size={18} /> },
  { label: 'กิจกรรมต่าง ๆ', href: paths.activity.root, icon: <RiCalendarLine size={18} /> },
  { label: 'ติดต่อสอบถาม', href: paths.contact, icon: <RiMailLine size={18} /> },
] as const;

const FooterRoot = styled('footer')(({ theme }) => ({
  marginTop: 'auto',
  flexShrink: 0,
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: theme.vars.palette.background.default,
}));

export type FooterProps = React.ComponentProps<typeof FooterRoot>;

export function Footer({
  sx,
  layoutQuery = 'md',
  ...other
}: FooterProps & { layoutQuery?: Breakpoint }) {
  return (
    <FooterRoot sx={sx} {...other}>
      <Container sx={{ position: 'relative', py: { xs: 4, md: 5 } }}>
        <Box
          sx={(theme) => ({
            gap: 3,
            display: 'flex',
            textAlign: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            [theme.breakpoints.up(layoutQuery)]: {
              textAlign: 'left',
              alignItems: 'flex-start',
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          })}
        >
          <BrandSummary />
          <QuickLinks layoutQuery={layoutQuery} />
        </Box>

        <FooterBottom />
      </Container>
    </FooterRoot>
  );
}

// ----------------------------------------------------------------------

export function HomeFooter({ sx, ...other }: FooterProps) {
  return (
    <FooterRoot sx={sx} {...other}>
      <Container sx={{ position: 'relative', py: { xs: 3.5, md: 4.5 } }}>
        <Box
          sx={{
            gap: 3,
            display: 'flex',
            textAlign: { xs: 'center', md: 'left' },
            alignItems: { xs: 'center', md: 'flex-start' },
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
          }}
        >
          <BrandSummary />
          <QuickLinks layoutQuery="md" />
        </Box>

        <FooterBottom />
      </Container>
    </FooterRoot>
  );
}

function BrandSummary() {
  const { school } = useMainSchoolBrand();

  return (
    <Box sx={{ maxWidth: 390 }}>
      <Box
        sx={{
          gap: 1.25,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-start' },
        }}
      >
        <MainSchoolLogo size={48} />
        <Box>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>
            {school?.name ?? 'วัดบ้านเหล่า'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
            เว็บไซต์อย่างเป็นทางการ
          </Typography>
        </Box>
      </Box>
      <Typography variant="body2" sx={{ mt: 1.75, color: 'text.secondary', lineHeight: 1.75 }}>
        ศูนย์รวมศรัทธา ประเพณี และวัฒนธรรมของชุมชนบ้านเหล่า จังหวัดมหาสารคาม
      </Typography>
    </Box>
  );
}

function QuickLinks({ layoutQuery }: { layoutQuery: Breakpoint }) {
  const { t } = useTranslate('navbar');
  const { t: tCommon } = useTranslate();

  return (
    <Box component="nav" aria-label={tCommon('navigation.footerLinks')}>
      <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 0.8 }}>
        {t('ทางลัด')}
      </Typography>
      <Box
        sx={(theme) => ({
          gap: 1,
          mt: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          [theme.breakpoints.up(layoutQuery)]: { minWidth: 340 },
        })}
      >
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            component={RouterLink}
            underline="none"
            sx={(theme) => ({
              gap: 0.75,
              px: 1.5,
              py: 1,
              display: 'flex',
              borderRadius: 1.5,
              color: 'text.secondary',
              alignItems: 'center',
              typography: 'body2',
              border: `1px solid ${theme.vars.palette.divider}`,
              bgcolor: varAlpha(theme.vars.palette.background.paperChannel, 0.72),
              transition: theme.transitions.create(['color', 'border-color', 'background-color']),
              '&:hover': {
                color: 'primary.darker',
                borderColor: 'primary.main',
                bgcolor: 'primary.lighter',
              },
            })}
          >
            {item.icon}
            {t(item.label, { defaultValue: item.label })}
          </Link>
        ))}
      </Box>
    </Box>
  );
}

function FooterBottom() {
  const year = new Date().getFullYear();
  const { school } = useMainSchoolBrand();

  return (
    <>
      <Divider
        sx={{
          my: 3,
          left: '50%',
          width: '100vw',
          position: 'relative',
          transform: 'translateX(-50%)',
        }}
      />
      <Box
        sx={{
          gap: 1,
          display: 'flex',
          alignItems: 'center',
          color: 'text.secondary',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="caption">
          © {year} {school?.name ?? 'เว็บไซต์วัด'}
        </Typography>
        <Typography variant="caption">
          เวอร์ชัน {CONFIG.appVersion}
        </Typography>
      </Box>
    </>
  );
}
