import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import {
  CONTENT_RESOURCES,
  getPublicContent,
  incrementContentView,
  type ContentResource,
} from 'src/lib/supabase-rest';
import { resolvePublicTemple } from 'src/lib/temple-access';

const isContentResource = (value: string): value is ContentResource =>
  CONTENT_RESOURCES.some((resource) => resource === value);

const getId = (value: string | string[] | undefined) => {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const resource = String(req.query.resource);
  const id = getId(req.query.id);

  if (!isContentResource(resource)) {
    return res.status(404).json({ message: 'Unknown content resource.' });
  }

  try {
    const temple = await resolvePublicTemple(req);
    if (req.method === 'GET') {
      const data = await getPublicContent(resource, temple.id, id);

      if (id && !data) return res.status(404).json({ message: 'Content not found.' });

      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ data });
    }

    if (req.method === 'POST' && id && req.body?.action === 'increment_view') {
      const data = await incrementContentView(resource, temple.id, id);

      if (!data) return res.status(404).json({ message: 'Content not found.' });
      return res.status(200).json({ data });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    const { status, message } = getSafeApiError(error, 'Unexpected server error.');

    console.error(`[content-api] ${resource}`, error);
    return res.status(status).json({ message });
  }
}
