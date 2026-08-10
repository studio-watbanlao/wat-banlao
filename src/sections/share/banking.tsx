import Box, { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { Typography } from '@mui/material';
import Image from 'src/components/image';
import { bgGradient } from 'src/theme/css';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  img?: string;
  title?: string;
  price?: string;
  description?: string;
}

export default function Banking({ img, price, title, description, sx, ...other }: Props) {
  const theme = useTheme();

  return (
    <Box {...other}>
      <Box
        component="img"
        alt="invite"
        src={img}
        sx={{
          left: 40,
          zIndex: 9,
          width: 140,
          position: 'relative',
          filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.24))',
          ...sx,
        }}
      />

      <Box
        sx={{
          mt: -15,
          color: 'common.white',
          borderRadius: 2,
          p: theme.spacing(16, 3, 3, 3),
          ...bgGradient({
            direction: '135deg',
            startColor: theme.palette.primary.main,
            endColor: theme.palette.primary.dark,
          }),
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ whiteSpace: 'pre-line', typography: 'h4' }}>ร่วมทำบุญผ่านธนาคาร</Box>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Box sx={{ color: 'common.white', typography: 'h3' }}>
            <Typography variant="h6">บัญชีธนาคารกรุงไทย</Typography>
            <Typography variant="h6">เลขที่บัญชี 423-0-71936-1</Typography>
            <Typography variant="body2">ชื่อบัญชี : วัดบ้านเหล่า ( WAT BANLAO )</Typography>
          </Box>

          <Stack mt={2}>
            <Image
              src="/assets/images/qr-code.png"
              alt="1"
              ratio="1/1"
              sx={{ height: 'auto', width: '100%', borderRadius: 2 }}
            />
          </Stack>

          <Stack alignItems="center" mt={2}>
            <Image src="/assets/images/logo-bank.png" alt="bank" sx={{ height: 60 }} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
