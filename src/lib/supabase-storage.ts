const BANNER_BUCKET = 'banners';
const FESTIVAL_BUCKET = 'festivals';
const SACRED_BUCKET = 'sacred';
const ACTIVITY_BUCKET = 'activities';
const ARCHITECTURE_BUCKET = 'architecture';

export class SupabaseStorageError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'SupabaseStorageError';
  }
}

const getStorageConfig = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    throw new SupabaseStorageError(
      'Supabase Storage is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.',
      503
    );
  }

  return { url, secretKey };
};

const getHeaders = (contentType?: string) => {
  const { secretKey } = getStorageConfig();
  const headers = new Headers({ apikey: secretKey });
  if (!secretKey.startsWith('sb_secret_')) headers.set('Authorization', `Bearer ${secretKey}`);
  if (contentType) headers.set('Content-Type', contentType);
  return headers;
};

const ensurePublicImageBucket = async (bucket: string) => {
  const { url } = getStorageConfig();
  const existing = await fetch(`${url}/storage/v1/bucket/${bucket}`, {
    headers: getHeaders(),
  });

  if (existing.ok) return;
  if (existing.status !== 404) {
    throw new SupabaseStorageError(await existing.text(), existing.status);
  }

  const created = await fetch(`${url}/storage/v1/bucket`, {
    method: 'POST',
    headers: getHeaders('application/json'),
    body: JSON.stringify({
      id: bucket,
      name: bucket,
      public: true,
      file_size_limit: 8 * 1024 * 1024,
      allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp'],
    }),
  });

  if (!created.ok && created.status !== 409) {
    throw new SupabaseStorageError(await created.text(), created.status);
  }
};

const uploadPublicImage = async (
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string
) => {
  await ensurePublicImageBucket(bucket);
  const { url } = getStorageConfig();
  const response = await fetch(`${url}/storage/v1/object/${bucket}/${path}`, {
    method: 'POST',
    headers: new Headers({ ...Object.fromEntries(getHeaders(contentType)), 'x-upsert': 'true' }),
    body: Uint8Array.from(buffer).buffer,
  });

  if (!response.ok) {
    throw new SupabaseStorageError(await response.text(), response.status);
  }

  return `${url}/storage/v1/object/public/${bucket}/${path}`;
};

const deletePublicImages = async (bucket: string, paths: string[]) => {
  if (!paths.length) return;
  const { url } = getStorageConfig();
  const response = await fetch(`${url}/storage/v1/object/${bucket}`, {
    method: 'DELETE',
    headers: getHeaders('application/json'),
    body: JSON.stringify({ prefixes: paths }),
  });

  if (!response.ok && response.status !== 404) {
    throw new SupabaseStorageError(await response.text(), response.status);
  }
};

export const uploadBannerImage = (path: string, buffer: Buffer, contentType: string) =>
  uploadPublicImage(BANNER_BUCKET, path, buffer, contentType);

export const deleteBannerImages = (paths: string[]) => deletePublicImages(BANNER_BUCKET, paths);

export const uploadFestivalImage = (path: string, buffer: Buffer, contentType: string) =>
  uploadPublicImage(FESTIVAL_BUCKET, path, buffer, contentType);

export const deleteFestivalImages = (paths: string[]) => deletePublicImages(FESTIVAL_BUCKET, paths);

export const uploadSacredImage = (path: string, buffer: Buffer, contentType: string) =>
  uploadPublicImage(SACRED_BUCKET, path, buffer, contentType);

export const deleteSacredImages = (paths: string[]) => deletePublicImages(SACRED_BUCKET, paths);

export const uploadActivityImage = (path: string, buffer: Buffer, contentType: string) =>
  uploadPublicImage(ACTIVITY_BUCKET, path, buffer, contentType);

export const deleteActivityImages = (paths: string[]) => deletePublicImages(ACTIVITY_BUCKET, paths);

export const uploadArchitectureImage = (path: string, buffer: Buffer, contentType: string) =>
  uploadPublicImage(ARCHITECTURE_BUCKET, path, buffer, contentType);

export const deleteArchitectureImages = (paths: string[]) =>
  deletePublicImages(ARCHITECTURE_BUCKET, paths);
