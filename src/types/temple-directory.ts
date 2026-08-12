export type TempleDirectoryStatus = 'DRAFT' | 'PUBLIC';

export type TempleDirectoryEntry = {
  id: string;
  fullName: string;
  displayTitle: string;
  imageUrl: string;
  imageStoragePath?: string;
  birth: string;
  age: string;
  ordination: string;
  vassa: string;
  templeName: string;
  province: string;
  affiliation: string;
  education: string;
  honoraryAwards: string;
  administrativePositions: string;
  monasticRank: string;
  biography: string;
  sources: string;
  sortOrder: number;
  status: TempleDirectoryStatus;
  createdAt: string;
  updatedAt?: string;
};

export type TempleDirectoryImagePayload = {
  name: string;
  type: string;
  base64: string;
};
