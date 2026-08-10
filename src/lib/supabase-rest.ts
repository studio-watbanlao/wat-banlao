export const CONTENT_RESOURCES = [
  'activity',
  'architecture',
  'banner',
  'blog',
  'dharma',
  'fastival',
  'sacred',
] as const;

export type ContentResource = (typeof CONTENT_RESOURCES)[number];
export type ContentStatus = 'DRAFT' | 'PUBLIC' | 'ARCHIVED';

type Row = Record<string, unknown> & {
  id: string;
  status: string;
  view?: number;
  created_at: string;
  updated_at: string;
};

type ResourceConfig = {
  table: string;
  columns?: Record<string, string>;
  jsonData?: boolean;
};

const RESOURCE_CONFIG: Record<ContentResource, ResourceConfig> = {
  banner: {
    table: 'banners',
    columns: {
      title: 'title',
      desktopImageUrl: 'desktop_image_url',
      mobileImageUrl: 'mobile_image_url',
      desktopStoragePath: 'desktop_storage_path',
      mobileStoragePath: 'mobile_storage_path',
      linkUrl: 'link_url',
      sortOrder: 'sort_order',
    },
  },
  fastival: {
    table: 'festivals',
    columns: {
      title: 'title',
      year: 'year',
      no: 'event_no',
      description: 'description',
      imageUrl: 'image_url',
      coverStoragePath: 'cover_storage_path',
      images: 'images',
      content: 'content',
      videoUrl: 'video_url',
      openingUrl: 'opening_url',
      logoUrl: 'logo_url',
      createdDate: 'created_date',
    },
  },
  activity: {
    table: 'activities',
    columns: {
      title: 'title',
      type: 'activity_type',
      description: 'description',
      imageUrl: 'image_url',
      coverStoragePath: 'cover_storage_path',
      images: 'images',
      content: 'content',
      createdDate: 'created_date',
    },
  },
  sacred: {
    table: 'sacred_items',
    columns: {
      title: 'title',
      year: 'year',
      description: 'description',
      imageUrl: 'image_url',
      coverStoragePath: 'cover_storage_path',
      images: 'images',
      content: 'content',
      createdDate: 'created_date',
    },
  },
  architecture: {
    table: 'architectures',
    columns: {
      title: 'title',
      year: 'year',
      description: 'description',
      imageUrl: 'image_url',
      coverStoragePath: 'cover_storage_path',
      images: 'images',
      content: 'content',
      videoUrl: 'video_url',
      logoUrl: 'logo_url',
      openingUrl: 'opening_url',
      createdDate: 'created_date',
    },
  },
  blog: {
    table: 'blogs',
    columns: {
      title: 'title',
      description: 'description',
      content: 'content',
      imageUrl: 'image_url',
      coverStoragePath: 'cover_storage_path',
      author: 'author',
      authorImageUrl: 'author_image_url',
      createdDate: 'created_date',
    },
  },
  dharma: {
    table: 'dharmas',
    columns: {
      title: 'title',
      description: 'description',
      content: 'content',
      imageUrl: 'image_url',
      coverStoragePath: 'cover_storage_path',
      author: 'author',
      authorImageUrl: 'author_image_url',
      createdDate: 'created_date',
    },
  },
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
  const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey)
    throw new SupabaseRequestError(
      'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.',
      503
    );
  return { url: url.replace(/\/$/, ''), serviceRoleKey };
};

