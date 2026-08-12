export const COMMUNITY_VILLAGES = [
  { key: 'lao-nong-kham', name: 'บ้านเหล่าหนองขาม' },
  { key: 'lao-nai', name: 'บ้านเหล่าใน' },
  { key: 'lao-don-khaen', name: 'บ้านเหล่าดอนแคน' },
  { key: 'lao-ngio', name: 'บ้านเหล่างิ้ว' },
  { key: 'ma-hep', name: 'บ้านมะเห็บ' },
  { key: 'non-samran', name: 'บ้านโนนสำราญ' },
] as const;

export const COMMUNITY_LEADER_GROUPS = [
  { value: 'village-head', label: 'ผู้ใหญ่บ้าน' },
  { value: 'assistant', label: 'ผู้ช่วยผู้ใหญ่บ้าน' },
  { value: 'council', label: 'สมาชิกสภา อบต.' },
  { value: 'other', label: 'ตำแหน่งอื่น' },
] as const;

export type CommunityVillageKey = (typeof COMMUNITY_VILLAGES)[number]['key'];
export type CommunityLeaderGroup = (typeof COMMUNITY_LEADER_GROUPS)[number]['value'];
export type CommunityLeaderStatus = 'DRAFT' | 'PUBLIC';

export type CommunityLeader = {
  id: string;
  villageKey: CommunityVillageKey;
  villageName: string;
  fullName: string;
  role: string;
  responsibility: string;
  phone: string;
  imageUrl: string;
  imageStoragePath?: string;
  group: CommunityLeaderGroup;
  sortOrder: number;
  status: CommunityLeaderStatus;
  createdAt: string;
  updatedAt?: string;
};

export type CommunityLeaderImagePayload = {
  name: string;
  type: string;
  base64: string;
};
