import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { resolvePublicTemple, setPublicCacheControl } from 'src/lib/temple-access';
import type { PopupBannerFrequency, PopupBannerItem } from 'src/types/popup-banner';

type PublicPopupBannerRow = {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  display_frequency: PopupBannerFrequency;
  starts_at?: string;
  ends_at?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  try {
    const temple = await resolvePublicTemple(req);
    const now = new Date().toISOString();
    const query = new URLSearchParams({
      select: '*',
      temple_id: `eq.${temple.id}`,
      status: 'eq.PUBLIC',
      order: 'sort_order.asc,created_at.desc',
    });
    const rows = await supabaseRequest<PublicPopupBannerRow[]>(`popup_banners?${query}`);
    const row = rows.find(
      (item) => (!item.starts_at || item.starts_at <= now) && (!item.ends_at || item.ends_at >= now)
    );
    const popupBanner: PopupBannerItem | null = row
      ? {
          id: row.id,
          title: row.title,
          imageUrl: row.image_url,
          storagePath: '',
          linkUrl: row.link_url || '',
          displayFrequency: row.display_frequency,
          startsAt: row.starts_at || '',
          endsAt: row.ends_at || '',
          sortOrder: row.sort_order,
          status: 'PUBLIC',
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        }
      : null;
    setPublicCacheControl(req, res, 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ temple: temple.slug, popupBanner });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
