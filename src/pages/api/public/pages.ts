import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolvePublicTemple } from 'src/lib/temple-access';
import { getPublicTempleMenuPages, getPublicTemplePage } from 'src/lib/temple-page-repository';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }
  try {
    const temple = await resolvePublicTemple(req);
    if (req.query.menu === 'true') {
      const pages = await getPublicTempleMenuPages(temple.id);
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json({ temple: temple.slug, pages });
    }
    const pageKey = typeof req.query.pageKey === 'string' ? req.query.pageKey : undefined;
    const slug = typeof req.query.slug === 'string' ? req.query.slug.replace(/^\/+|\/+$/g, '') : undefined;
    if (!pageKey && !slug) return res.status(400).json({ message: 'กรุณาระบุ pageKey หรือ slug' });
    const page = await getPublicTemplePage(temple.id, { pageKey, slug });
    if (!page) return res.status(404).json({ message: 'ไม่พบหน้าเว็บไซต์' });
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ temple: temple.slug, page });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
