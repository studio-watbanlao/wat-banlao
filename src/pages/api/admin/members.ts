import { randomUUID } from 'crypto';

import type { NextApiRequest, NextApiResponse } from 'next';

import { getSafeApiError } from 'src/lib/api-error';
import { resolveSessionUser } from 'src/lib/supabase-auth';
import { supabaseRequest } from 'src/lib/supabase-rest';
import { requireTemplePermission } from 'src/lib/temple-access';
import { createTempleInvitationToken, listTempleInvitations } from 'src/lib/temple-invitations';
import {
  TEMPLE_MODULES,
  TEMPLE_CONTRIBUTOR_MODULES,
  type TempleModule,
  type TemplePermissions,
} from 'src/types/temple';

type MemberRow = {
  temple_id: string;
  user_id: string;
  role: 'temple_admin' | 'temple_editor' | 'temple_contributor';
  permissions: TemplePermissions;
  status: 'ACTIVE' | 'SUSPENDED';
  created_at: string;
};

type ProfileRow = {
  id: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
};

type InvitationRow = {
  id: string;
  temple_id: string;
  email: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';
};

const text = (value: unknown, max = 500) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';
const isModule = (value: unknown): value is TempleModule =>
  TEMPLE_MODULES.includes(value as TempleModule);

const getProfiles = async (userIds: string[]) => {
  if (!userIds.length) return [];
  return supabaseRequest<ProfileRow[]>(
    `profiles?select=id,email,display_name,avatar_url&id=in.(${userIds.map(encodeURIComponent).join(',')})`
  );
};

const listMembers = async (templeId: string) => {
  const rows = await supabaseRequest<MemberRow[]>(
    `temple_members?select=*&temple_id=eq.${encodeURIComponent(templeId)}&order=created_at.asc`
  );
  const profiles = await getProfiles(rows.map((row) => row.user_id));
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  return rows.map((row) => {
    const profile = profilesById.get(row.user_id);
    return {
      templeId: row.temple_id,
      userId: row.user_id,
      role: row.role,
      permissions: row.permissions || {},
      status: row.status,
      createdAt: row.created_at,
      email: profile?.email || '',
      displayName: profile?.display_name || profile?.email || row.user_id,
      avatarUrl: profile?.avatar_url || '',
    };
  });
};

const actionsForRole = (role: 'temple_editor' | 'temple_contributor') =>
  role === 'temple_contributor' ? ['read', 'create', 'update'] : ['read', 'create', 'update'];

