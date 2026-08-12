export type TemplePageStatus = 'DRAFT' | 'PUBLIC' | 'ARCHIVED';
export type TemplePageType = 'SYSTEM' | 'CUSTOM';
export type TemplePageTemplate = 'default' | 'landing' | 'biography';

export type TemplePage = {
  id: string;
  pageKey: string;
  slug: string;
  pageType: TemplePageType;
  templateKey: TemplePageTemplate;
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
