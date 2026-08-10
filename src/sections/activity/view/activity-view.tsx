'use client';

import { Stack, Typography } from '@mui/material';
import ActivityList from '../activity-list';

const ActivityView = () => {
  return (
    <Stack>
      <Stack mb={3}>
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          วัดบ้านเหล่า - สุขธัมมาราม
        </Typography>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          กิจกรรม และข่าวสาร
          <br /> {`ภายใน วัด โรงเรียน ชุมชนบ้านเหล่า`}
        </Typography>
      </Stack>
      <ActivityList />
    </Stack>
  );
};

export default ActivityView;
