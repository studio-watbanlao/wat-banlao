'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Breakpoint } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useBoolean } from 'minimal-shared/hooks';
import { useMemo } from 'react';

import { LanguagePopover } from '../components/language-popover';
import { MenuButton } from '../components/menu-button';
import type { HeaderSectionProps, LayoutSectionProps, MainSectionProps } from '../core';
import { HeaderSection, LayoutSection, MainSection } from '../core';

import type { FooterProps } from './footer';
import { Footer, HomeFooter } from './footer';
import { NavDesktop } from './nav/desktop';
import { NavMobile } from './nav/mobile';
import { StudentBottomNav } from './nav/mobile/student-bottom-nav';
import type { NavMainProps } from './nav/types';
import { MainSchoolBrand } from './school-brand';
import { responsiveMainLayoutWidthSx } from './responsive-width';

import MataData from 'src/components/mata-data/mata-data';
import {
  RiArticleLine,
  RiBuildingLine,
  RiCalendarLine,
  RiFacebookFill,
  RiHome5Line,
  RiInstagramLine,
  RiUserStarLine,
} from 'src/components/remix-icon';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import { usePublicTenantKey } from 'src/hooks/use-public-tenant-key';
import { getPublicRouteModule, isBanlaoOnlyPublicRoute } from 'src/lib/temple-navigation';
import { languageOptions, useTranslate, useTranslatedMainNav } from 'src/locales';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { PublicPopupBanner } from 'src/sections/public-popup-banner';
import type { TempleNavigationItem } from 'src/types/temple-navigation';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/profile.php?id=100081342739858',
    color: '#1877F2',
    icon: RiFacebookFill,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/watbanlao.official',
    color: '#E1306C',
    icon: RiInstagramLine,
  },
] as const;

const navigationIcon = (itemKey: string) => {
  if (itemKey === 'home') return <RiHome5Line size={22} />;
  if (itemKey === 'festivals' || itemKey === 'activities') return <RiCalendarLine size={22} />;
  if (itemKey === 'masters') return <RiUserStarLine size={22} />;
  if (itemKey === 'articles') return <RiArticleLine size={22} />;
  return <RiBuildingLine size={22} />;
};

export type MainLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavMainProps['data'];
      mobileBottom?: boolean;
    };
    main?: MainSectionProps;
    footer?: FooterProps;
    footerContent?: React.ReactNode;
  };
};