export const supabaseRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const { url, serviceRoleKey } = getSupabaseConfig();
  const headers = new Headers(init?.headers);
  headers.set('apikey', serviceRoleKey);
  headers.set('Content-Type', 'application/json');
  if (!serviceRoleKey.startsWith('sb_secret_'))
    headers.set('Authorization', `Bearer ${serviceRoleKey}`);
  const response = await fetch(`${url}/rest/v1/${path}`, { ...init, headers });
  if (!response.ok) {
    const body = await response.text();
    throw new SupabaseRequestError(`Supabase request failed: ${body}`, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
};

const parseImages = (value: unknown) => {
  if (typeof value !== 'string') return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
};

const toDatabaseData = (resource: ContentResource, data: Record<string, unknown>) => {
  const config = RESOURCE_CONFIG[resource];
  if (config.jsonData) return { data };
  return Object.entries(config.columns ?? {}).reduce<Record<string, unknown>>(
    (row, [property, column]) => {
      if (data[property] !== undefined) {
        row[column] = property === 'images' ? parseImages(data[property]) : data[property];
      }
      return row;
    },
    {}
  );
};

const normalizeContent = (resource: ContentResource, row: Row) => {
  const config = RESOURCE_CONFIG[resource];
  const data = config.jsonData
    ? ((row.data as Record<string, unknown>) ?? {})
    : Object.entries(config.columns ?? {}).reduce<Record<string, unknown>>(
        (content, [property, column]) => {
          content[property] = row[column];
          return content;
        },
        {}
      );
  return {
    ...data,
    id: row.id,
    status: row.status,
    view: row.view ?? 0,
    createdAt: data.createdAt ?? row.created_at,
    updatedAt: data.updatedAt ?? row.updated_at,
  };
};

const tableFor = (resource: ContentResource) => RESOURCE_CONFIG[resource].table;

export const getPublicContent = async (resource: ContentResource, id?: string) => {
  const query = new URLSearchParams({ select: '*', status: 'eq.PUBLIC' });
  if (id) query.set('id', `eq.${id}`);
  else query.set('order', 'created_at.desc');
  const rows = await supabaseRequest<Row[]>(`${tableFor(resource)}?${query.toString()}`);
  const content = rows.map((row) => normalizeContent(resource, row));
  return id ? (content[0] ?? null) : content;
};

export const incrementContentView = async (resource: ContentResource, id: string) => {
  const result = await supabaseRequest<Row | Row[]>('rpc/increment_content_view', {
    method: 'POST',
    body: JSON.stringify({ p_resource: resource, p_id: id }),
  });
  const row = Array.isArray(result) ? result[0] : result;
  return row ? normalizeContent(resource, row) : null;
};

export function getAdminContent<T>(resource: ContentResource, id: string): Promise<T | null>;
export function getAdminContent<T>(resource: ContentResource, id?: undefined): Promise<T[]>;
export async function getAdminContent<T>(resource: ContentResource, id?: string) {
  const query = new URLSearchParams({ select: '*' });
  if (id) query.set('id', `eq.${id}`);
  else query.set('order', 'created_at.desc');
  const rows = await supabaseRequest<Row[]>(`${tableFor(resource)}?${query.toString()}`);
  const content = rows.map((row) => normalizeContent(resource, row)) as T[];
  return id ? (content[0] ?? null) : content;
}

export const createAdminContent = async (
  resource: ContentResource,
  id: string,
  status: ContentStatus,
  data: Record<string, unknown>
) => {
  const rows = await supabaseRequest<Row[]>(tableFor(resource), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ id, status, ...toDatabaseData(resource, data) }),
  });
  return normalizeContent(resource, rows[0]);
};

export const updateAdminContent = async (
  resource: ContentResource,
  id: string,
  status: ContentStatus,
  data: Record<string, unknown>
) => {
  const query = new URLSearchParams({ id: `eq.${id}` });
  const rows = await supabaseRequest<Row[]>(`${tableFor(resource)}?${query.toString()}`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ status, ...toDatabaseData(resource, data) }),
  });
  return rows[0] ? normalizeContent(resource, rows[0]) : null;
};

export const deleteAdminContent = async (resource: ContentResource, id: string) => {
  const query = new URLSearchParams({ id: `eq.${id}` });
  await supabaseRequest<void>(`${tableFor(resource)}?${query.toString()}`, { method: 'DELETE' });
};
