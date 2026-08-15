import { m, MotionProps } from 'framer-motion';
import Box, { BoxProps } from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { MotionContainer, varFade } from 'src/components/animate';
import { usePublicTemple } from 'src/hooks/use-public-temple';

// ----------------------------------------------------------------------

const contactText = (contact: Record<string, unknown> | undefined, key: string) => {
  const value = contact?.[key];
  return typeof value === 'string' ? value : '';
};

// ----------------------------------------------------------------------

export default function ContactHero() {
  const { data: temple } = usePublicTemple();
  const contact = temple?.branding.contact;
  const nameEnglish = contactText(contact, 'nameEnglish');
  const contacts = [
    { label: 'ที่ตั้ง', value: contactText(contact, 'address') },
    { label: 'ช่วงเวลาทำการ', value: contactText(contact, 'openingHours') },
    { label: 'อีเมล', value: contactText(contact, 'email') },
  ].filter((item) => item.value);

  return (
    <Box>
      <Stack component={MotionContainer}>
        <Box
          sx={{
            bottom: { md: 80 },
          }}
        >
          <TextAnimate
            text={temple?.name || 'เว็บไซต์วัด'}
            sx={{ color: 'primary.main' }}
            variants={varFade().inRight}
          />
          {nameEnglish ? (
            <Typography variant="h5" color="text.secondary" sx={{ mt: 1 }}>
              {nameEnglish}
            </Typography>
          ) : null}

          <Stack
            spacing={5}
            alignItems={{ xs: 'center', md: 'unset' }}
            direction={{ xs: 'column', md: 'row' }}
            sx={{ mt: 5 }}
          >
            {contacts.map((item, index) => (
              <Stack key={item.label} sx={{ maxWidth: index === 0 ? 420 : 240 }}>
                <m.div variants={varFade().in}>
                  <Typography variant="h6" gutterBottom>
                    {item.label}
                  </Typography>
                </m.div>

                <m.div variants={varFade().inRight}>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {item.value}
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
