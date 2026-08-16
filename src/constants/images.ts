import type { SyntheticEvent } from 'react';

export const DEFAULT_CONTENT_IMAGE = '/assets/background/overlay_4.jpg';

export const DEFAULT_OG_IMAGE =
  'https://res.cloudinary.com/dkdbilwtj/image/upload/v1773064365/Cover_hwhbvp.png';

export const resolveContentImage = (value?: string | null) =>
  value?.trim() || DEFAULT_CONTENT_IMAGE;

export const applyDefaultContentImage = (event: SyntheticEvent<Element>) => {
  const image = event.currentTarget as HTMLImageElement;

  if (!image.src.endsWith(DEFAULT_CONTENT_IMAGE)) {
    image.srcset = '';
    image.src = DEFAULT_CONTENT_IMAGE;
  }
};
