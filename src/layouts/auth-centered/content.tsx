'use client';

import type { BoxProps } from '@mui/material/Box';
import { mergeClasses } from 'minimal-shared/utils';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';

import { layoutClasses } from '../core';

// ----------------------------------------------------------------------

export type AuthCenteredContentProps = BoxProps;

export function AuthCenteredContent({
  sx,
  children,
  className,
  ...other
}: AuthCenteredContentProps) {
  return (
    <Box
      className={mergeClasses([layoutClasses.content, className])}
      sx={[
        (theme) => ({
          py: { xs: 3, sm: 4 },
          px: { xs: 2.5, sm: 4 },
          width: 1,
          zIndex: 2,
          border: `1px solid ${alpha(theme.palette.common.white, 0.64)}`,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 'var(--layout-auth-content-width)',
          bgcolor: alpha(theme.palette.background.paper, 0.94),
          backdropFilter: 'blur(18px)',
          boxShadow: `0 24px 64px ${alpha(theme.palette.grey[900], 0.22)}`,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}
