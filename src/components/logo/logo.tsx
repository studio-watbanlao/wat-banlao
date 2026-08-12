import { forwardRef } from 'react';
import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

export type LogoProps = BoxProps & {
  disabledLink?: boolean;
  href?: string;
  isSingle?: boolean;
  src?: string;
  alt?: string;
};

const Logo = forwardRef<HTMLImageElement, LogoProps>(
  ({ disabledLink = false, href = '/', isSingle = false, src = '/logo/logo.png', alt = 'Logo', sx, ...other }, ref) => {
    const logo = (
      <Box
        ref={ref}
        component="img"
        src={src}
        alt={alt}
        data-single={isSingle || undefined}
        sx={{ width: 40, height: 40, cursor: 'pointer', ...sx }}
        {...other}
      />
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href={href} sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

Logo.displayName = 'Logo';

export default Logo;
