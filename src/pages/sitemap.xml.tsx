import type { GetServerSideProps } from 'next';
import type { NextApiRequest } from 'next';

import { supabaseRequest } from 'src/lib/supabase-rest';
import { resolvePublicTemple } from 'src/lib/temple-access';

type SitemapRow = { id: string; updated_at?: string };
type PageRow = { page_key: string; slug: string; updated_at?: string };

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const requestOrigin = (headers: Record<string, string | string[] | undefined>) => {
  const forwardedHost = Array.isArray(headers['x-forwarded-host'])
    ? headers['x-forwarded-host'][0]
    : headers['x-forwarded-host'];
  const host = forwardedHost || headers.host || 'www.watbanlao.org';
  const forwardedProto = Array.isArray(headers['x-forwarded-proto'])
    ? headers['x-forwarded-proto'][0]
    : headers['x-forwarded-proto'];
  const protocol = forwardedProto || (String(host).includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
};

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const origin = requestOrigin(req.headers);
  const temple = await resolvePublicTemple({ headers: req.headers, query: {} } as NextApiRequest);
  const templeId = encodeURIComponent(temple.id);
  const queries: Array<Promise<{ path: string; updatedAt?: string }[]>> = [];
  const contentQuery = (table: string, path: string) =>
    supabaseRequest<SitemapRow[]>(
      `${table}?select=id,updated_at&temple_id=eq.${templeId}&status=eq.PUBLIC&order=updated_at.desc`
    ).then((rows) => rows.map((row) => ({ path: `${path}/${row.id}`, updatedAt: row.updated_at })));

  queries.push(
    supabaseRequest<PageRow[]>(
      `temple_pages?select=page_key,slug,updated_at&temple_id=eq.${templeId}&status=eq.PUBLIC&order=updated_at.desc`
    ).then((rows) =>
      rows.map((row) => ({
        path: row.page_key === 'home' ? '/' : `/${row.slug}`,
        updatedAt: row.updated_at,
      }))
    )
  );
  if (temple.modules.activities) queries.push(contentQuery('activities', '/activity'));
  if (temple.modules.architectures) queries.push(contentQuery('architectures', '/banlao/architecture'));
  if (temple.modules.festivals) queries.push(contentQuery('festivals', '/fastival'));
  if (temple.modules.blogs) queries.push(contentQuery('blogs', '/article/blog'));
  if (temple.modules.dharmas) queries.push(contentQuery('dharmas', '/article/dharma'));
  if (temple.modules.sacred) queries.push(contentQuery('sacred_items', '/parents/sacred'));

  const staticPaths = ['/'];
  if (temple.modules.activities) staticPaths.push('/activity');
  if (temple.modules.architectures) staticPaths.push('/banlao/architecture');
  if (temple.modules.festivals) staticPaths.push('/fastival');
  if (temple.modules.blogs) staticPaths.push('/article/blog');
  if (temple.modules.dharmas) staticPaths.push('/article/dharma');
  if (temple.modules.contacts) staticPaths.push('/contact-us');
  if (temple.modules.sacred) staticPaths.push('/parents/sacred');
  const entries = new Map<string, string | undefined>(staticPaths.map((path) => [path, undefined]));
  const dynamicEntries = (await Promise.all(queries)).flat();
  dynamicEntries.forEach((entry) => entries.set(entry.path, entry.updatedAt));
  const urls = [...entries.entries()]
    .map(
      ([path, updatedAt]) => `  <url>
    <loc>${escapeXml(`${origin}${path === '/' ? '' : path}`)}</loc>${
      updatedAt ? `\n    <lastmod>${escapeXml(new Date(updatedAt).toISOString())}</lastmod>` : ''
    }
  </url>`
    )
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
