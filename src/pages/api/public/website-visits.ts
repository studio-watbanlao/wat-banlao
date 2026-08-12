import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { resolvePublicTemple } from 'src/lib/temple-access';

type VisitRow = { total_visits: number | string };

const toCount = (value: unknown) => {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const temple = await resolvePublicTemple(req);

    if (req.method === 'POST') {
      const totalVisits = await supabaseRequest<number | string>('rpc/increment_temple_visit', {
        method: 'POST',
        body: JSON.stringify({ p_temple_id: temple.id }),
      });
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).json({ totalVisits: toCount(totalVisits) });
    }

    const rows = await supabaseRequest<VisitRow[]>(
      `temple_visit_stats?select=total_visits&temple_id=eq.${encodeURIComponent(temple.id)}&limit=1`
    );
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ totalVisits: toCount(rows[0]?.total_visits) });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
