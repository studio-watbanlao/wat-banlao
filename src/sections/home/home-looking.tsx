import { m } from 'framer-motion';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/GridLegacy';

import { useResponsive } from 'src/hooks/use-responsive';

import { Container } from '@mui/material';
import { MotionViewport, varFade } from 'src/components/animate';
import Image from 'src/components/image';

const HomeLooking = () => {
  const mdUp = useResponsive('up', 'md');

  return (
    <Stack
      sx={{
        backgroundColor: 'rgba(145, 158, 171, 0.04)',
      }}
    >
      <Container
        component={MotionViewport}
        sx={{
          py: { xs: 10 },
        }}
      >
        <Grid
          container
          alignItems="center"
          justifyContent="space-between"
          spacing={{ xs: 5, md: 0 }}
        >
          <Grid xs={12} md={5} spacing={3}>
            <Stack>
              <m.div variants={varFade().inUp}>
                <Image
                  disabledEffect
                  sx={{ borderRadius: 3 }}
                  alt="pha"
                  ratio="1/1"
                  src="/assets/images/img-boontom.png"
                />
              </m.div>
            </Stack>
          </Grid>
          <Grid xs={12} md={7}>
            <Stack
              sx={{
                pl: mdUp ? 3 : 0,
                textAlign: {
                  xs: 'center',
                  md: 'left',
                },
              }}
            >
              <m.div variants={varFade().inDown}>
                <Typography variant="subtitle1" sx={{ color: 'text.disabled' }}>
                  เจ้าอาวาสวัดบ้านเหล่า
                </Typography>
              </m.div>

              <m.div variants={varFade().inDown}>
                <Stack>
                  <Typography
                    variant="h3"
                    sx={{
                      my: 2,
                    }}
                  >
                    พระสมุห์บุญถม อภิวํโส
                  </Typography>
                  <Typography variant="body1">
                    ชื่อพระบุญถม ฉายาอภิวํโส อายุ ๓๙ พรรษา ๑๙ วัดบ้านเหล่า ตำบลเม็กดำ
                    อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม
                  </Typography>
                </Stack>
              </m.div>

              <m.div variants={varFade().inDown}>
                <Stack mt={2} spacing={1}>
                  <Typography variant="h6">ตำแหน่งสำคัญ</Typography>
                  <Typography variant="body1">เจ้าอาวาสวัดบ้านเหล่า สุขธัมมาราม</Typography>
                </Stack>

                <Stack mt={2} spacing={1}>
                  <Typography variant="h6">สถานะเดิม</Typography>
                  <Typography variant="body1">
                    สถานะเดิม ชื่อบุญถม นามสกุล รอดสุโข เกิดวันที่ ๑๐ เดือน เมษายน พ.ศ ๒๕๒๙
                    บิดานายหมั่นมารดา นางชม ณ บ้านหมู่ที่ ๔๓/๑ ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย
                    จังหวัดมหาสารคาม
                  </Typography>
                </Stack>
                <Stack mt={2} spacing={1}>
                  <Typography variant="h6">อุปสมบท</Typography>
                  <Typography variant="body1">
                    วันที่ ๒๗ เดือน เมษายน พ.ศ ๒๕๕๐ ณ วัดบ้านเหล่า ตำบลอำเภอพยัคฆภูมิพิสัย จังหวัด
                    มหาสารคาม
                  </Typography>
                  <Typography variant="body1">
                    พระอุปัชฌาย์พระครูสุตธรรมมานุยุต วัดทองนพคุณ ตำบลปะหลาน อำเภอพยัคฆภูมิพิสัย
                    จังหวัดมหาสารคาม
                  </Typography>
                </Stack>
                <Stack mt={2} spacing={1}>
                  <Typography variant="h6">วิทยาฐานะ</Typography>
                  <Typography variant="body1">
                    ๑) สำเร็จ ม.๓ จาก โรงเรียนบ้านเหล่า(คุรุประชานุเคราะห์) อำเภอพยัคฆภูมิพิสัย
                    จังหวัดมหาสารคาม
                  </Typography>
                  <Typography variant="body1">
                    ๒) สอบได้ น.ธ.เอก สำนักเรียนวัดบ้านตาลอก อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม
                  </Typography>
                </Stack>
              </m.div>
              {/* <m.div variants={varFade().inDown}>
              <Box mt={3}>
                <Button
                  color="inherit"
                  size="large"
                  variant="outlined"
                  rel="noopener"
                  href={paths.parents.luangPuSa}
                  endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                >
                  อ่านเพิ่มเติม
                </Button>
              </Box>
            </m.div> */}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Stack>
  );
};

export default HomeLooking;
