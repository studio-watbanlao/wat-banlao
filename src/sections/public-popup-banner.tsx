'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import type { PopupBannerItem } from 'src/types/popup-banner';
import axios from 'src/utils/axios';

const getStorageKey = (popupBanner: PopupBannerItem) =>
  `wat-popup-banner:${popupBanner.id}:${popupBanner.updatedAt}`;

const getLocalDay = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
};

const shouldOpen = (popupBanner: PopupBannerItem) => {
  if (popupBanner.displayFrequency === 'EVERY_VISIT') return true;
  const key = getStorageKey(popupBanner);
  try {
    if (popupBanner.displayFrequency === 'ONCE_PER_SESSION') {
      return sessionStorage.getItem(key) !== 'shown';
    }
    return localStorage.getItem(key) !== getLocalDay();
  } catch {
    return true;
  }
};

const rememberShown = (popupBanner: PopupBannerItem) => {
  const key = getStorageKey(popupBanner);
  try {
    if (popupBanner.displayFrequency === 'ONCE_PER_SESSION') {
      sessionStorage.setItem(key, 'shown');
    }
    if (popupBanner.displayFrequency === 'ONCE_PER_DAY') {
      localStorage.setItem(key, getLocalDay());
    }
  } catch {
    // Storage may be unavailable in privacy mode; the popup can still be displayed.
  }
};

export function PublicPopupBanner() {
  const [open, setOpen] = useState(false);
  const [loadedBannerId, setLoadedBannerId] = useState('');
  const { data: temple } = usePublicTemple();
  const { data: popupBanner } = useQuery({
    queryKey: ['public-popup-banner', temple?.id],
    queryFn: async () => {
      const response = await axios.get('/api/public/popup-banner');
      return (response.data.popupBanner || null) as PopupBannerItem | null;
    },
    staleTime: 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!popupBanner || !shouldOpen(popupBanner)) return;
    setOpen(true);
  }, [popupBanner]);

  const handleImageLoaded = useCallback(() => {
    if (!popupBanner || loadedBannerId === popupBanner.id) return;
    rememberShown(popupBanner);
    setLoadedBannerId(popupBanner.id);
  }, [loadedBannerId, popupBanner]);

  if (!popupBanner) return null;

  const bannerImage = (
    <Image
      src={popupBanner.imageUrl}
      alt={popupBanner.title}
      ratio="1/1"
      visibleByDefault
      disabledEffect
      afterLoad={handleImageLoaded}
      sx={{
        width: 600,
        maxWidth: 1,
        bgcolor: 'background.paper',
        '& img': { objectFit: 'contain' },
      }}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            width: 'min(600px, 92vw, 82vh)',
            height: 'min(600px, 92vw, 82vh)',
            maxWidth: 'none',
            maxHeight: 'none',
            m: 2,
            overflow: 'visible',
            borderRadius: 2,
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        },
      }}
    >
      <Box
        sx={{
          width: 1,
          height: 1,
          aspectRatio: '1 / 1',
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 2,
        }}
      >
        {popupBanner.linkUrl ? (
          <Box
            component="a"
            href={popupBanner.linkUrl}
            target={popupBanner.linkUrl.startsWith('http') ? '_blank' : undefined}
            rel={popupBanner.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
            aria-label={`เปิดรายละเอียด ${popupBanner.title}`}
            onClick={() => setOpen(false)}
            sx={{ display: 'block' }}
          >
            {bannerImage}
          </Box>
        ) : (
          bannerImage
        )}
        <IconButton
          aria-label="ปิด Popup Banner"
          onClick={() => setOpen(false)}
          sx={{
            top: 12,
            right: 12,
            position: 'absolute',
            color: 'common.white',
            bgcolor: 'rgba(0,0,0,0.58)',
            '&:hover': { bgcolor: 'rgba(0,0,0,0.78)' },
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>
    </Dialog>
  );
}
