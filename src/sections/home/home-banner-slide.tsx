import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import TextMaxLine from 'src/components/text-max-line';
import Carousel, { useCarousel, CarouselArrows } from 'src/components/carousel';
import { Button, Container, Stack, Typography } from '@mui/material';

type Props = {
  data: {
    id: string;
    title: string;
    coverUrl: string;
    description: string;
  }[];
};

export default function CarouselCenterMode({ data }: Props) {
  const carousel = useCarousel({
    slidesToShow: 3,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 2 },
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, centerPadding: '0' },
      },
    ],
  });

  return (
    <Stack sx={{ px: '10%', py: 6 }}>
      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h3" sx={{ py: 2 }}>
            กิจกรรมต่างๆ
          </Typography>
          <Button
            color="inherit"
            size="large"
            variant="outlined"
            rel="noopener"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          >
            อ่านเพิ่มเติม
          </Button>
        </Stack>
        <CarouselArrows filled onNext={carousel.onNext} onPrev={carousel.onPrev}>
          <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
            {data?.slice(0, 6).map((item) => (
              <Box key={item.id} sx={{ px: 1 }}>
                <CarouselItem item={item} />
              </Box>
            ))}
          </Carousel>
        </CarouselArrows>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type CarouselItemProps = {
  item: {
    title: string;
    description: string;
    coverUrl: string;
  };
};

function CarouselItem({ item }: CarouselItemProps) {
  const theme = useTheme();

  const { coverUrl, title } = item;

  return (
    <Paper
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Image alt={title} src={coverUrl} ratio="4/3" />

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
            startColor: `${alpha(theme.palette.common.white, 0.8)} 30%`,
            endColor: `${alpha(theme.palette.common.white, 0)} 100%`,
          }),
        }}
      >
        <TextMaxLine variant="h4" sx={{ mb: 2 }}>
          {title}
        </TextMaxLine>

        <Link
          color="inherit"
          variant="overline"
          sx={{
            opacity: 0.72,
            alignItems: 'center',
            display: 'inline-flex',
            transition: theme.transitions.create(['opacity']),
            '&:hover': { opacity: 1 },
          }}
        >
          learn More
          <Iconify icon="eva:arrow-forward-fill" width={16} sx={{ ml: 1 }} />
        </Link>
      </CardContent>
    </Paper>
  );
}
