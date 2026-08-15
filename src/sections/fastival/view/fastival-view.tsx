'use client';

import { Stack, Typography } from '@mui/material';

import FastivalList from '../fastival-list';

import { useGetFastival } from 'src/queries/fastival';
import { usePublicTemple } from 'src/hooks/use-public-temple';

const FastivalView = () => {
  const { data = [] } = useGetFastival();
  const { data: temple } = usePublicTemple();
  const address = temple?.branding.contact?.address;

  return (
    <Stack>
      <Stack textAlign={'center'} spacing={2} mb={5}>
        <Typography component="div" variant="subtitle2" sx={{ color: 'text.disabled' }}>
          กิจกรรมประจำปี
        </Typography>
        <Typography align="center" variant="h3">
          เทศกาลและงานประเพณีของ{temple?.name || 'วัด'}
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          {typeof address === 'string' ? address : ''}
        </Typography>
      </Stack>
      <FastivalList data={data} />
    </Stack>
  );
};

export default FastivalView;
