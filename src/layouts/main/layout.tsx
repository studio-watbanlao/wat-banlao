'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import type { Breakpoint } from '@mui/material/styles';
import { useQuery } from '@tanstack/react-query';
import { useBoolean } from 'minimal-shared/hooks';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { MenuButton } from '../components/menu-button';
import { SignInButton } from '../components/sign-in-button';
import type { HeaderSectionProps, LayoutSectionProps, MainSectionProps } from '../core';
import { HeaderSection, LayoutSection, MainSection } from '../core';
import { navData as mainNavData } from '../nav-config-main';

import type { FooterProps } from './footer';
import { Footer, HomeFooter } from './footer';
import { NavDesktop } from './nav/desktop';
import { NavMobile } from './nav/mobile';
import { StudentBottomNav } from './nav/mobile/student-bottom-nav';
import type { NavMainProps } from './nav/types';
import { MainSchoolBrand } from './school-brand';

import MataData from 'src/components/mata-data/mata-data';
import { RiArticleLine, RiFacebookFill, RiInstagramLine } from 'src/components/remix-icon';
import { languageOptions, useTranslate, useTranslatedMainNav } from 'src/locales';
import { resolvePublicTemplateKey } from 'src/public-templates/catalog';
import { PublicPopupBanner } from 'src/public-templates/public-popup-banner';
import { usePublicTemple } from 'src/public-templates/use-public-temple';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';

const SerenePublicLayout = dynamic(() =>
  import('src/public-templates/serene/serene-public-layout').then(
    (module) => module.SerenePublicLayout
  )
);

const Template1PublicLayout = dynamic(() =>
  import('src/public-templates/template-1/template-1-public-layout').then(
    (module) => module.Template1PublicLayout
  )
);

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

export function MainLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: MainLayoutProps) {
  const { t } = useTranslate('navbar');
  const pathname = usePathname();
  const { data: publicTemple } = usePublicTemple();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isHomePage = pathname === '/';

  const { data: customPages = [] } = useQuery({
    queryKey: ['public-menu-pages'],
    queryFn: async () => {
      const response = await axios.get('/api/public/pages', { params: { menu: true } });
      return response.data.pages as TemplePage[];
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const sourceNavData = slotProps?.nav?.data ?? mainNavData;
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
  const publicTemplate = resolvePublicTemplateKey(publicTemple?.branding.publicTemplate);
  const publicContent = (
    <>
      <MataData />
      <PublicPopupBanner />
      {children}
    </>
  );

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
            maxWidth="xl"
            sx={{
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

          {/** @slot Sign in button */}
          <SignInButton />
          <AccountPopover />

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
            maxWidth="xl"
            sx={{
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

  if (publicTemplate === 'serene') {
    return (
      <SerenePublicLayout navData={navData} footerContent={slotProps?.footerContent}>
        {publicContent}
      </SerenePublicLayout>
    );
  }

  if (publicTemplate === 'template-1') {
    return (
      <Template1PublicLayout navData={navData} footerContent={slotProps?.footerContent}>
        {publicContent}
      </Template1PublicLayout>
    );
  }

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
