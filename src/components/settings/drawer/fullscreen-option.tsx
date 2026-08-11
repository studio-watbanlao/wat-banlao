import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import ButtonBase from '@mui/material/ButtonBase';

import Iconify from '../../iconify';

// ----------------------------------------------------------------------

export default function FullScreenOption() {
  const [fullscreen, setFullscreen] = useState(false);

  const onToggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setFullscreen(false);
    }
  }, []);

  return (
    <Box sx={{ p: 2.5 }}>
      <ButtonBase
        onClick={onToggleFullScreen}
        sx={{
          width: 1,
          height: 48,
          borderRadius: 1,
          color: 'text.disabled',
          typography: 'subtitle2',
          border: (theme) => `solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
          ...(fullscreen && {
            color: 'text.primary',
          }),
        }}
      >
        <Iconify
          icon={fullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'}
          sx={{ width: 16, height: 16, mr: 1 }}
        />

        {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      </ButtonBase>
    </Box>
  );
}
