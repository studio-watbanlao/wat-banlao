import Card from '@mui/material/Card';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import { Box, Button, Stack } from '@mui/material';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { TruncatedTypography } from 'src/components/typography';

type SacredItemProps = {
  data: any;
  hide?: boolean;
};

const SacredItem = ({ data, hide }: SacredItemProps) => {
  const theme = useTheme();

  const mdUp = useResponsive('up', 'md');
  const linkTo = paths.parents.sacred.details(data?.id);

  const { imageUrl, id, title, year } = data;

  return (
    <Card key={id} sx={{ p: 1, textAlign: 'center' }}>
      <Typography variant="caption" sx={{ mb: 2.5, color: 'text.secondary' }}>
        {year || 2020}
      </Typography>

      <TruncatedTypography variant="subtitle1" sx={{ mb: 0.5 }}>
        {title || 'Title'}
      </TruncatedTypography>

      <Box>
        <Image alt={title} src={imageUrl} ratio={'3/4'} sx={{ borderRadius: 2 }} />
      </Box>

      {!hide && (
        <Stack alignItems="flex-end" mt={1}>
          <Button
            color="inherit"
            size="small"
            rel="noopener"
            href={paths.parents.sacred.details(id)}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          >
            ดูเพิ่มเติม
          </Button>
        </Stack>
      )}
    </Card>
  );
};

export default SacredItem;
