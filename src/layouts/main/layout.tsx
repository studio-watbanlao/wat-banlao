'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import type { Breakpoint } from '@mui/material/styles';
import { useBoolean } from 'minimal-shared/hooks';

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

import { RiFacebookFill, RiInstagramLine } from 'src/components/remix-icon';
import { languageOptions, useTranslate, useTranslatedMainNav } from 'src/locales';
import { usePathname } from 'src/routes/hooks';

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

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isHomePage = pathname === '/';

  const rawNavData = slotProps?.nav?.data ?? mainNavData;
  const navData = useTranslatedMainNav(rawNavData);
  const mobileBottom = slotProps?.nav?.mobileBottom ?? false;

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
            maxWidth="lg"
            sx={{
              height: 78,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <MainSchoolBrand />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
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
            maxWidth="lg"
            sx={{
              height: 46,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'start',
            }}
          >
            <NavDesktop data={navData} />
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
      {children}
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
