export type EditorialStatus = 'DRAFT' | 'PUBLIC';

export type EditorialResource = 'blog' | 'dharma';

export type EditorialItem = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  imageUrl: string;
  coverStoragePath?: string;
  author?: string;
  authorImageUrl?: string;
  createdDate?: string;
  status: EditorialStatus;
  view?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type EditorialImagePayload = {
  name: string;
  type: string;
  base64: string;
};
