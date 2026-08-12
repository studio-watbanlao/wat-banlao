'use client';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import type { PopupBannerItem } from 'src/types/popup-banner';
import axios from 'src/utils/axios';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

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
    rememberShown(popupBanner);
    setOpen(true);
  }, [popupBanner]);

  if (!popupBanner) return null;

  const bannerImage = (
    <Image
      src={popupBanner.imageUrl}
      alt={popupBanner.title}
      ratio="1/1"
      sx={{ width: 1, maxHeight: 'min(78vh, 760px)', '& img': { objectFit: 'contain' } }}
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
            width: 'auto',
            maxWidth: 'min(92vw, 760px)',
            m: 2,
            overflow: 'visible',
            borderRadius: 2,
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        },
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden', borderRadius: 2 }}>
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
