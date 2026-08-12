import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { resolvePublicTemple } from 'src/lib/temple-access';
import { COMMUNITY_VILLAGES, type CommunityLeader } from 'src/types/community-leader';

type PublicLeaderRow = {
  id: string;
  village_key: CommunityLeader['villageKey'];
  full_name: string;
  role: string;
  responsibility?: string;
  phone?: string;
  leader_group: CommunityLeader['group'];
  image_url: string;
  sort_order?: number;
  status: CommunityLeader['status'];
  created_at: string;
  updated_at?: string;
};

const normalize = (row: PublicLeaderRow): CommunityLeader => ({
  id: row.id,
  villageKey: row.village_key,
  villageName:
    COMMUNITY_VILLAGES.find((item) => item.key === row.village_key)?.name || row.village_key,
  fullName: row.full_name,
  role: row.role,
  responsibility: row.responsibility || '',
  phone: row.phone || '',
  imageUrl: row.image_url,
  group: row.leader_group,
  sortOrder: row.sort_order || 0,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  try {
    const temple = await resolvePublicTemple(req);
    const query = new URLSearchParams({
      select: '*',
      temple_id: `eq.${temple.id}`,
      status: 'eq.PUBLIC',
      order: 'village_key.asc,sort_order.asc,created_at.asc',
    });
    const rows = await supabaseRequest<PublicLeaderRow[]>(`community_leaders?${query}`);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ leaders: rows.map(normalize) });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
