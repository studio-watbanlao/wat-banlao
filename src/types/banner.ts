export type BannerStatus = 'DRAFT' | 'PUBLIC';

export type BannerItem = {
  id: string;
  title: string;
  desktopImageUrl?: string;
  mobileImageUrl?: string;
  imageUrl?: string;
  desktopStoragePath?: string;
  mobileStoragePath?: string;
  linkUrl?: string;
  sortOrder: number;
  status: BannerStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type BannerImagePayload = {
  name: string;
  type: string;
  base64: string;
};
