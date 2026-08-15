'use client';

import type { Theme, CSSObject, Breakpoint } from '@mui/material/styles';
import { merge } from 'es-toolkit';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { alpha } from '@mui/material/styles';

import type { MainSectionProps, HeaderSectionProps, LayoutSectionProps } from '../core';
import { LanguagePopover } from '../components/language-popover';
import { MainSection, LayoutSection, HeaderSection } from '../core';

import { AuthCenteredContent } from './content';
import type { AuthCenteredContentProps } from './content';

import { Logo } from 'src/components/logo';
import Iconify from 'src/components/iconify';
import { languageOptions } from 'src/locales';
import { usePublicTemple } from 'src/hooks/use-public-temple';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type AuthCenteredLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
    content?: AuthCenteredContentProps;
  };
};

export function AuthCenteredLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'md',
}: AuthCenteredLayoutProps) {
  const { data: temple, isLoading: isTempleLoading } = usePublicTemple();
  const loginBackgroundUrl = isTempleLoading ? '' : temple?.branding.loginBackgroundUrl || '';

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: 'xl',
        sx: { px: { xs: 1.5, sm: 3 } },
      },
    };
    const customHeaderSlots = slotProps?.header?.slots;

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Logo */}
          {customHeaderSlots?.leftArea ??
            (isTempleLoading ? (
              <Skeleton variant="circular" width={40} height={40} />
            ) : temple?.branding.logoUrl ? (
              <Logo src={temple.branding.logoUrl} alt={temple.name} />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '50%',
                  color: 'primary.main',
                  bgcolor: 'background.paper',
                }}
              >
                <Iconify icon="solar:buildings-2-linear" width={24} />
              </Box>
            ))}
        </>
      ),
      rightArea: (
        <Box
          sx={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: { xs: 0.25, sm: 0.5 } }}
        >
          <LanguagePopover
            showTranslateIcon
            data={languageOptions}
            sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}
          />

          {/** @slot Settings button */}
          {/* <SettingsButton
            aria-label="ตั้งค่าการแสดงผล"
            sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 } }}
          /> */}
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...customHeaderSlots, leftArea: headerSlots.leftArea }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={[
          { position: 'fixed', color: 'text.primary' },
          ...(Array.isArray(slotProps?.header?.sx) ? slotProps.header.sx : [slotProps?.header?.sx]),
        ]}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => (
    <MainSection
      {...slotProps?.main}
      sx={[
        (theme) => ({
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100dvh',
          p: theme.spacing(10, 2),
          [theme.breakpoints.up(layoutQuery)]: {
            p: theme.spacing(10, 0, 10, 0),
          },
        }),
        ...(Array.isArray(slotProps?.main?.sx) ? slotProps.main.sx : [slotProps?.main?.sx]),
      ]}
    >
      <AuthCenteredContent {...slotProps?.content}>{children}</AuthCenteredContent>
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
      cssVars={{ '--layout-auth-content-width': '420px', ...cssVars }}
      sx={[
        (theme) => ({
          position: 'relative',
          '&::before': backgroundStyles(theme, loginBackgroundUrl),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}

// ----------------------------------------------------------------------

const backgroundStyles = (theme: Theme, imageUrl: string): CSSObject => ({
  backgroundColor: theme.palette.primary.lighter,
  backgroundImage: imageUrl
    ? `linear-gradient(135deg, ${alpha(theme.palette.common.white, 0.76)}, ${alpha(
        theme.palette.primary.lighter,
        0.5
      )}), url(${imageUrl})`
    : `linear-gradient(135deg, ${theme.palette.common.white}, ${theme.palette.primary.lighter})`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  zIndex: 1,
  width: '100%',
  height: '100%',
  content: "''",
  position: 'fixed',
  inset: 0,
  ...theme.applyStyles('dark', {
    backgroundImage: imageUrl
      ? `linear-gradient(135deg, ${alpha(theme.palette.grey[900], 0.82)}, ${alpha(
          theme.palette.primary.darker,
          0.72
        )}), url(${imageUrl})`
      : `linear-gradient(135deg, ${theme.palette.grey[900]}, ${theme.palette.primary.darker})`,
  }),
});
