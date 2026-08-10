import { useEffect } from 'react';

import { Avatar, Box } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import Carousel, { CarouselArrowIndex, useCarousel } from 'src/components/carousel';
import Image from 'src/components/image';
import { bgGradient } from 'src/theme/css';

const THUMB_SIZE = 64;

type ActivityImageCarouselProps = {
  data: any;
};

const ActivityImageCarousel = ({ data }: ActivityImageCarouselProps) => {
  const theme = useTheme();

  const slides = JSON.parse(data?.images);

  const carouselLarge = useCarousel({
    rtl: false,
    draggable: false,
    adaptiveHeight: true,
  });

  const carouselThumb = useCarousel({
    rtl: false,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    variableWidth: true,
    centerPadding: '0px',
    slidesToShow: slides?.length > 3 ? 3 : slides?.length,
  });

  useEffect(() => {
    carouselLarge.onSetNav();
    carouselThumb.onSetNav();
  }, [carouselLarge, carouselThumb]);

  return (
    <Box
      sx={{
        '& .slick-slide': {
          float: theme.direction === 'rtl' ? 'right' : 'left',
        },
      }}
    >
      <Box
        sx={{
          mb: 3,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Carousel
          {...carouselLarge.carouselSettings}
          asNavFor={carouselThumb.nav}
          ref={carouselLarge.carouselRef}
        >
          {slides?.map((slide: any) => (
            <Image
              key={slide.src}
              alt={slide.src}
              src={slide.image}
              ratio="16/9"
              sx={{ cursor: 'zoom-in' }}
            />
          ))}
        </Carousel>

        <CarouselArrowIndex
          index={carouselLarge.currentIndex}
          total={slides?.length}
          onNext={carouselThumb.onNext}
          onPrev={carouselThumb.onPrev}
        />
      </Box>

      <StyledThumbnailsContainer length={slides?.length}>
        <Carousel
          {...carouselThumb.carouselSettings}
          asNavFor={carouselLarge.nav}
          ref={carouselThumb.carouselRef}
        >
          {slides?.map((item: any, index: any) => (
            <Box key={item.src} sx={{ px: 0.5 }}>
              <Avatar
                key={item.src}
                alt={item.src}
                src={item.image}
                variant="rounded"
                sx={{
                  width: THUMB_SIZE,
                  height: THUMB_SIZE,
                  opacity: 0.48,
                  cursor: 'pointer',
                  ...(carouselLarge.currentIndex === index && {
                    opacity: 1,
                    border: `solid 2.5px ${theme.palette.primary.light}`,
                  }),
                }}
              />
            </Box>
          ))}
        </Carousel>
      </StyledThumbnailsContainer>
    </Box>
  );
};

export default ActivityImageCarousel;

const StyledThumbnailsContainer = styled('div')<{ length: number }>(({ length, theme }) => ({
  position: 'relative',
  margin: theme.spacing(0, 'auto'),
  '& .slick-slide': {
    lineHeight: 0,
  },

  ...(length === 1 && {
    maxWidth: THUMB_SIZE * 1 + 16,
  }),

  ...(length === 2 && {
    maxWidth: THUMB_SIZE * 2 + 32,
  }),

  ...((length === 3 || length === 4) && {
    maxWidth: THUMB_SIZE * 3 + 48,
  }),

  ...(length >= 5 && {
    maxWidth: THUMB_SIZE * 6,
  }),

  ...(length > 3 && {
    '&:before, &:after': {
      ...bgGradient({
        direction: 'to left',
        startColor: `${alpha(theme.palette.background.default, 0)} 0%`,
        endColor: `${theme.palette.background.default} 100%`,
      }),
      top: 0,
      zIndex: 9,
      content: "''",
      height: '100%',
      position: 'absolute',
      width: (THUMB_SIZE * 2) / 3,
    },
    '&:after': {
      right: 0,
      transform: 'scaleX(-1)',
    },
  }),
}));
