import { m, MotionProps } from 'framer-motion';

import Box, { BoxProps } from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const CONTACTS = [
  {
    country: 'ที่ตั้ง',
    address: '508 Bridle Avenue Newnan, GA 30263',
    phoneNumber: '(239) 555-0108',
  },
  {
    country: 'สถานที่ติดต่อ',
    address: '508 Bridle Avenue Newnan, GA 30263',
    phoneNumber: '(319) 555-0115',
  },
  {
    country: 'ช่วงเวลาติดต่อ',
    address: '508 Bridle Avenue Newnan, GA 30263',
    phoneNumber: '(252) 555-0126',
  },
];

// ----------------------------------------------------------------------

export default function ContactHero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: { md: 300 },
        py: { xs: 10, md: 0 },
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container component={MotionContainer}>
        <Box
          sx={{
            bottom: { md: 80 },
            position: { md: 'absolute' },
            textAlign: { xs: 'center', md: 'unset' },
          }}
        >
          <TextAnimate
            text="วัดบ้านเหล่า "
            sx={{ color: 'primary.main' }}
            variants={varFade().inRight}
          />
          <TextAnimate text="-สุขธัมมาราม" variants={varFade().inRight} />

          <Stack
            spacing={5}
            alignItems={{ xs: 'center', md: 'unset' }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ mt: 5 }}
          >
            {CONTACTS.map((contact) => (
              <Stack key={contact.country} sx={{ maxWidth: 180 }}>
                <m.div variants={varFade().in}>
                  <Typography variant="h6" gutterBottom>
                    {contact.country}
                  </Typography>
                </m.div>

                <m.div variants={varFade().inRight}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {contact.address}
                  </Typography>
                </m.div>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

// ----------------------------------------------------------------------

type TextAnimateProps = BoxProps &
  MotionProps & {
    text: string;
  };

function TextAnimate({ text, variants, sx, ...other }: TextAnimateProps) {
  return (
    <Box
      component={m.div}
      sx={{
        typography: 'h1',
        overflow: 'hidden',
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      {text.split('').map((letter, index) => (
        <m.span key={index} variants={variants || varFade().inUp}>
          {letter}
        </m.span>
      ))}
    </Box>
  );
}
