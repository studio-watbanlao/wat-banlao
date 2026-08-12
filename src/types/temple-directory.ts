export type TempleDirectoryStatus = 'DRAFT' | 'PUBLIC';

export const TEMPLE_DIRECTORY_ENTRY_TYPES = [
  { value: 'CURRENT_ABBOT', label: 'เจ้าอาวาสปัจจุบัน' },
  { value: 'FORMER_ABBOT', label: 'อดีตเจ้าอาวาส' },
  { value: 'MONK', label: 'พระสงฆ์' },
  { value: 'NOVICE', label: 'สามเณร' },
] as const;

export type TempleDirectoryEntryType = (typeof TEMPLE_DIRECTORY_ENTRY_TYPES)[number]['value'];

export type TempleDirectoryEntry = {
  id: string;
  fullName: string;
  displayTitle: string;
  entryType: TempleDirectoryEntryType;
  termStart: string;
  termEnd: string;
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
