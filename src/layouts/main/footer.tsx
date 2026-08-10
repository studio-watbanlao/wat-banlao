import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';

import { _socials } from 'src/_mock';

import { Container } from '@mui/material';
import Iconify from 'src/components/iconify';
import Logo from 'src/components/logo';

const LINKS = [
  {
    headline: 'เมนู',
    children: [
      // { name: 'เกี่ยวกับเรา', href: paths.about },
      { name: 'ข้อกำหนดและเงื่อนไข', href: '#' },
      { name: 'นโยบายความเป็นส่วนตัว', href: '#' },
      // { name: 'ติดต่อเรา', href: paths.contact },
      // { name: 'คำถามที่พบบ่อย', href: paths.faqs },
    ],
  },
  // {
  //   headline: '',
  //   children: [
  //     { name: 'ข้อกำหนดและเงื่อนไข', href: '#' },
  //     { name: 'นโยบายความเป็นส่วนตัว', href: '#' },
  //   ],
  // },
  {
    headline: 'ติดต่อสอบถาม',
    children: [{ name: 'studio.watbanlao@gmail.com', href: '#' }],
  },
];

const Footer = () => {
  const pathname = usePathname();

  const homePage = pathname === '/';

  const simpleFooter = (
    <Box
      component="footer"
      sx={{
        py: 5,
        textAlign: 'center',
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Stack sx={{ px: '10%' }}>
        <Logo sx={{ mb: 1, mx: 'auto' }} />

        <Typography variant="caption" component="div">
          © สงวนลิขสิทธิ์ทั้งหมด
          <br /> จัดทำโดย
          <Typography variant="caption"> วัดบ้านเหล่า สุขธัมมาราม</Typography>
        </Typography>
      </Stack>
    </Box>
  );

  const mainFooter = (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        bgcolor: 'background.default',
      }}
    >
      <Divider />

      <Container
        sx={{
          py: 5,
          alignItems: { xs: 'center', md: 'unset' },
          textAlign: { xs: 'center', md: 'unset' },
        }}
      >
        <Logo sx={{ mb: 3 }} />

        <Grid
          container
          justifyContent={{
            xs: 'center',
            md: 'space-between',
          }}
        >
          <Grid xs={8} md={5}>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 300,
                mx: { xs: 'auto', md: 'unset' },
              }}
            >
              <strong> " วัดบ้านเหล่า สุขธัมมาราม" </strong>
              <br /> ปัจจุบันตั้งอยู่เลขที่ 114 บ้านเหล่า หมู่ 3 ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย
              จังหวัด มหาสารคาม สังกัดคณะสงฆ์มหานิกาย
            </Typography>

            <Stack
              direction="row"
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              sx={{
                mt: 3,
                mb: { xs: 5, md: 0 },
              }}
            >
              {_socials.map((social) => (
                <IconButton
                  key={social.name}
                  href={social.path}
                  target="_blank"
                  sx={{
                    '&:hover': {
                      bgcolor: alpha(social.color, 0.08),
                    },
                  }}
                >
                  <Iconify color={social.color} icon={social.icon} />
                </IconButton>
              ))}
            </Stack>
          </Grid>

          <Grid xs={12} md={7}>
            <Stack spacing={5} direction={{ xs: 'column', md: 'row' }}>
              {LINKS.map((list) => (
                <Stack
                  key={list.headline}
                  spacing={2}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                  sx={{ width: 1 }}
                >
                  <Typography component="div" variant="overline">
                    {list.headline}
                  </Typography>

                  {list.children.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      href={link.href}
                      color="inherit"
                      variant="body2"
                    >
                      {link.name}
                    </Link>
                  ))}
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>

        <Typography variant="body2" sx={{ mt: 10 }}>
          © ๒๕๖๙ วัดบ้านเหล่า สุขธัมมาราม สงวนลิขสิทธิ์
        </Typography>
      </Container>
    </Box>
  );

  return homePage ? simpleFooter : mainFooter;
};

export default Footer;
