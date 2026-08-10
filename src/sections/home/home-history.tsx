import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import { Container } from '@mui/material';
import { MotionViewport, varFade } from 'src/components/animate';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { CONFIG } from 'src/config-global';

const HomeHistory = () => {
  const mdUp = useResponsive('up', 'md');

  const renderBtn = (
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
  );

  const renderDescription = (
    <Stack
      sx={{
        textAlign: {
          xs: 'center',
          md: 'left',
        },
      }}
    >
      <m.div variants={varFade().inDown}>
        <Typography variant="overline" component="div" sx={{ color: 'text.disabled' }}>
          ประวัติความเป็นมา
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography
          variant="h3"
          sx={{
            mt: 2,
          }}
        >
          วัดบ้านเหล่า
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
            textAlign: 'justify',
          }}
        >
          วัดบ้านเหล่าเป็นวัดเก่าแก่แห่งหนึ่งในจังหวัดมหาสารคาม สร้างขึ้นเมื่อปี พ.ศ. 2339
          อายุประมาณ 229 ปี ปัจจุบันตั้งอยู่เลขที่ 114 บ้านเหล่า หมู่ 3 ตำบลเม็กดำ
          อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม สังกัดคณะสงฆ์มหานิกาย
          ปัจจุบันมีเนื้อที่วัดทั้งหมดประมาณ 16 ไร่ สภาพภูมิศาสตร์ของวัดเป็นที่ราบลุ่ม
          เคยได้รับพระราชทานวิสุงคามสีมา เมื่อวันที่ 20 มีนาคม พ.ศ. 2348 มีเขตวิสุงคามสีมากว้าง 5
          เมตร ยาว 13 เมตร เป็นโครงสร้างคอนกรีตเสริมเหล็ก พื้นไม้ตะเคียน หลังคาสังกะสี
          มีการปฏิสังขรณ์ในกาลสมัยต่อมาเป็นโครงสร้างคอนกรีตเสริม
          เหล็กทั้งหลังทำการบูรณะปฏิสังขรณ์ในสมัยหลวงปู่สาธุ์และหลวงปู่ประมวลมาแล้วหลายครั้ง
          และในยุคสมัยปัจจุบันได้ทำการรื้อถอนอุโบสถหลังเก่าที่มีสภาพทรุดโทรม แล้วนำพาชาวบ้าน
          สร้างขึ้นใหม่ในปี พ.ศ. 2560 บนสถานที่เดิม ได้รับพระราชทานวิสุงคามสีมาเมื่อวันที่ 25 มีนาคม
          2568 อุโบสถมีขนาดความกว้าง 29 เมตร ยาว 49 เมตรขณะนี้ยังอยู่ในขั้นตอนดำเนินการ ก่อสร้าง
          ได้ประมาณ 80 % คาดว่าจะแล้วเสร็จสมบูรณ์และจัดพิธีผูกพัทธสีมาสมโภชฉลอง
          อุโบสถหลังใหม่ในกาลอันใกล้นี้
        </Typography>
      </m.div>
      {/* <m.div variants={varFade().inDown}>
        <Box mt={3}>{renderBtn}</Box>
      </m.div> */}
    </Stack>
  );

  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
      }}
    >
      <Grid container alignItems="center" justifyContent="space-between" spacing={{ xs: 5, md: 8 }}>
        <Grid xs={12} md={6} sx={{ pl: 4 }}>
          <m.div variants={varFade().inUp}>
            <Image
              disabledEffect
              alt="pha"
              src="/assets/images/watbanlao.png"
              sx={{ borderRadius: 2 }}
            />
          </m.div>
        </Grid>

        <Grid xs={12} md={6}>
          {renderDescription}
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomeHistory;
