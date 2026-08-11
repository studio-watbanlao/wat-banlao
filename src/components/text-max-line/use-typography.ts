import { useTheme } from '@mui/material/styles';
import type { TypographyProps } from '@mui/material/Typography';

import { useWidth } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

function remToPx(value: string) {
  return Math.round(parseFloat(value) * 16);
}

export default function useTypography(variant: NonNullable<TypographyProps['variant']>) {
  const theme = useTheme();

  const breakpoints = useWidth();

  const key = theme.breakpoints.up(breakpoints === 'xl' ? 'lg' : breakpoints);

  const hasResponsive =
    variant === 'h1' ||
    variant === 'h2' ||
    variant === 'h3' ||
    variant === 'h4' ||
    variant === 'h5' ||
    variant === 'h6';

  const typography = theme.typography as Record<string, any>;
  const variantStyle = typography[variant];
  const getFont: any = hasResponsive && variantStyle?.[key] ? variantStyle[key] : variantStyle;

  const fontSize = remToPx(getFont.fontSize);

  const lineHeight = Number(variantStyle.lineHeight) * fontSize;

  const { fontWeight, letterSpacing } = variantStyle;

  return { fontSize, lineHeight, fontWeight, letterSpacing };
}
