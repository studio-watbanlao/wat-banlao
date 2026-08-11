import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';

type BorderSlot = { size?: number; width?: string | number; sx?: BoxProps['sx'] };

export type AnimateBorderProps = BoxProps & {
  slotProps?: { primaryBorder?: BorderSlot; secondaryBorder?: BorderSlot };
};

export function AnimateBorder({ children, slotProps, sx, ...other }: AnimateBorderProps) {
  const border = slotProps?.primaryBorder;

  return (
    <Box
      sx={[
        {
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderStyle: 'solid',
          borderWidth: border?.width ?? 1,
          borderColor: 'currentColor',
        },
        ...(Array.isArray(border?.sx) ? border.sx : [border?.sx]),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {children}
    </Box>
  );
}
