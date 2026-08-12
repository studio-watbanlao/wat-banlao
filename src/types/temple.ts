export const TEMPLE_MODULES = [
  'dashboard',
  'pages',
  'banners',
  'activities',
  'architectures',
  'directory',
  'community_leaders',
  'festivals',
  'blogs',
  'dharmas',
  'contacts',
  'sacred',
  'branding',
  'members',
  'domains',
] as const;

export type TempleModule = (typeof TEMPLE_MODULES)[number];
export const TEMPLE_CONTRIBUTOR_MODULES: readonly TempleModule[] = [
  'activities',
  'architectures',
  'festivals',
  'blogs',
  'dharmas',
  'sacred',
];
export type TempleAction = 'read' | 'create' | 'update' | 'delete' | 'publish';
export type TempleStatus = 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
export type TempleMemberRole = 'temple_admin' | 'temple_editor' | 'temple_contributor';
export type TemplePermissions = Partial<Record<TempleModule, TempleAction[]>>;

export type TempleBranding = {
  logoUrl: string;
  loginBackgroundUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  adminTemplate: string;
  publicTemplate: string;
  contact: Record<string, unknown>;
};

export type TempleDomain = {
  id: string;
  domain: string;
  isPrimary: boolean;
  ownership: 'TEMPLE' | 'PLATFORM';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  registrar?: string;
  expiresAt?: string;
};

export type Temple = {
  id: string;
  slug: string;
  name: string;
  status: TempleStatus;
  settings: Record<string, unknown>;
  branding: TempleBranding;
  modules: Record<TempleModule, boolean>;
  domains: TempleDomain[];
};

export type TempleAccess = {
  temple: Temple;
  role: TempleMemberRole | 'super_admin';
  permissions: TemplePermissions;
};

export type TempleInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export type TempleInvitation = {
  id: string;
  templeId: string;
  templeName?: string;
  email: string;
  role: Extract<TempleMemberRole, 'temple_editor' | 'temple_contributor'>;
  permissions: TemplePermissions;
  status: TempleInvitationStatus;
  deliveryStatus: 'PENDING' | 'SENT' | 'ACCOUNT_EXISTS' | 'FAILED';
  expiresAt: string;
  createdAt: string;
};
