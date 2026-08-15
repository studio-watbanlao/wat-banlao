'use client';

import { Stack, Typography } from '@mui/material';

import ActivityList from '../activity-list';

import { usePublicTemple } from 'src/hooks/use-public-temple';

const ActivityView = () => {
  const { data: temple } = usePublicTemple();
  const templeName = temple?.name || '';

  return (
    <Stack>
      <Stack mb={3}>
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          {templeName}
        </Typography>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          กิจกรรม และข่าวสาร
          <br /> ของ{templeName}
        </Typography>
      </Stack>
      <ActivityList />
    </Stack>
  );
};

export default ActivityView;
