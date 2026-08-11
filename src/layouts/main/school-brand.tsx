'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

export function useMainSchoolBrand() {
  return {
    user: null,
    school: { name: 'วัดบ้านเหล่า', logo_url: '/logo/logo.png' },
    isLoading: false,
  };
}

export function MainSchoolLogo({ size = 40 }: { size?: number }) {
  return <Logo href="/" sx={{ width: size, height: size }} />;
}

type MainSchoolBrandProps = {
  compact?: boolean;
};

export function MainSchoolBrand({ compact = false }: MainSchoolBrandProps) {
  const logoSize = compact ? 36 : 42;

  return (
    <Box
      component={RouterLink}
      href="/"
      aria-label="วัดบ้านเหล่า - สุขธัมมาราม"
      sx={{
        gap: compact ? 1 : 1.25,
        minWidth: 0,
        color: '#5A3A29',
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      <Logo disabledLink sx={{ width: logoSize, height: logoSize, flexShrink: 0 }} />

      <Typography
        component="span"
        sx={{
          fontWeight: 700,
          whiteSpace: 'nowrap',
          fontSize: compact ? '1rem' : '1.75rem',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        วัดบ้านเหล่า - สุขธัมมาราม
      </Typography>
    </Box>
  );
}
