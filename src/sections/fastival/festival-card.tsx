// ----------------------------------------------------------------------

import {
  alpha,
  Box,
  Button,
  CardContent,
  Paper,
  Stack,
  StackProps,
  Typography,
  useTheme,
} from '@mui/material';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { paths } from 'src/routes/paths';
import { bgGradient } from 'src/theme/css';

type FestivalCardProps = StackProps & {
  item: {
    id: string;
    title: string;
    coverUrl: string;
    description: string;
    year: string;
    no: string;
    imageUrl: string;
  };
};

const FestivalCard = ({ item, sx, ...other }: FestivalCardProps) => {
  const theme = useTheme();
  const { id, title, no, imageUrl, description, year } = item;

  return (
    <Stack
      spacing={3}
      sx={{
        p: 5,
        borderLeft: (theme) => `dashed 1px ${theme.palette.divider}`,
        borderRight: (theme) => `dashed 1px ${theme.palette.divider}`,
        borderBottom: (theme) => `dashed 1px ${theme.palette.divider}`,
      }}
      {...other}
    >
      <Stack spacing={1}>
        <Typography variant="overline" component="div" sx={{ color: 'text.disabled' }}>
          ครั้งที่ {no}
        </Typography>
        <Box sx={{ position: 'relative' }}>
          <Typography variant="h4">ประจำปี {year}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {description}
        </Typography>
      </Stack>
      <Paper
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Image alt={'title'} src={imageUrl} ratio="4/3" />

        <CardContent
          sx={{
            bottom: 0,
            zIndex: 9,
            width: '100%',
            textAlign: 'left',
            position: 'absolute',
            color: 'common.white',
            ...bgGradient({
              direction: 'to top',
              startColor: `${alpha(theme.palette.primary.main, 0.3)} 20%`,
              endColor: `${alpha(theme.palette.primary.light, 0)} 100%`,
            }),
          }}
        />
      </Paper>

      <Stack alignItems="flex-end">
        <Button
          color="inherit"
          size="small"
          rel="noopener"
          href={paths.fastival.details(id)}
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
        >
          ดูเพิ่มเติม
        </Button>
      </Stack>
    </Stack>
  );
};

export default FestivalCard;
