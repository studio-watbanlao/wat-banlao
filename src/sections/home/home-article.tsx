import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { m } from 'framer-motion';

import { Container } from '@mui/material';
import { MotionViewport, varFade } from 'src/components/animate';
import Iconify from 'src/components/iconify';
import { useGetActivity } from 'src/queries/activity';
import { paths } from 'src/routes/paths';
import ActivityItem from '../activity/activity-item';

const MAX_ITEMS = 3;

const HomeArticle = () => {
  const { data = [] } = useGetActivity();

  if (!data.length) return null;

  const displayItems = data.slice(0, MAX_ITEMS);
  const hasMore = data.length > MAX_ITEMS;

  return (
    <Box
      sx={{
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <Container component={MotionViewport} sx={{ py: 10 }}>
        <Stack spacing={2} sx={{ mb: 5, textAlign: 'center' }}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h3">กิจกรรม</Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ color: 'text.secondary' }}>
              กิจกรรมต่างๆที่เกิดขึ้นภายในวัดบ้านเหล่า ซึ่งส่วนใหญ่จัดตามฮีตสิบสอง คองสิบสี่
            </Typography>
          </m.div>
        </Stack>

        <Grid container spacing={3}>
          {displayItems.map((item: any) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ActivityItem data={item} />
            </Grid>
          ))}
        </Grid>

        {hasMore && (
          <Stack sx={{ justifyContent: 'center', mt: 3 }}>
            <Button
              size="large"
              color="inherit"
              variant="outlined"
              endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={24} />}
              sx={{ mx: 'auto' }}
              href={paths.activity.root}
            >
              ดูทั้งหมด
            </Button>
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default HomeArticle;
