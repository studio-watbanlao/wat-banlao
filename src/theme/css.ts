import type { Theme } from '@mui/material/styles';

import { alpha } from '@mui/material/styles';

// Compatibility helpers for components that still use the original theme utility API.
export const paper = ({
  theme,
  bgcolor,
  dropdown,
}: {
  theme: Theme;
  bgcolor?: string;
  dropdown?: boolean;
}) => ({
  ...bgBlur({
    blur: 20,
    opacity: 0.9,
    color: bgcolor || theme.palette.background.paper,
  }),
  backgroundImage: 'url(/assets/cyan-blur.png), url(/assets/red-blur.png)',
  backgroundRepeat: 'no-repeat, no-repeat',
  backgroundPosition: theme.direction === 'rtl' ? 'top left, right bottom' : 'top right, left bottom',
  backgroundSize: '50%, 50%',
  ...(dropdown && {
    padding: theme.spacing(0.5),
    boxShadow: theme.customShadows.dropdown,
    borderRadius: Number(theme.shape.borderRadius) * 1.25,
  }),
});

type BgBlurProps = {
  blur?: number;
  opacity?: number;
  color?: string;
  imgUrl?: string;
};

export function bgBlur({
  blur = 6,
  opacity = 0.8,
  color = '#000000',
  imgUrl,
}: BgBlurProps = {}) {
  if (imgUrl) {
    return {
      position: 'relative',
      backgroundImage: `url(${imgUrl})`,
      '&:before': {
        position: 'absolute',
        inset: 0,
        zIndex: 9,
        content: '""',
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        backgroundColor: alpha(color, opacity),
      },
    } as const;
  }

  return {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: alpha(color, opacity),
  };
}

type BgGradientProps = {
  direction?: string;
  color?: string;
  startColor?: string;
  endColor?: string;
  imgUrl?: string;
};

export function bgGradient({
  direction = 'to bottom',
  color,
  startColor,
  endColor,
  imgUrl,
}: BgGradientProps = {}) {
  const gradient = `linear-gradient(${direction}, ${startColor || color}, ${endColor || color})`;

  return imgUrl
    ? {
        background: `${gradient}, url(${imgUrl})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
      }
    : { background: gradient };
}

export const hideScroll = {
  x: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowX: 'scroll',
    '&::-webkit-scrollbar': { display: 'none' },
  },
  y: {
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    overflowY: 'scroll',
    '&::-webkit-scrollbar': { display: 'none' },
  },
} as const;
