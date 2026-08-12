import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { requireTemplePermission } from 'src/lib/temple-access';
import { getTempleNavigation } from 'src/lib/temple-navigation';

const text = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const action = req.method === 'PATCH' ? 'update' : 'read';
    const access = await requireTemplePermission(req, user, 'pages', action);
    const templeId = access.temple.id;

    if (req.method === 'GET') {
      return res.status(200).json({ items: await getTempleNavigation(templeId) });
    }

    if (req.method === 'PATCH') {
      const requestedItems: unknown[] = Array.isArray(req.body?.items)
        ? req.body.items.slice(0, 100)
        : [];
      const currentItems = await getTempleNavigation(templeId);
      const currentByKey = new Map(currentItems.map((item) => [item.itemKey, item]));
      const items = requestedItems.map((value, index) => {
        if (!value || typeof value !== 'object') return null;
        const input = value as Record<string, unknown>;
        const itemKey = text(input.itemKey, 100);
        const current = currentByKey.get(itemKey);
        const title = text(input.title, 120);
        if (!current || !title) return null;
        return {
          temple_id: templeId,
          item_key: current.itemKey,
          title,
          path: current.path,
          parent_key: current.parentKey || null,
          sort_order: Math.min(Math.max(Number(input.sortOrder) || (index + 1) * 10, 0), 9999),
          enabled: Boolean(input.enabled),
          deep_match: current.deepMatch,
          updated_at: new Date().toISOString(),
        };
      });

      if (!items.length || items.some((item) => !item) || items.length !== currentItems.length) {
        return res.status(400).json({ message: 'รายการเมนูไม่ครบหรือไม่ถูกต้อง' });
      }

      await supabaseRequest('temple_navigation_items?on_conflict=temple_id,item_key', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(items),
      });

      return res.status(200).json({ items: await getTempleNavigation(templeId) });
    }

    res.setHeader('Allow', ['GET', 'PATCH']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/navigation]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
