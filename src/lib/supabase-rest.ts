const SUPABASE_TABLE = 'site_content';

export const CONTENT_RESOURCES = [
  'activity',
  'architecture',
  'banner',
  'blog',
  'fastival',
  'sacred',
] as const;

export type ContentResource = (typeof CONTENT_RESOURCES)[number];

type ContentRow = {
  id: string;
  data: Record<string, unknown> | null;
  status: string;
  view: number | null;
  created_at: string;
  updated_at: string;
};

export class SupabaseRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'SupabaseRequestError';
  }
}

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new SupabaseRequestError(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      503
    );
  }

  return { url: url.replace(/\/$/, ''), serviceRoleKey };
};

const supabaseRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new SupabaseRequestError(`Supabase request failed: ${body}`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const normalizeContent = (row: ContentRow) => ({
  ...(row.data ?? {}),
  id: row.id,
  status: row.status,
  view: row.view ?? 0,
  createdAt: row.data?.createdAt ?? row.created_at,
  updatedAt: row.data?.updatedAt ?? row.updated_at,
});

export const getPublicContent = async (resource: ContentResource, id?: string) => {
  const query = new URLSearchParams({
    select: 'id,data,status,view,created_at,updated_at',
    resource: `eq.${resource}`,
    status: 'eq.PUBLIC',
  });

  if (id) query.set('id', `eq.${id}`);
  else query.set('order', 'created_at.desc');

  const rows = await supabaseRequest<ContentRow[]>(`${SUPABASE_TABLE}?${query.toString()}`);
  const content = rows.map(normalizeContent);

  return id ? content[0] ?? null : content;
};

export const incrementContentView = async (resource: ContentResource, id: string) => {
  const result = await supabaseRequest<ContentRow | ContentRow[]>('rpc/increment_content_view', {
    method: 'POST',
    body: JSON.stringify({ p_resource: resource, p_id: id }),
  });
  const row = Array.isArray(result) ? result[0] : result;

  return row ? normalizeContent(row) : null;
};
