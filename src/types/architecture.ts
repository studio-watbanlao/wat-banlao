export type ArchitectureStatus = 'DRAFT' | 'PUBLIC';
export type ArchitectureGalleryImage = { src: string; image: string; storagePath?: string };

export type ArchitectureItem = {
  id: string;
  title: string;
  year: string;
  description: string;
  imageUrl: string;
  coverStoragePath?: string;
  images?: string | ArchitectureGalleryImage[];
  content?: string;
  videoUrl?: string;
  logoUrl?: string;
  openingUrl?: string;
  status: ArchitectureStatus;
  view: number;
  createdDate?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ArchitectureImagePayload = { name: string; type: string; base64: string };
