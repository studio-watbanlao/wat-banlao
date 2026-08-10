import { Stack, Typography } from '@mui/material';
import DharmaList from '../dharma-list';

const DharmaView = () => {
  return (
    <Stack>
      <Typography align="center" sx={{ color: 'text.secondary' }}>
        วัดบ้านเหล่า - สุขธัมมาราม
      </Typography>
      <Typography variant="h3" align="center" sx={{ mb: 2 }}>
        ธรรมะ
      </Typography>

      <DharmaList />
    </Stack>
  );
};

export default DharmaView;
