import Box, { BoxProps } from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';
import type { SyntheticEvent } from 'react';

import Logo from '../logo';

import { useAuthContext } from 'src/auth/hooks';
import { usePublicTemple } from 'src/public-templates/use-public-temple';
import type { TempleAccess } from 'src/types/temple';

const DEFAULT_LOGO = '/logo/logo_single.png';

const SplashScreen = ({ sx, ...other }: BoxProps) => {
  const theme = useTheme();
  const { user } = useAuthContext();
  const { data: publicTemple } = usePublicTemple();

  const accesses = (user?.templeAccesses || []) as TempleAccess[];
  const currentAccess =
    accesses.find((access) => access.temple.id === user?.currentTempleId) || accesses[0];
  const temple = currentAccess?.temple || publicTemple;
  const logoUrl = temple?.branding.logoUrl || DEFAULT_LOGO;
  const templeName = temple?.name || 'วัดบ้านเหล่า';

  const handleLogoError = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;

    if (!image.src.endsWith(DEFAULT_LOGO)) {
      image.src = DEFAULT_LOGO;
    }
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 1300,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        ...sx,
      }}
      {...other}
    >
      {/* วงกลมพื้นหลัง glow effect */}
      <Box
        component={m.div}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: `radial-gradient(${alpha(
            theme.palette.primary.main,
            0.15
          )}, transparent 70%)`,
        }}
      />

      {/* วงกลมชั้นนอกสุด - หมุน */}
      <Box
        component={m.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: 'linear', repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: 220,
          height: 220,
          borderRadius: '50%',
          border: `2px solid ${alpha(theme.palette.primary.light, 0.2)}`,
        }}
      />

      {/* วงกลมกลาง - pulse + spin */}
      <Box
        component={m.div}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -360],
        }}
        transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
        sx={{
          position: 'absolute',
          width: 160,
          height: 160,
          borderRadius: '50%',
          border: `3px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      />

      {/* วงกลมในสุด - blur และ soft glow */}
      <Box
        component={m.div}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        sx={{
          position: 'absolute',
          width: 100,
          height: 100,
          borderRadius: '50%',
          border: `2px solid ${alpha(theme.palette.primary.dark, 0.2)}`,
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* โลโก้ตรงกลาง */}
      <m.div
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'relative', zIndex: 2 }}
      >
        <Logo
          disabledLink
          src={logoUrl}
          alt={templeName}
          onError={handleLogoError}
          sx={{ width: 88, height: 88, display: 'block', objectFit: 'contain' }}
        />
      </m.div>
    </Box>
  );
};

export default SplashScreen;
