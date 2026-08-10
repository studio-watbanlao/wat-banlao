export type FestivalStatus = 'DRAFT' | 'PUBLIC';

export type FestivalGalleryImage = {
  src: string;
  image: string;
  storagePath?: string;
};

export type FestivalItem = {
  id: string;
  title: string;
  year: string;
  no: string;
  description: string;
  imageUrl: string;
  coverStoragePath?: string;
  images?: string | FestivalGalleryImage[];
  content?: string;
  videoUrl?: string;
  openingUrl?: string;
  logoUrl?: string;
  status: FestivalStatus;
  view?: number;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type FestivalImagePayload = {
  name: string;
  type: string;
  base64: string;
};
