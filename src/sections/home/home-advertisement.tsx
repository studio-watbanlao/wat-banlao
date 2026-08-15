import { m } from 'framer-motion';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Container, Typography } from '@mui/material';

import { bgGradient } from 'src/theme/css';
import { MotionViewport, varFade } from 'src/components/animate';
import Image from 'src/components/image';
import { CONFIG } from 'src/config-global';
import { useResponsive } from 'src/hooks/use-responsive';
import { getDonationAccount, hasDonationAccount } from 'src/lib/donation-account';
import { usePublicTemple } from 'src/hooks/use-public-temple';

// ----------------------------------------------------------------------

export default function HomeAdvertisement() {
  const mdUp = useResponsive('up', 'md');
  const { data: temple } = usePublicTemple();
  const account = getDonationAccount(temple?.branding, temple?.slug);

  if (!hasDonationAccount(account)) return null;

  const renderDescription = (
    <Box
      flexDirection={mdUp ? 'row' : 'column'}
      display={'flex'}
      sx={{
        alignItems: 'center',
        textAlign: {
          xs: 'center',
          md: 'left',
        },
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
              sx={{ height: 200, width: 200 }}
            />
          ) : null}
        </Stack>
      </Box>

      <Box
        component={m.div}
        variants={varFade().inDown}
        sx={{ color: 'common.white', typography: 'h3', ml: mdUp ? 3 : 0 }}
      >
        <Typography variant="h4">ร่วมทำบุญผ่านธนาคาร</Typography>
        <Typography variant="h3">บัญชี{account.bankName}</Typography>
        <Typography variant="h3">เลขที่บัญชี {account.accountNumber}</Typography>
        <Typography variant="h5">ชื่อบัญชี : {account.accountName}</Typography>
      </Box>

      {/* <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        spacing={2}
      >
        <m.div variants={varFade().inRight}>
          <Button
            color="inherit"
            size="large"
            variant="contained"
            target="_blank"
            rel="noopener"
            href={paths.minimalUI}
            sx={{
              color: 'grey.800',
              bgcolor: 'common.white',
            }}
          >
            Purchase Now
          </Button>
        </m.div>

        <m.div variants={varFade().inRight}>
          <Button
            color="inherit"
            size="large"
            variant="outlined"
            target="_blank"
            rel="noopener"
            href={paths.freeUI}
            endIcon={<Iconify icon="eva:external-link-fill" width={16} sx={{ mr: 0.5 }} />}
            sx={{
              color: 'common.white',
              '&:hover': { borderColor: 'currentColor' },
            }}
          >
            Get Free Version
          </Button>
        </m.div>
      </Stack> */}
    </Box>
  );

  const renderImg = (
    <Stack component={m.div} variants={varFade().inUp} alignItems="center" mr={mdUp ? 5 : 0}>
      {/* <Box
        component={m.img}
        animate={{
          y: [-20, 0, -20],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        alt="rocket"
        src="/assets/images/home/rocket.webp"
        sx={{ maxWidth: 460 }}
      />
       */}

      {account.bankLogoUrl ? (
        <Image src={account.bankLogoUrl} alt={`โลโก้${account.bankName}`} sx={{ height: 80 }} />
      ) : null}
    </Stack>
  );

  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
      }}
    >
      <Stack
        alignItems="center"
        direction={{ xs: 'column', md: 'row' }}
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
        {renderDescription}

        {renderImg}
      </Stack>

      <Typography variant="body2" mt={2}>
        “โลโก้ธนาคารเป็นเครื่องหมายการค้าของแต่ละธนาคาร ใช้เพื่อการอ้างอิงช่องทางการทำบุญเท่านั้น”
      </Typography>
    </Container>
  );
}
