import { m, MotionProps } from 'framer-motion';

import Box, { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { MotionContainer, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

const CONTACTS = [
  {
    country: 'ที่ตั้ง',
    address:
      'ปัจจุบันตั้งอยู่เลขที่ 114 บ้านเหล่า หมู่ 3 ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย จังหวัด มหาสารคาม',
    phoneNumber: '',
  },
  {
    country: 'ช่วงเวลาทำการ',
    address: '08:00 น - 17:00 น. ทุกวัน',
    phoneNumber: '',
  },
  {
    country: 'อีเมล',
    address: 'studio.watbanlao@gmail.com',
    phoneNumber: '',
  },
  // {
  //   country: 'เบอร์โทร',
  //   address: 'studio.watbanlao@gmail.com',
  //   phoneNumber: '',
  // },
];

// ----------------------------------------------------------------------

export default function ContactHero() {
  const theme = useTheme();

  return (
    <Box>
      <Stack component={MotionContainer}>
        <Box
          sx={{
            bottom: { md: 80 },
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
            {CONTACTS.map((contact, index) => (
              <Stack key={contact.country} sx={{ maxWidth: index === 0 ? 300 : 200 }}>
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
      </Stack>
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
        typography: 'h2',
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
