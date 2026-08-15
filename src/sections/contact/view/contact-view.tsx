'use client';
import Box from '@mui/material/Box';
import { m } from 'framer-motion';
import { Card, Grid, Stack, Typography } from '@mui/material';

import ContactForm from '../contact-form';
import ContactHero from '../contact-hero';

import { MotionViewport, varFade } from 'src/components/animate';
import Image from 'src/components/image';
import { useResponsive } from 'src/hooks/use-responsive';
import { getDonationAccount, hasDonationAccount } from 'src/lib/donation-account';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import { bgGradient } from 'src/theme/css';

const contactText = (contact: Record<string, unknown> | undefined, key: string) => {
  const value = contact?.[key];
  return typeof value === 'string' ? value : '';
};

const ContactView = () => {
  const mdUp = useResponsive('up', 'md');
  const { data: temple } = usePublicTemple();
  const account = getDonationAccount(temple?.branding, temple?.slug);
  const showDonation = hasDonationAccount(account);
  const contact = temple?.branding.contact;
  const latitude = contactText(contact, 'latitude');
  const longitude = contactText(contact, 'longitude');
  const address = contactText(contact, 'address');
  const mapQuery = latitude && longitude ? `${latitude},${longitude}` : address;
  const mapUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`
    : '';
  return (
    <Stack>
      <Grid container>
        <Grid size={12}>
          <ContactHero />
        </Grid>
      </Grid>

      {mapUrl ? (
        <Stack mt={3}>
          <Card sx={{ width: '100%', height: 400, borderRadius: 3, p: 2 }}>
            <iframe
              title={`แผนที่${temple?.name || 'วัด'}`}
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: 12 }}
              loading="lazy"
            />
          </Card>
        </Stack>
      ) : null}

      <Grid container spacing={5} mt={3}>
        <Grid size={{ xs: 12, md: showDonation ? 7 : 12 }}>
          <ContactForm />
        </Grid>
        {showDonation ? (
          <Grid size={{ xs: 12, md: 5 }}>
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
                      {account.qrCodeUrl ? (
                        <Image
                          src={account.qrCodeUrl}
                          alt={`QR Code บัญชี ${account.accountName}`}
                          ratio="1/1"
                          sx={{ height: 300, width: 300 }}
                        />
                      ) : null}
                    </Stack>
                  </Box>

                  <Box
                    component={m.div}
                    variants={varFade().inDown}
                    sx={{ color: 'common.white', typography: 'h3' }}
                  >
                    <Typography variant="h4">ร่วมทำบุญผ่านธนาคาร</Typography>
                    <Typography variant="h3">บัญชี{account.bankName}</Typography>
                    <Typography variant="h3">เลขที่บัญชี {account.accountNumber}</Typography>
                    <Typography variant="h5">ชื่อบัญชี : {account.accountName}</Typography>
                  </Box>
                </Box>

                <Stack
                  component={m.div}
                  variants={varFade().inUp}
                  alignItems="center"
                  mt={mdUp ? 5 : 0}
                >
                  {account.bankLogoUrl ? (
                    <Image
                      src={account.bankLogoUrl}
                      alt={`โลโก้${account.bankName}`}
                      sx={{ height: 80 }}
                    />
                  ) : null}
                </Stack>
              </Stack>

              <Typography variant="body2" mt={2}>
                “โลโก้ธนาคารเป็นเครื่องหมายการค้าของแต่ละธนาคาร
                ใช้เพื่อการอ้างอิงช่องทางการทำบุญเท่านั้น”
              </Typography>
            </Stack>
          </Grid>
        ) : null}
      </Grid>
    </Stack>
  );
};

export default ContactView;
