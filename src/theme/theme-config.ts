import type { CommonColors, Direction, Theme, ThemeProviderProps } from '@mui/material/styles';
import { createPaletteChannel } from 'minimal-shared/utils';

import type { PaletteColorKey, PaletteColorNoChannels } from './core/palette';
import type { ThemeCssVariables } from './types';


// ----------------------------------------------------------------------

export type ThemeConfig = {
  direction: Direction;
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  defaultMode: ThemeProviderProps<Theme>['defaultMode'];
  modeStorageKey: ThemeProviderProps<Theme>['modeStorageKey'];
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<PaletteColorKey, PaletteColorNoChannels> & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: {
      [K in 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 as `${K}`]: string;
    };
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  defaultMode: 'light',
  modeStorageKey: 'theme-mode',
  direction: 'ltr',
  classesPrefix: 'minimal',
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'LINE Seed Sans TH',
    secondary: 'LINE Seed Sans TH',
  },
  /** **************************************
   * Palette
   *************************************** */

  palette: {
    primary: {
      lighter: '#D9C7B7',
      light: '#A77F5A',
      main: '#563A24',
      dark: '#3E2A18',
      darker: '#2A1C10',
      contrastText: '#FFFFFF',
    },

    secondary: {
      lighter: '#FFF5DB',
      light: '#FFE08A',
      main: '#FFC94A',
      dark: '#E6A700',
      darker: '#B97A00',
      contrastText: '#1A1A1A',
    },

    info: {
      lighter: '#CAFDF5',
      light: '#61F3F3',
      main: '#00B8D9',
      dark: '#006C9C',
      darker: '#003768',
      contrastText: '#FFFFFF',
    },
    success: {
      lighter: '#D3FCD2',
      light: '#77ED8B',
      main: '#22C55E',
      dark: '#118D57',
      darker: '#065E49',
      contrastText: '#ffffff',
    },
    warning: {
      lighter: '#FFF5CC',
      light: '#FFD666',
      main: '#FFAB00',
      dark: '#B76E00',
      darker: '#7A4100',
      contrastText: '#1C252E',
    },
    error: {
      lighter: '#FFE9D5',
      light: '#FFAC82',
      main: '#FF5630',
      dark: '#B71D18',
      darker: '#7A0916',
      contrastText: '#FFFFFF',
    },
    grey: {
      50: '#FCFDFD',
      100: '#F9FAFB',
      200: '#F4F6F8',
      300: '#DFE3E8',
      400: '#C4CDD5',
      500: '#919EAB',
      600: '#637381',
      700: '#454F5B',
      800: '#1C252E',
      900: '#141A21',
    },
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
  },
};

// ----------------------------------------------------------------------

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const mixHexColor = (source: string, target: string, targetWeight: number) => {
  const sourceValue = Number.parseInt(source.slice(1), 16);
  const targetValue = Number.parseInt(target.slice(1), 16);
  const channel = (shift: number) => {
    const from = (sourceValue >> shift) & 255;
    const to = (targetValue >> shift) & 255;
    return Math.round(from + (to - from) * targetWeight);
  };

  return `#${[channel(16), channel(8), channel(0)]
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')}`.toUpperCase();
};

const getContrastText = (color: string) => {
  const value = Number.parseInt(color.slice(1), 16);
  const channels = [16, 8, 0].map((shift) => ((value >> shift) & 255) / 255);
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  );
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  const whiteContrast = 1.05 / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;

  return whiteContrast >= blackContrast ? '#FFFFFF' : '#1A1A1A';
};

const createBrandColor = (value: string | undefined, fallback: PaletteColorNoChannels) => {
  const main = value && HEX_COLOR_PATTERN.test(value) ? value.toUpperCase() : fallback.main;

  return createPaletteChannel({
    lighter: mixHexColor(main, '#FFFFFF', 0.82),
    light: mixHexColor(main, '#FFFFFF', 0.38),
    main,
    dark: mixHexColor(main, '#000000', 0.24),
    darker: mixHexColor(main, '#000000', 0.48),
    contrastText: getContrastText(main),
  });
};

export const createTemplePalette = (primaryColor?: string, secondaryColor?: string) => ({
  primary: createBrandColor(primaryColor, themeConfig.palette.primary),
  secondary: createBrandColor(secondaryColor, themeConfig.palette.secondary),
});
