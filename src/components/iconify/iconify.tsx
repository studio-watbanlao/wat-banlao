import { forwardRef } from 'react';
import { Icon } from '@iconify/react';

import Box, { BoxProps } from '@mui/material/Box';

import { IconifyProps } from './types';
import { toRemixIcon } from './remix-icons';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  icon: IconifyProps;
}

const Iconify = forwardRef<SVGElement, Props>(({ icon, width = 20, sx, ...other }, ref) => {
  const remixIcon = toRemixIcon(icon);
  const isLoader = icon === 'svg-spinners:12-dots-scale-rotate' || icon === 'ri:loader-4-line';

  return (
    <Box
      ref={ref}
      component={Icon}
      className="component-iconify"
      icon={remixIcon}
      sx={{
        width,
        height: width,
        ...(isLoader && {
          animation: 'remix-icon-spin 1s linear infinite',
          '@keyframes remix-icon-spin': {
            to: { transform: 'rotate(360deg)' },
          },
        }),
        ...sx,
      }}
      {...other}
    />
  );
});

export default Iconify;
