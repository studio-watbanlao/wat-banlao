import type { GetServerSideProps } from 'next';

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
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.write(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /dashboard/
Disallow: /error/
Disallow: /coming-soon

Sitemap: ${origin}/sitemap.xml
`);
  res.end();
  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
