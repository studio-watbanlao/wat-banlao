import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolvePublicTemple } from 'src/lib/temple-access';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  try {
    const temple = await resolvePublicTemple(req);
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      temple: {
        id: temple.id,
        slug: temple.slug,
        name: temple.name,
        branding: temple.branding,
        modules: temple.modules,
        primaryDomain: temple.domains.find((domain) => domain.isPrimary)?.domain || '',
      },
    });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
