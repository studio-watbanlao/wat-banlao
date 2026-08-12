'use client';

import type { Theme, ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';
import { merge } from 'es-toolkit';
import { useEffect, useMemo } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { useColorScheme, ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';
import { createTheme } from './create-theme';
import { createTemplePalette, themeConfig } from './theme-config';
import { Rtl } from './with-settings/right-to-left';

import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/auth/hooks';
import type { TempleAccess } from 'src/types/temple';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps<Theme>> & {
  themeOverrides?: ThemeOptions;
};

const PRIMARY_COLOR_MAP = {
  default: 'default',
  cyan: 'preset1',
  purple: 'preset2',
  blue: 'preset3',
  orange: 'preset4',
  red: 'preset5',
} as const;

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  const settings = useSettingsContext();
  const { currentLang } = useLocales();
  const { user } = useAuthContext();

  const accesses = (user?.templeAccesses || []) as TempleAccess[];
  const currentAccess =
    accesses.find((access) => access.temple.id === user?.currentTempleId) || accesses[0];

  const { data: publicTemple } = usePublicTemple();

  const branding = currentAccess?.temple.branding || publicTemple?.branding;
  const primaryColor = branding?.primaryColor;
  const secondaryColor = branding?.secondaryColor;

  const resolvedThemeOverrides = useMemo(() => {
    if (!primaryColor && !secondaryColor) return themeOverrides;

    const templePalette = createTemplePalette(primaryColor, secondaryColor);
    const baseOverrides = merge({}, themeOverrides || {});
    return merge(baseOverrides, {
      colorSchemes: {
        light: { palette: templePalette },
        dark: { palette: templePalette },
      },
    }) as ThemeOptions;
  }, [primaryColor, secondaryColor, themeOverrides]);

  const theme = useMemo(
    () =>
      createTheme({
        settingsState: {
          direction: settings.themeDirection,
          fontFamily: themeConfig.fontFamily.primary,
          fontSize: 16,
          contrast: settings.themeContrast === 'bold' ? ('high' as const) : ('default' as const),
          primaryColor: PRIMARY_COLOR_MAP[settings.themeColorPresets],
        },
        localeComponents: currentLang?.systemValue,
        themeOverrides: resolvedThemeOverrides,
      }),
    [
      currentLang?.systemValue,
      resolvedThemeOverrides,
      settings.themeColorPresets,
      settings.themeContrast,
      settings.themeDirection,
    ]
  );

  return (
    <ThemeVarsProvider
      disableTransitionOnChange
      theme={theme}
      defaultMode={settings.themeMode}
      modeStorageKey={themeConfig.modeStorageKey}
      {...other}
    >
      <ThemeModeSync mode={settings.themeMode}>
        <CssBaseline />
        <Rtl direction={settings.themeDirection}>{children}</Rtl>
      </ThemeModeSync>
    </ThemeVarsProvider>
  );
}

function ThemeModeSync({ mode, children }: { mode: 'light' | 'dark'; children: React.ReactNode }) {
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(mode);
  }, [mode, setMode]);

  return children;
}
