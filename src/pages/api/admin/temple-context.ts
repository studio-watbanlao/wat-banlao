import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import {
  listTempleAccessForUser,
  setTempleContextCookie,
  TempleAccessError,
} from 'src/lib/temple-access';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const templeId = typeof req.body?.templeId === 'string' ? req.body.templeId : '';
    const accesses = await listTempleAccessForUser(user);
    const selected = accesses.find(
      (access) => access.temple.id === templeId && access.temple.status === 'ACTIVE'
    );
    if (!selected) throw new TempleAccessError('ไม่มีสิทธิ์เข้าถึงวัดที่เลือก', 403);
    setTempleContextCookie(res, selected.temple.id);
    return res.status(200).json({ access: selected });
  } catch (error) {
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
