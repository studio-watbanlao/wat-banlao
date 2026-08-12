import { supabaseRequest } from './supabase-rest';

import type { TempleNavigationItem } from 'src/types/temple-navigation';
import type { TempleModule } from 'src/types/temple';

export const DEFAULT_TEMPLE_NAVIGATION: TempleNavigationItem[] = [
  { itemKey: 'home', title: 'หน้าหลัก', path: '/', parentKey: '', sortOrder: 10, enabled: true, deepMatch: false },
  { itemKey: 'festivals', title: 'เทศกาลงานบุญ', path: '/fastival', parentKey: '', sortOrder: 20, enabled: true, deepMatch: true },
  { itemKey: 'temple', title: 'รู้จักวัด', path: '/banlao', parentKey: '', sortOrder: 30, enabled: true, deepMatch: true },
  { itemKey: 'temple-history', title: 'ประวัติวัด', path: '/banlao/history', parentKey: 'temple', sortOrder: 10, enabled: true, deepMatch: false },
  { itemKey: 'temple-architecture', title: 'สถาปัตย์และสิ่งสำคัญ', path: '/banlao/architecture', parentKey: 'temple', sortOrder: 20, enabled: true, deepMatch: true },
  { itemKey: 'temple-abbot', title: 'เจ้าอาวาส', path: '/banlao/abbot', parentKey: 'temple', sortOrder: 30, enabled: true, deepMatch: false },
  { itemKey: 'temple-monks', title: 'ทำเนียบพระสงฆ์', path: '/banlao/monks', parentKey: 'temple', sortOrder: 40, enabled: true, deepMatch: false },
  { itemKey: 'masters', title: 'ชีวประวัติบูรพาจารย์', path: '/parents', parentKey: '', sortOrder: 40, enabled: true, deepMatch: true },
  { itemKey: 'master-sa', title: 'หลวงปู่สาธุ์ สุขธมฺโม', path: '/parents/luang-pu-sa', parentKey: 'masters', sortOrder: 10, enabled: true, deepMatch: false },
  { itemKey: 'master-pramuan', title: 'หลวงปู่ประมวล ญาณวโร', path: '/parents/luang-pu-pramuan', parentKey: 'masters', sortOrder: 20, enabled: true, deepMatch: false },
  { itemKey: 'sacred', title: 'วัตถุมงคล', path: '/parents/sacred', parentKey: 'masters', sortOrder: 30, enabled: true, deepMatch: true },
  { itemKey: 'articles', title: 'บทความ/ธรรมะ', path: '/article', parentKey: '', sortOrder: 50, enabled: true, deepMatch: true },
  { itemKey: 'blogs', title: 'บทความ', path: '/article/blog', parentKey: 'articles', sortOrder: 10, enabled: true, deepMatch: true },
  { itemKey: 'dharmas', title: 'ธรรมะ', path: '/article/dharma', parentKey: 'articles', sortOrder: 20, enabled: true, deepMatch: true },
  { itemKey: 'activities', title: 'กิจกรรมและข่าวสาร', path: '/activity', parentKey: '', sortOrder: 60, enabled: true, deepMatch: true },
  { itemKey: 'community', title: 'ชุมชน', path: '/community', parentKey: '', sortOrder: 70, enabled: true, deepMatch: true },
  { itemKey: 'community-history', title: 'ประวัติชุมชน', path: '/community/community-history', parentKey: 'community', sortOrder: 10, enabled: true, deepMatch: false },
  { itemKey: 'community-leaders', title: 'ผู้นำชุมชน', path: '/community/community-leaders', parentKey: 'community', sortOrder: 20, enabled: true, deepMatch: false },
  { itemKey: 'community-school', title: 'โรงเรียนชุมชน', path: '/community/school', parentKey: 'community', sortOrder: 30, enabled: true, deepMatch: false },
];

type NavigationRow = {
  item_key: string;
  title: string;
  path: string;
  parent_key?: string;
  sort_order: number;
  enabled: boolean;
  deep_match: boolean;
};

const normalize = (row: NavigationRow): TempleNavigationItem => ({
  itemKey: row.item_key,
  title: row.title,
  path: row.path,
  parentKey: row.parent_key || '',
  sortOrder: row.sort_order,
  enabled: row.enabled,
  deepMatch: row.deep_match,
});

const NAVIGATION_MODULES: Partial<Record<string, TempleModule>> = {
  festivals: 'festivals',
  'temple-architecture': 'architectures',
  'temple-abbot': 'directory',
  'temple-monks': 'directory',
  sacred: 'sacred',
  blogs: 'blogs',
  dharmas: 'dharmas',
  activities: 'activities',
  community: 'community_leaders',
  'community-history': 'community_leaders',
  'community-leaders': 'community_leaders',
  'community-school': 'community_leaders',
};

export const filterTempleNavigation = (
  items: TempleNavigationItem[],
  modules: Record<TempleModule, boolean>
) => {
  const moduleEnabledItems = items.filter((item) => {
    const requiredModule = NAVIGATION_MODULES[item.itemKey];
    return item.enabled && (!requiredModule || modules[requiredModule]);
  });
  const enabledParents = new Set(
    moduleEnabledItems.filter((item) => !item.parentKey).map((item) => item.itemKey)
  );

  return moduleEnabledItems.filter(
    (item) => !item.parentKey || enabledParents.has(item.parentKey)
  );
};

export const getTempleNavigation = async (templeId: string) => {
  const rows = await supabaseRequest<NavigationRow[]>(
    `temple_navigation_items?select=item_key,title,path,parent_key,sort_order,enabled,deep_match&temple_id=eq.${encodeURIComponent(templeId)}&order=parent_key.asc.nullsfirst,sort_order.asc,title.asc`
  );
  return rows.length ? rows.map(normalize) : DEFAULT_TEMPLE_NAVIGATION;
};
