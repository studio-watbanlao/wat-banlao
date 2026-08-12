'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { Logo } from 'src/components/logo';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

// ----------------------------------------------------------------------

export function useMainSchoolBrand() {
  const { data: temple, isLoading } = usePublicTemple();
  const nameEnglish = temple?.branding.contact?.nameEnglish;

  return {
    user: null,
    school: {
      name: temple?.name || 'วัดบ้านเหล่า',
      code: typeof nameEnglish === 'string' ? nameEnglish.trim() : '',
      logo_url: temple?.branding.logoUrl || '/logo/logo.png',
    },
    isLoading,
  };
}

export function MainSchoolLogo({ size = 40 }: { size?: number }) {
  const { school } = useMainSchoolBrand();

  return (
    <Logo
      href="/"
      src={school.logo_url}
      alt={school.name}
      sx={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
}

type MainSchoolBrandProps = {
  compact?: boolean;
};

export function MainSchoolBrand({ compact = false }: MainSchoolBrandProps) {
  const logoSize = compact ? 36 : 42;
  const { school } = useMainSchoolBrand();

  return (
    <Box
      component={RouterLink}
      href="/"
      aria-label={school.name}
      sx={{
        gap: compact ? 1 : 1.25,
        minWidth: 0,
        color: '#5A3A29',
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
      }}
    >
      <Logo
        disabledLink
        src={school.logo_url}
        alt={school.name}
        sx={{ width: logoSize, height: logoSize, flexShrink: 0, objectFit: 'contain' }}
      />

      <Box component="span" sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          sx={{
            display: 'block',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            fontSize: compact ? '1rem' : '1.75rem',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {school.name}
        </Typography>
        {school.code ? (
          <Typography
            component="span"
            sx={{
              display: 'block',
              color: 'text.secondary',
              fontSize: compact ? '0.75rem' : '0.875rem',
              lineHeight: 1.35,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {school.code}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
