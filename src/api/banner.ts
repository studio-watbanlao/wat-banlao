import { fetchContentList } from './content';
import type { BannerItem } from 'src/types/banner';

export const fetchBanner = async () => {
  const banners = await fetchContentList<BannerItem>('banner');
  return banners.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
};
