import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

export type FlagIconProps = BoxProps & {
  code: string;
};

export function FlagIcon({ code, sx, ...other }: FlagIconProps) {
  const countryCode = code.toLowerCase();

  if (!countryCode) {
    return null;
  }

  return (
    <Box
      component="img"
      alt=""
      loading="lazy"
      src={`https://flagcdn.com/${countryCode}.svg`}
      sx={[
        {
          width: 24,
          height: 18,
          flexShrink: 0,
          objectFit: 'cover',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}
