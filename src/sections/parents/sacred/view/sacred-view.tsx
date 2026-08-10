'use client';

import { Stack, Typography } from '@mui/material';
import SacredList from '../sacred-list';

const SacredView = () => {
  return (
    <Stack mb={5}>
      <Stack mb={3}>
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          วัดบ้านเหล่า - สุขธัมมาราม
        </Typography>
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          วัตถุมงคล
        </Typography>
      </Stack>
      <SacredList />
    </Stack>
  );
};

export default SacredView;
