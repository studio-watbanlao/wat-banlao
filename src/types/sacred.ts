export type SacredStatus = 'DRAFT' | 'PUBLIC';

export type SacredGalleryImage = {
  src: string;
  image: string;
  storagePath?: string;
};

export type SacredItem = {
  id: string;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  coverStoragePath?: string;
  images?: string | SacredGalleryImage[];
  content?: string;
  status: SacredStatus;
  view?: number;
  createdDate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SacredImagePayload = {
  name: string;
  type: string;
  base64: string;
};
