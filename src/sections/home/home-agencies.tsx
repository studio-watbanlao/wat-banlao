import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { m } from 'framer-motion';

import { MotionViewport, varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

type Agency = {
  label: string;
  logo: string;
};

const DATA: Agency[] = [
  { label: 'วัดบ้านเหล่า', logo: 'banlao' },
  { label: 'วัดราษบำรุง', logo: 'watnu' },
  { label: 'ชุมชนบ้านเหล่า', logo: 'house' },
  { label: 'โรงเรียนบ้านเหล่า', logo: 'school' },
  { label: 'องค์การบริหารส่วนตำบลเม็กดำ', logo: 'abt' },
  { label: 'ค่ายเพลง', logo: 'klong' },
];

export default function HomeAgencies() {
  return (
    <Container maxWidth="xl" component={MotionViewport} sx={{ textAlign: 'center', py: { xs: 8 } }}>
      <m.div variants={varFade().inDown}>
        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
          หน่วยงานที่เกี่ยวข้อง
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant="h3" sx={{ my: 1 }}>
          เครือข่ายความร่วมมือ
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography sx={{ mx: 'auto', maxWidth: 640, color: 'text.secondary' }}>
          หน่วยงานที่ให้การสนับสนุนและร่วมพัฒนาวัดบ้านเหล่า - สุขธัมมาราม
        </Typography>
      </m.div>

      <Stack
        direction="row"
        spacing={{ xs: 1, md: 3 }}
        sx={{ justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}
      >
        {DATA.map((item) => (
          <Box key={item.logo} component={m.div} variants={varFade().in}>
            <Box
              component="img"
              src={`/assets/images/partner/${item.logo}.png`}
              alt={item.label}
              sx={{ width: { xs: 60, md: 120 }, height: { xs: 60, md: 120 } }}
            />
          </Box>
        ))}
      </Stack>
    </Container>
  );
}
