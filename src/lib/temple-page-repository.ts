import { supabaseRequest } from './supabase-rest';

import type { TemplePage } from 'src/types/temple-page';

type TemplePageRow = {
  id: string;
  page_key: string;
  slug: string;
  page_type: TemplePage['pageType'];
  title: string;
  eyebrow?: string;
  excerpt?: string;
  content: string;
  hero_image_url?: string;
  hero_storage_path?: string;
  status: TemplePage['status'];
  show_in_menu: boolean;
  sort_order: number;
  seo_title?: string;
  seo_description?: string;
  use_legacy_content: boolean;
  created_at: string;
  updated_at: string;
};

const normalizePage = (row: TemplePageRow): TemplePage => ({
  id: row.id,
  pageKey: row.page_key,
  slug: row.slug,
  pageType: row.page_type,
  title: row.title,
  eyebrow: row.eyebrow || '',
  excerpt: row.excerpt || '',
  content: row.content || '',
  heroImageUrl: row.hero_image_url || '',
  heroStoragePath: row.hero_storage_path || '',
  status: row.status,
  showInMenu: row.show_in_menu,
  sortOrder: row.sort_order,
  seoTitle: row.seo_title || '',
  seoDescription: row.seo_description || '',
  useLegacyContent: row.use_legacy_content,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function getAdminTemplePages(templeId: string, id: string): Promise<TemplePage | null>;
export function getAdminTemplePages(templeId: string, id?: undefined): Promise<TemplePage[]>;
export async function getAdminTemplePages(
  templeId: string,
  id?: string
): Promise<TemplePage | TemplePage[] | null> {
  const query = new URLSearchParams({ select: '*', temple_id: `eq.${templeId}` });
  if (id) query.set('id', `eq.${id}`);
  else query.set('order', 'sort_order.asc,created_at.asc');
  const rows = await supabaseRequest<TemplePageRow[]>(`temple_pages?${query}`);
  const pages = rows.map(normalizePage);
  return id ? pages[0] || null : pages;
}

export const getPublicTemplePage = async (
  templeId: string,
  filter: { pageKey?: string; slug?: string }
) => {
  const query = new URLSearchParams({
    select: '*',
    temple_id: `eq.${templeId}`,
    status: 'eq.PUBLIC',
    limit: '1',
  });
  if (filter.pageKey) query.set('page_key', `eq.${filter.pageKey}`);
  if (filter.slug) query.set('slug', `eq.${filter.slug}`);
  const rows = await supabaseRequest<TemplePageRow[]>(`temple_pages?${query}`);
  return rows[0] ? normalizePage(rows[0]) : null;
};

export const getPublicTempleMenuPages = async (templeId: string) => {
  const query = new URLSearchParams({
    select: '*',
    temple_id: `eq.${templeId}`,
    status: 'eq.PUBLIC',
    page_type: 'eq.CUSTOM',
    show_in_menu: 'eq.true',
    order: 'sort_order.asc,title.asc',
  });
  const rows = await supabaseRequest<TemplePageRow[]>(`temple_pages?${query}`);
  return rows.map(normalizePage);
};
