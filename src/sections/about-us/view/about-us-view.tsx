'use client';

import { Card, Grid, Stack } from '@mui/material';
import { useResponsive } from 'src/hooks/use-responsive';
import ContactHero from '../contact-hero';

const AboutUsView = () => {
  const mdUp = useResponsive('up', 'md');
  return (
    <Stack>
      <Grid container spacing={5}>
        <Grid size={12}>
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
    </Stack>
  );
};

export default AboutUsView;
