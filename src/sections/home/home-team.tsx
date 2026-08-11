import { m } from 'framer-motion';
import { useMemo } from 'react';

import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { Grid } from '@mui/material';
import { MotionViewport, varFade } from 'src/components/animate';
import { useCarousel } from 'src/components/carousel';
import Iconify from 'src/components/iconify';
import { useGetSacred } from 'src/queries/sacred';
import { paths } from 'src/routes/paths';
import SacredItem from '../parents/sacred/sacred-item';

// ----------------------------------------------------------------------

const SLIDES_DEFAULT = 4;

export default function HomeTeam() {
  const { data = [], isLoading } = useGetSacred();

  const displayItems = data.slice(0, SLIDES_DEFAULT);

  const slidesToShow = useMemo(() => {
    if (data.length < SLIDES_DEFAULT) return data.length || 1;
    return SLIDES_DEFAULT;
  }, [data.length]);

  const carousel = useCarousel({
    infinite: data.length > SLIDES_DEFAULT,
    slidesToShow,
    responsive: [
      {
        breakpoint: 1279,
        settings: { slidesToShow: Math.min(3, slidesToShow) },
      },
      {
        breakpoint: 959,
        settings: { slidesToShow: Math.min(2, slidesToShow) },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1 },
      },
    ],
  });

  if (data?.length === 0) return;

  return (
    <Container component={MotionViewport} sx={{ textAlign: 'center', py: { xs: 10, md: 15 } }}>
      {/* Header */}
      <m.div variants={varFade().inDown}>
        <Typography variant="overline" sx={{ color: 'text.disabled' }}>
          วัตถุมงคล
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography variant="h3" sx={{ my: 1 }}>
          หลวงปู่สาธุ์ สุขธมฺโม
        </Typography>
      </m.div>

      <m.div variants={varFade().inUp}>
        <Typography sx={{ mx: 'auto', maxWidth: 640, color: 'text.secondary' }}>
          วัดบ้านเหล่า - สุขธัมมาราม
        </Typography>
      </m.div>

      {/* Carousel */}
      <Grid container spacing={3} mt={2}>
        {displayItems.map((item: any) => (
          <Grid key={item.id} size={{ xs: 12, sm: 6, md: 3 }}>
            <SacredItem data={item} />
          </Grid>
        ))}
      </Grid>

      {/* View All */}
      {data.length > SLIDES_DEFAULT && (
        <Button
          size="large"
          color="inherit"
          variant="outlined"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={24} />}
          sx={{ mt: 3 }}
          href={paths.parents.sacred.root}
        >
          ดูทั้งหมด
        </Button>
      )}
    </Container>
  );
}