function PublicSiteLoading({ failed = false }: { failed?: boolean }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{ height: { xs: 72, md: 96 }, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Container
          maxWidth={false}
          sx={{
            ...responsiveMainLayoutWidthSx,
            height: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Skeleton variant="circular" width={44} height={44} />
            <Skeleton variant="rounded" width={160} height={24} />
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {[88, 112, 96, 124].map((width) => (
              <Skeleton key={width} variant="rounded" width={width} height={20} />
            ))}
          </Box>
        </Container>
      </Box>

      <Box sx={{ minHeight: { xs: 560, md: 720 }, display: 'grid', placeItems: 'center', p: 3 }}>
        {failed ? (
          <Typography color="text.secondary" align="center">
            ไม่สามารถโหลดข้อมูลเว็บไซต์ได้ กรุณาลองรีเฟรชอีกครั้ง
          </Typography>
        ) : (
          <Container maxWidth={false} sx={responsiveMainLayoutWidthSx}>
            <Skeleton
              variant="rounded"
              animation="wave"
              sx={{ width: 1, height: { xs: 420, md: 600 }, borderRadius: 3 }}
            />
          </Container>
        )}
      </Box>
    </Box>
  );
}

function PublicRouteUnavailable() {
  return (
    <Container maxWidth={false} sx={{ ...responsiveMainLayoutWidthSx, py: { xs: 10, md: 16 } }}>
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        <RiBuildingLine size={48} />
        <Typography variant="h4">ไม่พบข้อมูลหรือบริการที่ร้องขอ</Typography>
        <Typography color="text.secondary">
          วัดนี้ยังไม่ได้เปิดใช้งานส่วนดังกล่าว หรือหน้านี้อาจไม่มีอยู่แล้ว
        </Typography>
      </Stack>
    </Container>
  );
}

export function MainLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: MainLayoutProps) {
  const { t } = useTranslate('navbar');
  const pathname = usePathname();
  const { data: publicTemple, isError: isPublicTempleError } = usePublicTemple();
  const tenantKey = usePublicTenantKey();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isHomePage = pathname === '/';

  const { data: publicNavigation } = useQuery({
    queryKey: ['public-navigation', tenantKey],
    queryFn: async () => {
      const [navigationResponse, pagesResponse] = await Promise.all([
        axios.get('/api/public/navigation'),
        axios.get('/api/public/pages', { params: { menu: true } }),
      ]);
      return {
        items: navigationResponse.data.items as TempleNavigationItem[],
        pages: pagesResponse.data.pages as TemplePage[],
      };
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const navigationItems = publicNavigation?.items || [];
  const customPages = publicNavigation?.pages || [];
  const managedNavData = useMemo(
    () =>
      navigationItems
        .filter((item) => !item.parentKey)
        .toSorted((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => {
          const childItems = navigationItems
            .filter((child) => child.parentKey === item.itemKey)
            .toSorted((a, b) => a.sortOrder - b.sortOrder)
            .map((child) => ({
              title: child.title,
              path: child.path,
              deepMatch: child.deepMatch,
            }));
          return {
            title: item.title,
            path: item.path,
            icon: navigationIcon(item.itemKey),
            deepMatch: item.deepMatch,
            children: childItems.length ? [{ subheader: '', items: childItems }] : undefined,
          };
        }),
    [navigationItems]
  );
  const sourceNavData = slotProps?.nav?.data ?? managedNavData;
  const rawNavData = useMemo(
    () => [
      ...sourceNavData,
      ...customPages.map((page) => ({
        title: page.title,
        path: `/${page.slug}`,
        icon: <RiArticleLine size={22} />,
        deepMatch: true,
      })),
    ],
    [customPages, sourceNavData]
  );
  const navData = useTranslatedMainNav(rawNavData);
  const desktopNavData = useMemo(
    () => navData.filter((item) => item.path !== paths.contact),
    [navData]
  );
  const mobileBottom = slotProps?.nav?.mobileBottom ?? false;
  const requiredModule = getPublicRouteModule(pathname);
  const isRouteUnavailable = Boolean(
    (requiredModule && publicTemple?.modules?.[requiredModule] === false) ||
    (isBanlaoOnlyPublicRoute(pathname) && publicTemple?.slug !== 'wat-banlao')
  );
  const publicContent = (
    <>
      <MataData />
      <PublicPopupBanner />
      {isRouteUnavailable ? <PublicRouteUnavailable /> : children}
    </>
  );

  // Never paint the generic/classic tenant while the real domain configuration
  // is unresolved. The home page normally receives this data during SSR; this
  // neutral state protects direct visits to other public routes as well.
  if (!publicTemple) return <PublicSiteLoading failed={isPublicTempleError} />;

  const renderHeader = () => {
    const customHeaderSlots = slotProps?.header?.slots;
    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Box
          sx={(theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { display: 'block' },
          })}
        >
          <Container
            maxWidth={false}
            sx={{
              ...responsiveMainLayoutWidthSx,
              height: 78,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <MainSchoolBrand />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Button
                component={RouterLink}
                href={paths.contact}
                size="small"
                sx={{
                  mr: 0.5,
                  px: 1,
                  fontWeight: pathname === paths.contact ? 700 : 400,
                  color: pathname === paths.contact ? 'primary.main' : 'text.secondary',
                }}
              >
                ติดต่อสอบถาม
              </Button>

              {SOCIAL_LINKS.map(({ label, href, color, icon: Icon }) => (
                <IconButton
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  sx={{ color, p: 0.75 }}
                >
                  <Icon size={18} />
                </IconButton>
              ))}
            </Box>
          </Container>
        </Box>
      ),
      leftArea: (
        <>
          {!mobileBottom && (
            <>
              {/** @slot Nav mobile */}
              <MenuButton
                onClick={onOpen}
                aria-label={t('เปิดเมนู')}
                sx={(theme) => ({
                  mr: 1,
                  ml: -1,
                  [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                })}
              />
              <NavMobile data={navData} open={open} onClose={onClose} />
            </>
          )}

          {/** @slot Logo / custom brand */}
          {customHeaderSlots?.leftArea ?? <MainSchoolBrand compact />}
        </>
      ),
      centerArea: null,
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {/** @slot Settings button */}
          {/* <SettingsButton /> */}

          {/** @slot Language popover */}
          <LanguagePopover showTranslateIcon data={languageOptions} />
        </Box>
      ),
      bottomArea: (
        <Box
          sx={(theme) => ({
            display: 'none',
            borderBottom: `1px solid ${theme.vars.palette.divider}`,
            [theme.breakpoints.up(layoutQuery)]: { display: 'block' },
          })}
        >
          <Container
            maxWidth={false}
            sx={{
              ...responsiveMainLayoutWidthSx,
              height: 46,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'start',
            }}
          >
            <NavDesktop data={desktopNavData} />
          </Container>
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...customHeaderSlots, leftArea: headerSlots.leftArea }}
        slotProps={{
          ...slotProps?.header?.slotProps,
          container: {
            ...slotProps?.header?.slotProps?.container,
            sx: [
              (theme) => ({
                borderBottom: `1px solid ${theme.vars.palette.divider}`,
                [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
              }),
              ...(Array.isArray(slotProps?.header?.slotProps?.container?.sx)
                ? slotProps.header.slotProps.container.sx
                : [slotProps?.header?.slotProps?.container?.sx]),
            ],
          },
        }}
        disableElevation
        sx={[
          (theme) => ({
            '--color': theme.vars.palette.text.primary,
            '--header-accent-color': '#5A3A29',
            '--header-nav-color': '#343434',
            color: 'text.primary',
            bgcolor: 'common.white',
          }),
          ...(Array.isArray(slotProps?.header?.sx) ? slotProps.header.sx : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const footerSx = [
    ...(Array.isArray(slotProps?.footer?.sx) ? slotProps.footer.sx : [slotProps?.footer?.sx]),
    mobileBottom && { display: { xs: 'none', md: 'block' } },
  ];

  const renderFooter = () => {
    if (slotProps?.footerContent) return slotProps.footerContent;
    return isHomePage ? (
      <HomeFooter sx={footerSx} />
    ) : (
      <Footer sx={footerSx} layoutQuery={layoutQuery} />
    );
  };

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        {
          ...responsiveMainLayoutWidthSx,
          boxSizing: 'border-box',
        },
        ...(Array.isArray(slotProps?.main?.sx) ? slotProps.main.sx : [slotProps?.main?.sx]),
        mobileBottom && {
          '--student-bottom-nav-height': '66px',
          pb: {
            xs: 'calc(var(--student-bottom-nav-height) + max(env(safe-area-inset-bottom), 0px) + 12px)',
            md: 0,
          },
        },
      ]}
    >
      {publicContent}
    </MainSection>
  );

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={cssVars}
      sx={sx}
    >
      {renderMain()}
      {mobileBottom && <StudentBottomNav data={navData} />}
    </LayoutSection>
  );
}
