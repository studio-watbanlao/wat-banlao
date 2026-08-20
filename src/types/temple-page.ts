export type TemplePageStatus = 'DRAFT' | 'PUBLIC' | 'ARCHIVED';
export type TemplePageType = 'SYSTEM' | 'CUSTOM';

export type TemplePage = {
  id: string;
  pageKey: string;
  slug: string;
  pageType: TemplePageType;
  title: string;
  eyebrow: string;
  excerpt: string;
  content: string;
  heroImageUrl: string;
  heroStoragePath: string;
  status: TemplePageStatus;
  showInMenu: boolean;
  sortOrder: number;
  seoTitle: string;
  seoDescription: string;
  useLegacyContent: boolean;
  createdAt: string;
  updatedAt: string;
};
