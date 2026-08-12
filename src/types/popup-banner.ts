export type PopupBannerStatus = 'DRAFT' | 'PUBLIC';
export type PopupBannerFrequency = 'EVERY_VISIT' | 'ONCE_PER_SESSION' | 'ONCE_PER_DAY';

export type PopupBannerItem = {
  id: string;
  title: string;
  imageUrl: string;
  storagePath: string;
  linkUrl: string;
  displayFrequency: PopupBannerFrequency;
  startsAt: string;
  endsAt: string;
  sortOrder: number;
  status: PopupBannerStatus;
  createdAt: string;
  updatedAt: string;
};

export type PopupBannerImagePayload = {
  name: string;
  type: string;
  base64: string;
};
