import { Grid } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { m } from 'framer-motion';

import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import { Box, Container } from '@mui/material';
import { MotionViewport, varFade } from 'src/components/animate';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { CONFIG } from 'src/config-global';

const HomeLookingFor = () => {
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
          บูรพาจารย์
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography
          variant="h3"
          sx={{
            mt: 3,
            mb: { md: 3 },
          }}
        >
          หลวงปู่สาธุ์ สุขธมฺโม
        </Typography>
      </m.div>

      <m.div variants={varFade().inDown}>
        <Typography
          variant="body2"
          sx={{
            mt: 1,
          }}
        >
          หนึ่งในบูรพาจารย์แห่งวัดบ้านเหล่ารูปหนึ่งที่มีบทบาทต่อชุมชนและพระพุทธศาสนาเป็นอย่างมาก
          นับว่าเป็นบุคคลสำคัญที่ทรงคุณค่าต่อการกราบไหว้สักการะบูชา เป็นปูชณียบุคคลที่ควรยกย่อง
          เพราะท่านเป็นแบบอย่างที่ดีต่อ บรรดาศิษยานุศิษย์ทั้งบรรพชิตและคฤหัสถ์ นำพาให้ประพฤติปฏิบัติ
          อยู่ในครรลองคลองธรรม นำพาสร้างสาธารณประโยชน์ มีวัดวา อาราม
          พัฒนาชุมชนให้มีความสามัคคีและเจริญก้าวหน้า ...
        </Typography>
      </m.div>
      <m.div variants={varFade().inDown}>
        <Box mt={3}>{renderBtn}</Box>
      </m.div>
    </Stack>
  );

  return (
    <Container
      component={MotionViewport}
      sx={{
        py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
      }}
    >
      <Grid container direction={{ xs: 'column-reverse', md: 'row' }} spacing={{ xs: 5, md: 0 }}>
        <Grid size={{ xs: 12, md: 5 }} sx={{ pr: { md: 4 } }}>
          {renderDescription}
        </Grid>

        <Grid size={{ xs: 12, md: 5 }} sx={{ pl: 4 }}>
          <m.div variants={varFade().inUp}>
            <Image disabledEffect alt="pha" src="/assets/images/img-luang-pu-sa.png" />
          </m.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomeLookingFor;
