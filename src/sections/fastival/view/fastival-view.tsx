'use client';

import { Stack, Typography } from '@mui/material';
import { useGetFastival } from 'src/queries/fastival';
import FastivalList from '../fastival-list';

const FastivalView = () => {
  const { data = [] } = useGetFastival();

  return (
    <Stack>
      <Stack textAlign={'center'} spacing={2} mb={5}>
        <Typography component="div" variant="subtitle2" sx={{ color: 'text.disabled' }}>
          กิจกรรมประจำปี
        </Typography>
        <Typography align="center" variant="h3">
          เทศกาลงานบุญวัดบ้านเหล่า
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          วัดบ้านเหล่า-สุขธัมมาราม ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม
        </Typography>
      </Stack>
      <FastivalList data={data} />
    </Stack>
  );
};

export default FastivalView;
