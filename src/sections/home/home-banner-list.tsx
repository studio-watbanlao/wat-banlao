import { useCallback } from 'react';

import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { alpha, SxProps, Theme, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';

import Carousel, { CarouselDots, useCarousel } from 'src/components/carousel';
import CustomPopover, { usePopover } from 'src/components/custom-popover';
import Iconify from 'src/components/iconify';

type ItemProps = {
  id: string;
  title: string;
  imageUrl: string;
};

type Props = {
  list: ItemProps[];
  sx?: SxProps<Theme>;
};

const HomeBannerList = ({ list, sx }: Props) => {
  const theme = useTheme();

  const carousel = useCarousel({
    fade: true,
    speed: 100,
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

  return (
    <Box
      sx={{
        position: 'relative',
        color: 'common.white',
        '.slick-slider, .slick-list, .slick-track, .slick-slide > div': {
          height: 1,
        },
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
        '&:after': {
          mx: 1,
          bottom: -8,
          opacity: 0.24,
        },
        ...sx,
      }}
    >
      <Carousel {...carousel.carouselSettings}>
        {list.map((card) => (
          <Stack
            sx={{
              ...bgGradient({
                color: alpha(theme.palette.grey[900], 0),
                imgUrl: card.imageUrl,
              }),
              height: { xs: 200, md: 550 },
              borderRadius: 2,
            }}
          >
            <CardItem key={card.id} card={card} />
          </Stack>
        ))}
      </Carousel>
    </Box>
  );
};

export default HomeBannerList;

type CardItemProps = {
  card: ItemProps;
};

function CardItem({ card }: CardItemProps) {
  const { id } = card;

  const popover = usePopover();

  const handleDelete = useCallback(() => {
    popover.onClose();
    console.info('DELETE', id);
  }, [id, popover]);

  const handleEdit = useCallback(() => {
    popover.onClose();
    console.info('EDIT', id);
  }, [id, popover]);

  return (
    <>
      <Stack justifyContent="space-between" sx={{ height: 1, p: 3 }}>
        {/* <IconButton
          color="inherit"
          onClick={popover.onOpen}
          sx={{
            top: 8,
            right: 8,
            zIndex: 9,
            opacity: 0.48,
            position: 'absolute',
            ...(popover.open && {
              opacity: 1,
            }),
          }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton> */}

        {/* <div>
          <Typography sx={{ mb: 2, typography: 'subtitle2', opacity: 0.48 }}>HASTAG</Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography sx={{ typography: 'h3' }}>TITLE</Typography>
          </Stack>
        </div> */}

        {/* <Stack direction="row" spacing={5}>
          <Stack spacing={1}>
            <Typography sx={{ typography: 'caption', opacity: 0.48 }}>View</Typography>
            <Typography sx={{ typography: 'subtitle1' }}>20K</Typography>
          </Stack>
          <Stack spacing={1}>
            <Typography sx={{ typography: 'caption', opacity: 0.48 }}>Valid Dates</Typography>
            <Typography sx={{ typography: 'subtitle1' }}>ss</Typography>
          </Stack>
        </Stack> */}
      </Stack>

      <CustomPopover open={popover.open} onClose={popover.onClose} sx={{ width: 140 }}>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>
      </CustomPopover>
    </>
  );
}
