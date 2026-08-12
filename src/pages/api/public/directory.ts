import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { resolvePublicTemple } from 'src/lib/temple-access';
import type { TempleDirectoryEntry } from 'src/types/temple-directory';

type DirectoryRow = {
  id: string;
  full_name: string;
  display_title?: string;
  entry_type: TempleDirectoryEntry['entryType'];
  term_start?: string;
  term_end?: string;
  image_url: string;
  birth?: string;
  age?: string;
  ordination?: string;
  vassa?: string;
  temple_name?: string;
  province?: string;
  affiliation?: string;
  education?: string;
  honorary_awards?: string;
  administrative_positions?: string;
  monastic_rank?: string;
  biography?: string;
  sources?: string;
  sort_order?: number;
  status: TempleDirectoryEntry['status'];
  created_at: string;
  updated_at?: string;
};

const normalize = (row: DirectoryRow): TempleDirectoryEntry => ({
  id: row.id,
  fullName: row.full_name,
  displayTitle: row.display_title || '',
  entryType: row.entry_type,
  termStart: row.term_start || '',
  termEnd: row.term_end || '',
  imageUrl: row.image_url,
  birth: row.birth || '',
  age: row.age || '',
  ordination: row.ordination || '',
  vassa: row.vassa || '',
  templeName: row.temple_name || '',
  province: row.province || '',
  affiliation: row.affiliation || '',
  education: row.education || '',
  honoraryAwards: row.honorary_awards || '',
  administrativePositions: row.administrative_positions || '',
  monasticRank: row.monastic_rank || '',
  biography: row.biography || '',
  sources: row.sources || '',
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
    if (!temple.modules.directory) {
      return res.status(200).json({ entries: [] });
    }
    const query = new URLSearchParams({
      select: '*',
      temple_id: `eq.${temple.id}`,
      status: 'eq.PUBLIC',
      order: 'sort_order.asc,created_at.asc',
    });
    const rows = await supabaseRequest<DirectoryRow[]>(`temple_directory_entries?${query}`);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ entries: rows.map(normalize) });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
