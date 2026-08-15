'use client';

import { Stack, Typography } from '@mui/material';

import SacredList from '../sacred-list';

import { usePublicTemple } from 'src/hooks/use-public-temple';

const SacredView = () => {
  const { data: temple } = usePublicTemple();

  return (
    <Stack mb={5}>
      <Stack mb={3}>
        <Typography align="center" sx={{ color: 'text.secondary' }}>
          {temple?.name || ''}
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
