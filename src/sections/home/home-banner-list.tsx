import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import NextImage, { ImageLoaderProps } from 'next/image';

import Carousel, { CarouselDots, useCarousel } from 'src/components/carousel';
import type { BannerItem } from 'src/types/banner';

type Props = {
  list: BannerItem[];
  sx?: SxProps<Theme>;
};

const passthroughLoader = ({ src }: ImageLoaderProps) => src;

const HomeBannerList = ({ list, sx }: Props) => {
  const carousel = useCarousel({
    fade: true,
    speed: 500,
    autoplay: true,
    ...CarouselDots({
      sx: {
        right: 16,
        bottom: 16,
        position: 'absolute',
        color: 'white',
      },
    }),
  });

  if (!list.length) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        color: 'common.white',
        '.slick-slider, .slick-list, .slick-track, .slick-slide > div': { height: 1 },
        '&:before, &:after': {
          left: 0,
          mx: 2.5,
          right: 0,
          zIndex: -2,
          height: 200,
          bottom: -16,
          content: "''",
          opacity: 0.07,
          borderRadius: 2,
          bgcolor: 'grey.400',
          position: 'absolute',
        },
        '&:after': { mx: 1, bottom: -8, opacity: 0.24 },
        ...sx,
      }}
    >
      <Carousel {...carousel.carouselSettings}>
        {list.map((banner, index) => {
          const desktopImage = banner.desktopImageUrl || banner.imageUrl;
          const mobileImage = banner.mobileImageUrl || desktopImage;

          if (!desktopImage || !mobileImage) return null;

          return (
            <Box
              key={banner.id}
              component={banner.linkUrl ? 'a' : 'div'}
              href={banner.linkUrl || undefined}
              aria-label={banner.linkUrl ? banner.title : undefined}
              sx={{
                display: 'block',
                position: 'relative',
                overflow: 'hidden',
                height: { xs: 280, md: 550 },
                borderRadius: 2,
                backgroundColor: 'grey.200',
                textDecoration: 'none',
              }}
            >
              <Box sx={{ position: 'absolute', inset: 0, display: { xs: 'block', md: 'none' } }}>
                <NextImage
                  loader={passthroughLoader}
                  src={mobileImage}
                  alt={banner.title}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
              <Box sx={{ position: 'absolute', inset: 0, display: { xs: 'none', md: 'block' } }}>
                <NextImage
                  loader={passthroughLoader}
                  src={desktopImage}
                  alt={banner.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  style={{ objectFit: 'cover' }}
                />
              </Box>
            </Box>
          );
        })}
      </Carousel>
    </Box>
  );
};

export default HomeBannerList;
