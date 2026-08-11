'use client';

import type { Theme, ThemeProviderProps as MuiThemeProviderProps } from '@mui/material/styles';
import { useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { useColorScheme, ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import type {} from './extend-theme-types';
import type { ThemeOptions } from './types';
import { createTheme } from './create-theme';
import { themeConfig } from './theme-config';
import { Rtl } from './with-settings/right-to-left';

import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

export type ThemeProviderProps = Partial<MuiThemeProviderProps<Theme>> & {
  themeOverrides?: ThemeOptions;
};

export function ThemeProvider({ themeOverrides, children, ...other }: ThemeProviderProps) {
  const settings = useSettingsContext();
  const { currentLang } = useLocales();

  const primaryColorMap = {
    default: 'default',
    cyan: 'preset1',
    purple: 'preset2',
    blue: 'preset3',
    orange: 'preset4',
    red: 'preset5',
  } as const;

  const settingsState = {
    direction: settings.themeDirection,
    fontFamily: themeConfig.fontFamily.primary,
    fontSize: 16,
    contrast: settings.themeContrast === 'bold' ? ('high' as const) : ('default' as const),
    primaryColor: primaryColorMap[settings.themeColorPresets],
  };

  const theme = createTheme({
    settingsState,
    localeComponents: currentLang?.systemValue,
    themeOverrides,
  });

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
