export type ActivityStatus = 'DRAFT' | 'PUBLIC';
export type ActivityType = 'temple' | 'community' | 'school';

export type ActivityGalleryImage = {
  src: string;
  image: string;
  storagePath?: string;
};

export type ActivityItem = {
  id: string;
  title: string;
  type?: ActivityType;
  description: string;
  imageUrl: string;
  coverStoragePath?: string;
  images?: string | ActivityGalleryImage[];
  content?: string;
  status: ActivityStatus;
  view: number;
  createdDate?: string;
  createdAt: string;
  updatedAt?: string;
};

export type ActivityImagePayload = {
  name: string;
  type: string;
  base64: string;
};
