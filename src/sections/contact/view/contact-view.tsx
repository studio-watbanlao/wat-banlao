'use client';
import Box from '@mui/material/Box';
import { m } from 'framer-motion';

import { Card, Grid, Stack, Typography } from '@mui/material';
import { MotionViewport, varFade } from 'src/components/animate';
import Image from 'src/components/image';
import { useResponsive } from 'src/hooks/use-responsive';
import { bgGradient } from 'src/theme/css';
import ContactForm from '../contact-form';
import ContactHero from '../contact-hero';

const ContactView = () => {
  const mdUp = useResponsive('up', 'md');
  return (
    <Stack>
      <Grid container>
        <Grid item xs={12}>
          <ContactHero />
        </Grid>
      </Grid>

      <Stack mt={3}>
        <Card sx={{ width: '100%', height: 400, borderRadius: 3, p: 2 }}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3844.6004632216927!2d103.10802597559774!3d15.505908485094945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3118499980119b69%3A0x6891b07b0f6d1607!2z4Lin4Lix4LiU4Lia4LmJ4Liy4LiZ4LmA4Lir4Lil4LmI4LiyIC0g4Liq4Li44LiC4LiY4Lix4Lih4Lih4Liy4Lij4Liy4Lih!5e0!3m2!1sth!2sth!4v1775380166006!5m2!1sth!2sth"
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
          />
        </Card>
      </Stack>

      <Grid container spacing={5} mt={3}>
        <Grid item xs={12} md={7}>
          <ContactForm />
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack component={MotionViewport}>
            <Stack
              alignItems="center"
              direction={'column'}
              alignContent={'center'}
              justifyContent={'space-between'}
              sx={{
                p: 3,
                ...bgGradient({
                  direction: '100deg',
                  startColor: `#03a9f4 0%`,
                  endColor: `#009BE1 80%`,
                }),
                borderRadius: 2,
              }}
            >
              <Box
                flexDirection={'column'}
                display={'flex'}
                sx={{
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box
                  component={m.div}
                  variants={varFade().inDown}
                  sx={{ color: 'common.white', typography: 'h3' }}
                >
                  <Stack>
                    <Image
                      src="/assets/images/qr-code.png"
                      alt="1"
                      ratio="1/1"
                      sx={{ height: 300, width: 300 }}
                    />
                  </Stack>
                </Box>

                <Box
                  component={m.div}
                  variants={varFade().inDown}
                  sx={{ color: 'common.white', typography: 'h3' }}
                >
                  <Typography variant="h4">ร่วมทำบุญผ่านธนาคาร</Typography>
                  <Typography variant="h3">บัญชีธนาคารกรุงไทย</Typography>
                  <Typography variant="h3">เลขที่บัญชี 423-0-71936-1</Typography>
                  <Typography variant="h5">ชื่อบัญชี : วัดบ้านเหล่า ( WAT BANLAO )</Typography>
                </Box>
              </Box>

              <Stack
                component={m.div}
                variants={varFade().inUp}
                alignItems="center"
                mt={mdUp ? 5 : 0}
              >
                <Image src="/assets/images/logo-bank.png" alt="bank" sx={{ height: 80 }} />
              </Stack>
            </Stack>

            <Typography variant="body2" mt={2}>
              “โลโก้ธนาคารเป็นเครื่องหมายการค้าของแต่ละธนาคาร
              ใช้เพื่อการอ้างอิงช่องทางการทำบุญเท่านั้น”
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ContactView;
