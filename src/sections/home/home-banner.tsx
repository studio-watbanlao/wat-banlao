import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import Carousel, { CarouselDots, useCarousel } from 'src/components/carousel';
import Image from 'src/components/image';

type Props = {
  data: {
    id: string;
    title: string;
    imageUrl: string;
    description: string;
  }[];
};

const HomeBanner = ({ data }: Props) => {
  const theme = useTheme();

  const carousel = useCarousel({
    autoplay: true,
    ...CarouselDots({
      rounded: true,
      sx: { mt: 3 },
    }),
  });

  return (
    <Box
      sx={{
        position: 'relative',
        '& .slick-list': {
          boxShadow: theme.customShadows.z16,
        },
      }}
    >
      <Carousel ref={carousel.carouselRef} {...carousel.carouselSettings}>
        {data.map((item) => (
          <CarouselItem key={item.id} item={item} />
        ))}
      </Carousel>
    </Box>
  );
};

export default HomeBanner;

// ----------------------------------------------------------------------

type CarouselItemProps = {
  title: string;
  description: string;
  imageUrl: string;
};

const CarouselItem = ({ item }: { item: CarouselItemProps }) => {
  const { imageUrl, title } = item;

  return <Image alt={title} src={imageUrl} ratio="21/9" sx={{ height: '650px' }} />;
};
