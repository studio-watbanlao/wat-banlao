import { memo, forwardRef } from 'react';
import Box from '@mui/material/Box';

import { ScrollbarProps } from './types';
import { StyledScrollbar, StyledRootScrollbar } from './styles';

// ----------------------------------------------------------------------

const Scrollbar = forwardRef<HTMLDivElement, ScrollbarProps>(function Scrollbar(
  { children, sx, fillContent, ...other },
  ref
) {
  const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

  const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  if (mobile) {
    return (
      <Box ref={ref} sx={{ overflow: 'auto', ...(fillContent && { flex: '1 1 auto' }), ...sx }} {...other}>
        {children}
      </Box>
    );
  }

  return (
    <StyledRootScrollbar sx={fillContent ? { flex: '1 1 auto' } : undefined}>
      <StyledScrollbar
        scrollableNodeProps={{
          ref,
        }}
        clickOnTrack={false}
        sx={sx}
        {...other}
      >
        {children}
      </StyledScrollbar>
    </StyledRootScrollbar>
  );
});

export default memo(Scrollbar);
