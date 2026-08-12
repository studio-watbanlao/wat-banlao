import type { SyntheticEvent } from 'react';

export const DEFAULT_CONTENT_IMAGE = '/assets/background/overlay_4.jpg';

export const resolveContentImage = (value?: string | null) =>
  value?.trim() || DEFAULT_CONTENT_IMAGE;

export const applyDefaultContentImage = (event: SyntheticEvent<Element>) => {
  const image = event.currentTarget as HTMLImageElement;

  if (!image.src.endsWith(DEFAULT_CONTENT_IMAGE)) {
    image.srcset = '';
    image.src = DEFAULT_CONTENT_IMAGE;
  }
};