const GOOGLE_ACCESS_EXPIRES_AT = '9999-12-31T23:59:59.999Z';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = await resolveSessionUser(req, res);
    if (!user) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
    const action = req.method === 'POST' ? 'create' : req.method === 'DELETE' ? 'delete' : req.method === 'PATCH' ? 'update' : 'read';
    const access = await requireTemplePermission(req, user, 'members', action);
    const templeId = access.temple.id;

    if (req.method === 'GET') {
      const [members, invitations] = await Promise.all([
        listMembers(templeId),
        listTempleInvitations(templeId),
      ]);
      return res.status(200).json({
        temple: access.temple,
        members,
        invitations: invitations.filter((invitation) => invitation.status === 'PENDING'),
      });
    }

    if (req.method === 'POST') {
      const email = text(req.body?.email, 320).toLowerCase();
      const role = req.body?.role === 'temple_editor' ? 'temple_editor' : 'temple_contributor';
      const requestedModules: TempleModule[] = Array.isArray(req.body?.modules)
        ? req.body.modules.filter(isModule)
        : [];
      const allowedModules = requestedModules.filter(
        (module) =>
          access.temple.modules[module] &&
          !['dashboard', 'members', 'domains', 'branding', 'contacts'].includes(module) &&
          (role !== 'temple_contributor' || TEMPLE_CONTRIBUTOR_MODULES.includes(module))
      );
      if (!/^\S+@\S+\.\S+$/.test(email) || !allowedModules.length) {
        return res.status(400).json({ message: 'กรุณากรอกอีเมลและเลือก Module ให้ถูกต้อง' });
      }

      const existingProfiles = await supabaseRequest<Array<{ id: string }>>(
        `profiles?select=id&email=ilike.${encodeURIComponent(email)}&limit=1`
      );
      const existingMember = existingProfiles[0]
        ? await supabaseRequest<Array<{ user_id: string }>>(
            `temple_members?select=user_id&temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(existingProfiles[0].id)}&limit=1`
          )
        : [];
      if (existingMember.length) {
        return res.status(409).json({ message: 'อีเมลนี้เป็นสมาชิกของวัดแล้ว' });
      }

      const permissions = Object.fromEntries([
        ['dashboard', ['read']],
        ...allowedModules.map((module) => [module, actionsForRole(role)]),
      ]) as TemplePermissions;
      const { tokenHash } = createTempleInvitationToken();
      const invitationId = randomUUID();
      await supabaseRequest('temple_invitations', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          id: invitationId,
          temple_id: templeId,
          email,
          role,
          permissions,
          token_hash: tokenHash,
          invited_by: user.id,
          // This row is an email allowlist for Google Sign-In, not an expiring auth link.
          expires_at: GOOGLE_ACCESS_EXPIRES_AT,
        }),
      });

      return res.status(201).json({
        success: true,
        deliveryStatus: 'PENDING',
        message: 'เพิ่มอีเมลในรายชื่ออนุญาตแล้ว ให้ผู้ใช้เข้าระบบด้วย Google บัญชีนี้',
      });
    }

    if (req.method === 'PATCH') {
      const invitationId = text(req.body?.invitationId, 64);
      if (req.body?.action === 'reactivate_invitation' && invitationId) {
        const invitations = await supabaseRequest<InvitationRow[]>(
          `temple_invitations?select=id,temple_id,email,status&id=eq.${encodeURIComponent(invitationId)}&temple_id=eq.${encodeURIComponent(templeId)}&limit=1`
        );
        const invitation = invitations[0];
        if (!invitation) return res.status(404).json({ message: 'ไม่พบคำเชิญ' });
        if (invitation.status === 'ACCEPTED') {
          return res.status(409).json({ message: 'คำเชิญนี้ถูกตอบรับแล้ว' });
        }

        const otherPending = await supabaseRequest<Array<{ id: string }>>(
          `temple_invitations?select=id&temple_id=eq.${encodeURIComponent(templeId)}&email=eq.${encodeURIComponent(invitation.email)}&status=eq.PENDING&id=neq.${encodeURIComponent(invitation.id)}&limit=1`
        );
        if (otherPending.length) {
          return res.status(409).json({
            message: 'อีเมลนี้มีคำเชิญที่รอตอบรับอยู่แล้ว กรุณาส่งซ้ำจากรายการล่าสุด',
          });
        }

        const { tokenHash } = createTempleInvitationToken();
        await supabaseRequest(
          `temple_invitations?id=eq.${encodeURIComponent(invitation.id)}&temple_id=eq.${encodeURIComponent(templeId)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({
              token_hash: tokenHash,
              status: 'PENDING',
              delivery_status: 'PENDING',
              expires_at: GOOGLE_ACCESS_EXPIRES_AT,
            }),
          }
        );
        return res.status(200).json({
          success: true,
          deliveryStatus: 'PENDING',
          message: 'เปิดสิทธิ์อีเมลนี้อีกครั้งแล้ว',
        });
      }

      const userId = text(req.body?.userId, 64);
      if (!userId) return res.status(400).json({ message: 'ไม่พบสมาชิก' });
      const target = await supabaseRequest<Array<{ role: MemberRow['role'] }>>(
        `temple_members?select=role&temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`
      );
      if (!target.length) return res.status(404).json({ message: 'ไม่พบสมาชิกในวัดนี้' });
      if (target[0]?.role === 'temple_admin' && access.role !== 'super_admin') {
        return res.status(403).json({ message: 'Temple Admin ไม่สามารถเปลี่ยนสิทธิ์ Admin คนอื่นได้' });
      }

      if (req.body?.action === 'update_permissions') {
        const targetRole = target[0].role;
        if (targetRole === 'temple_admin') {
          return res.status(400).json({ message: 'ผู้ดูแลวัดได้รับสิทธิ์จัดการทุกส่วนงานอยู่แล้ว' });
        }
        const requestedModules: TempleModule[] = Array.isArray(req.body?.modules)
          ? req.body.modules.filter(isModule)
          : [];
        const allowedModules = requestedModules.filter(
          (module) =>
            access.temple.modules[module] &&
            !['dashboard', 'members', 'domains', 'branding', 'contacts'].includes(module) &&
            (targetRole !== 'temple_contributor' || TEMPLE_CONTRIBUTOR_MODULES.includes(module))
        );
        const permissions = Object.fromEntries([
          ['dashboard', ['read']],
          ...allowedModules.map((module) => [module, actionsForRole(targetRole)]),
        ]) as TemplePermissions;
        await supabaseRequest(
          `temple_members?temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(userId)}`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ permissions }),
          }
        );
        return res.status(200).json({ success: true, permissions });
      }

      const memberStatus = req.body?.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';
      if (userId === user.id && memberStatus === 'SUSPENDED') {
        return res.status(400).json({ message: 'ไม่สามารถระงับสิทธิ์ตัวเองได้' });
      }
      await supabaseRequest(
        `temple_members?temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(userId)}`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ status: memberStatus }),
        }
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const invitationId = text(req.query.invitationId, 64);
      const userId = text(req.query.userId, 64);
      if (invitationId) {
        await supabaseRequest(
          `temple_invitations?id=eq.${encodeURIComponent(invitationId)}&temple_id=eq.${encodeURIComponent(templeId)}&status=eq.PENDING`,
          {
            method: 'PATCH',
            headers: { Prefer: 'return=minimal' },
            body: JSON.stringify({ status: 'REVOKED' }),
          }
        );
      } else if (userId) {
        if (userId === user.id) return res.status(400).json({ message: 'ไม่สามารถนำตัวเองออกจากวัดได้' });
        const target = await supabaseRequest<Array<{ role: string }>>(
          `temple_members?select=role&temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`
        );
        if (target[0]?.role === 'temple_admin' && access.role !== 'super_admin') {
          return res.status(403).json({ message: 'Temple Admin ไม่สามารถนำ Admin คนอื่นออกได้' });
        }
        await supabaseRequest(
          `temple_members?temple_id=eq.${encodeURIComponent(templeId)}&user_id=eq.${encodeURIComponent(userId)}`,
          { method: 'DELETE' }
        );
      } else {
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
      }
      return res.status(200).json({ success: true });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    return res.status(405).json({ message: 'Method not allowed.' });
  } catch (error) {
    console.error('[api/admin/members]', error);
    const { status, message } = getSafeApiError(error);
    return res.status(status).json({ message });
  }
}
