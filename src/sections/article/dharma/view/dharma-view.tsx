import { Stack, Typography } from '@mui/material';

import DharmaList from '../dharma-list';

import { usePublicTemple } from 'src/hooks/use-public-temple';

const DharmaView = () => {
  const { data: temple } = usePublicTemple();

  return (
    <Stack>
      <Typography align="center" sx={{ color: 'text.secondary' }}>
        {temple?.name || ''}
      </Typography>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        ธรรมะ
      </Typography>

      <DharmaList />
    </Stack>
  );
};

export default DharmaView;
