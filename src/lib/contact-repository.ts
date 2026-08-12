import { supabaseRequest } from 'src/lib/supabase-rest';
import type { ContactMessage, ContactMessageInput, ContactStatus } from 'src/types/contact';

type ContactRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
};

const normalizeContact = (row: ContactRow): ContactMessage => ({
  id: row.id,
  name: row.name,
  email: row.email,
  subject: row.subject,
  message: row.message,
  status: row.status,
  adminNote: row.admin_note || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const createContactMessage = async (templeId: string, input: ContactMessageInput) => {
  const rows = await supabaseRequest<ContactRow[]>('contact_messages', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ ...input, temple_id: templeId }),
  });
  return normalizeContact(rows[0]);
};

export const getContactMessages = async (templeId: string) => {
  const query = new URLSearchParams({
    select: '*',
    temple_id: `eq.${templeId}`,
    order: 'created_at.desc',
  });
  const rows = await supabaseRequest<ContactRow[]>(`contact_messages?${query.toString()}`);
  return rows.map(normalizeContact);
};

export const getContactMessage = async (templeId: string, id: string) => {
  const query = new URLSearchParams({
    select: '*',
    temple_id: `eq.${templeId}`,
    id: `eq.${id}`,
    limit: '1',
  });
  const rows = await supabaseRequest<ContactRow[]>(`contact_messages?${query.toString()}`);
  return rows[0] ? normalizeContact(rows[0]) : null;
};

export const updateContactMessage = async (
  templeId: string,
  id: string,
  input: ContactMessageInput & { status: ContactStatus; adminNote?: string }
) => {
  const query = new URLSearchParams({ id: `eq.${id}`, temple_id: `eq.${templeId}` });
  const rows = await supabaseRequest<ContactRow[]>(`contact_messages?${query.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
      status: input.status,
      admin_note: input.adminNote || null,
    }),
  });
  return rows[0] ? normalizeContact(rows[0]) : null;
};

export const deleteContactMessage = async (templeId: string, id: string) => {
  const query = new URLSearchParams({ id: `eq.${id}`, temple_id: `eq.${templeId}` });
  await supabaseRequest<void>(`contact_messages?${query.toString()}`, { method: 'DELETE' });
};
