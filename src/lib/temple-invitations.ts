import { createHash, randomBytes } from 'crypto';

import { supabaseRequest } from './supabase-rest';

import type { SupabaseUser } from 'src/lib/supabase-auth';
import type {
  TempleInvitation,
  TempleMemberRole,
  TemplePermissions,
} from 'src/types/temple';

type InvitationRow = {
  id: string;
  temple_id: string;
  email: string;
  role: Extract<TempleMemberRole, 'temple_editor' | 'temple_contributor'>;
  permissions: TemplePermissions;
  status: TempleInvitation['status'];
  delivery_status: TempleInvitation['deliveryStatus'];
  expires_at: string;
  created_at: string;
};

const normalizeInvitation = (row: InvitationRow): TempleInvitation => ({
  id: row.id,
  templeId: row.temple_id,
  email: row.email,
  role: row.role,
  permissions: row.permissions || {},
  status: row.status,
  deliveryStatus: row.delivery_status,
  expiresAt: row.expires_at,
  createdAt: row.created_at,
});

export const createTempleInvitationToken = () => {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashTempleInvitationToken(token) };
};

export const hashTempleInvitationToken = (token: string) =>
  createHash('sha256').update(token).digest('hex');

export const listTempleInvitations = async (templeId: string) => {
  await supabaseRequest(
    `temple_invitations?temple_id=eq.${encodeURIComponent(templeId)}&status=eq.PENDING&expires_at=lt.${encodeURIComponent(new Date().toISOString())}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'EXPIRED' }),
    }
  );
  const rows = await supabaseRequest<InvitationRow[]>(
    `temple_invitations?select=*&temple_id=eq.${encodeURIComponent(templeId)}&order=created_at.desc`
  );
  return rows.map(normalizeInvitation);
};

const activateInvitation = async (row: InvitationRow, user: SupabaseUser) => {
  const permissions: TemplePermissions = {
    ...row.permissions,
    dashboard: ['read'],
  };
  await supabaseRequest('temple_members?on_conflict=temple_id,user_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({
      temple_id: row.temple_id,
      user_id: user.id,
      role: row.role,
      permissions,
      status: 'ACTIVE',
    }),
  });
  await supabaseRequest(`temple_invitations?id=eq.${encodeURIComponent(row.id)}&status=eq.PENDING`, {
    method: 'PATCH',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: 'ACCEPTED',
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    }),
  });
};

export const acceptTempleInvitation = async (token: string, user: SupabaseUser) => {
  const email = user.email?.trim().toLowerCase();
  if (!email) throw Object.assign(new Error('บัญชีนี้ไม่มีอีเมล'), { status: 400 });
  const query = new URLSearchParams({
    select: '*',
    token_hash: `eq.${hashTempleInvitationToken(token)}`,
    status: 'eq.PENDING',
    limit: '1',
  });
  const rows = await supabaseRequest<InvitationRow[]>(`temple_invitations?${query}`);
  const invitation = rows[0];
  if (!invitation || invitation.email !== email) {
    throw Object.assign(new Error('คำเชิญไม่ถูกต้องหรือถูกใช้งานแล้ว'), { status: 400 });
  }
  if (new Date(invitation.expires_at).getTime() <= Date.now()) {
    throw Object.assign(new Error('คำเชิญหมดอายุแล้ว กรุณาติดต่อผู้ดูแลวัด'), { status: 410 });
  }
  await activateInvitation(invitation, user);
  return normalizeInvitation(invitation);
};

export const claimPendingTempleInvitations = async (user: SupabaseUser) => {
  const email = user.email?.trim().toLowerCase();
  if (!email) return 0;
  const query = new URLSearchParams({
    select: '*',
    email: `eq.${email}`,
    status: 'eq.PENDING',
    expires_at: `gt.${new Date().toISOString()}`,
  });
  const rows = await supabaseRequest<InvitationRow[]>(`temple_invitations?${query}`);
  await Promise.all(rows.map((row) => activateInvitation(row, user)));
  return rows.length;
};
