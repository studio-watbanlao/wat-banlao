import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { m } from 'framer-motion';

import { MotionViewport, varFade } from 'src/components/animate';

const CARDS = [
  {
    icon: '/assets/images/house.png',
    title: 'ชุมชนบ้านเหล่า',
    description:
      'ประกอบด้วยชาวบ้านเหล่า 6 หมู่บ้าน อันได้แก่ บ้านเหล่าในหมู่ที่ 3, บ้านมะเห็บหมู่ที่ 13, บ้านเหล่างิ้วหมู่ 14, บ้านดอนแแคนหมู่ที่ 18, บ้านโนนสำราญหมู่ที่ 19, บ้านเหล่าหนองขามหมู่ที่ 22',
  },
  {
    icon: '/assets/images/temple.png',
    title: 'วัดบ้านเหล่า',
    description: 'วัดบ้านเหล่า - สุขธัมมาราม ตำบล เม็กดำ อำเภอ พยัคฆภูมิพิสัย มหาสารคาม 44110',
  },
  {
    icon: '/assets/images/school.png',
    title: 'โรงเรียนบ้านเหล่า',
    description: 'โทรศัพท์: 043 706 121 สำนักงานเขตพื้นที่การศึกษาประถมศึกษามหาสารคาม เขต 2.',
  },
];

const HomeMinimal = () => {
  const theme = useTheme();
  return (
    <Container
      maxWidth="xl"
      component={MotionViewport}
      sx={{
        py: { xs: 10 },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          textAlign: 'center',
          mb: { xs: 5 },
        }}
      >
        <m.div variants={varFade().inDown}>
          <Typography variant="h3">บ้านเหล่า</Typography>
        </m.div>
      </Stack>

      <Box
        gap={{ xs: 3, lg: 10 }}
        display="grid"
        alignItems="center"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          md: 'repeat(3, 1fr)',
        }}
      >
        {CARDS.map((card, index) => (
          <m.div variants={varFade().inUp} key={card.title}>
            <Card
              sx={{
                textAlign: 'center',
                boxShadow: { md: 'none' },
                bgcolor: 'background.default',
                p: (theme) => theme.spacing(6, 4),
                ...(index === 1 && {
                  boxShadow: (theme) => ({
                    md: `-40px 40px 80px ${
                      theme.palette.mode === 'light'
                        ? alpha(theme.palette.grey[500], 0.16)
                        : alpha(theme.palette.common.black, 0.4)
                    }`,
                  }),
                }),
              }}
            >
              <Box
                component="img"
                src={card.icon}
                alt={card.title}
                sx={{ mx: 'auto', width: 200, height: 200 }}
              />

              <Typography variant="h5" sx={{ mt: 6, mb: 2 }} color={theme.palette.primary.main}>
                {card.title}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', wordBreak: 'break-word' }}>
                {card.description}
              </Typography>
            </Card>
          </m.div>
        ))}
      </Box>
    </Container>
  );
};

export default HomeMinimal;
