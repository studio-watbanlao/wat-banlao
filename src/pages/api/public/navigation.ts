import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolvePublicTemple, setPublicCacheControl } from 'src/lib/temple-access';
import { filterTempleNavigation, getTempleNavigation } from 'src/lib/temple-navigation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const temple = await resolvePublicTemple(req);
    const items = await getTempleNavigation(temple.id);
    const visibleItems = filterTempleNavigation(items, temple.modules);
    setPublicCacheControl(req, res, 'private, no-store, max-age=0');
    return res.status(200).json({ temple: temple.slug, items: visibleItems });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
