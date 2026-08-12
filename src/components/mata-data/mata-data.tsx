import Head from 'next/head';
import { useMemo } from 'react';

import { CONFIG } from 'src/config-global';
import { resolveContentImage } from 'src/constants/images';
import { usePathname } from 'src/routes/hooks';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

type MataDataProps = {
  url?: string;
  data?: {
    title: string;
    description?: string;
    imageUrl?: string;
    author?: string;
    createdDate?: string;
    updatedAt?: string;
  };
};

const ROUTE_TITLES: Record<string, string> = {
  '/': 'หน้าแรก',
  '/about-us': 'เกี่ยวกับวัด',
  '/activity': 'กิจกรรมและข่าวประชาสัมพันธ์',
  '/banlao/architecture': 'สถาปัตย์และสิ่งสำคัญ',
  '/banlao/history': 'ประวัติวัด',
  '/banlao/abbot': 'เจ้าอาวาสวัดบ้านเหล่า',
  '/banlao/monks': 'ทำเนียบพระสงฆ์',
  '/fastival': 'เทศกาลและงานประเพณี',
  '/article/blog': 'บทความ',
  '/article/dharma': 'ธรรมะ',
  '/contact-us': 'ติดต่อวัด',
  '/parents/sacred': 'สิ่งศักดิ์สิทธิ์',
};

const textValue = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const absoluteUrl = (value: string, baseUrl: string) => {
  if (!value) return '';
  try {
    return new URL(value, `${baseUrl}/`).toString();
  } catch {
    return value;
  }
};

const MataData = ({ data, url }: MataDataProps) => {
  const pathname = usePathname();
  const { data: temple } = usePublicTemple();
  const contact = temple?.branding.contact;
  const templeName = temple?.name || 'วัดบ้านเหล่า - สุขธัมมาราม';
  const pageName = data?.title || ROUTE_TITLES[pathname] || templeName;
  const title = pathname === '/' && !data?.title ? templeName : `${pageName} | ${templeName}`;
  const description =
    textValue(data?.description) ||
    textValue(contact?.seoDescription) ||
    textValue(contact?.address) ||
    `เว็บไซต์อย่างเป็นทางการของ${templeName} รวมข่าวสาร กิจกรรม บทความ และข้อมูลของวัด`;
  const domain = textValue(temple?.primaryDomain)
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.websiteUrl;
  const baseUrl = domain ? `https://${domain}` : configuredUrl.replace(/\/$/, '');
  let canonicalPath = pathname;
  if (url) {
    try {
      canonicalPath = new URL(url, baseUrl).pathname;
    } catch {
      canonicalPath = pathname;
    }
  }
  const canonicalUrl = `${baseUrl}${canonicalPath === '/' ? '' : canonicalPath}`;
  const imageUrl = absoluteUrl(
    resolveContentImage(data?.imageUrl || temple?.branding.ogImageUrl || temple?.branding.logoUrl),
    baseUrl
  );
  const faviconUrl = absoluteUrl(
    temple?.branding.faviconUrl || temple?.branding.logoUrl || '/favicon/favicon.ico',
    baseUrl
  );
  const isArticle = Boolean(data?.title && pathname !== '/');
  const sameAs = [contact?.facebook, contact?.instagram, contact?.youtube]
    .map(textValue)
    .filter(Boolean);
  const organizationJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: templeName,
      alternateName: textValue(contact?.nameEnglish) || undefined,
      url: baseUrl,
      logo: imageUrl || undefined,
      image: imageUrl || undefined,
      email: textValue(contact?.email) || undefined,
      address: textValue(contact?.address) || undefined,
      sameAs: sameAs.length ? sameAs : undefined,
    }),
    [baseUrl, contact, imageUrl, sameAs, templeName]
  );
  const articleJsonLd = isArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: pageName,
        description,
        image: imageUrl || undefined,
        datePublished: data?.createdDate || undefined,
        dateModified: data?.updatedAt || data?.createdDate || undefined,
        author: data?.author ? { '@type': 'Person', name: data.author } : organizationJsonLd,
        publisher: organizationJsonLd,
        mainEntityOfPage: canonicalUrl,
      }
    : null;

  return (
    <Head>
      <title key="title">{title}</title>
      <meta key="description" name="description" content={description} />
      <meta key="robots" name="robots" content="index,follow,max-image-preview:large" />
      <link key="canonical" rel="canonical" href={canonicalUrl} />
      <link key="icon" rel="icon" href={faviconUrl} />
      <meta key="og-locale" property="og:locale" content="th_TH" />
      <meta key="og-type" property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta key="og-title" property="og:title" content={title} />
      <meta key="og-description" property="og:description" content={description} />
      <meta key="og-url" property="og:url" content={canonicalUrl} />
      <meta key="og-site-name" property="og:site_name" content={templeName} />
      {imageUrl ? <meta key="og-image" property="og:image" content={imageUrl} /> : null}
      <meta key="twitter-card" name="twitter:card" content="summary_large_image" />
      <meta key="twitter-title" name="twitter:title" content={title} />
      <meta key="twitter-description" name="twitter:description" content={description} />
      {imageUrl ? <meta key="twitter-image" name="twitter:image" content={imageUrl} /> : null}
      {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
        <meta
          key="google-site-verification"
          name="google-site-verification"
          content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION}
        />
      ) : null}
      <script
        key="organization-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {articleJsonLd ? (
        <script
          key="article-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleJsonLd).replace(/</g, '\\u003c'),
          }}
        />
      ) : null}
    </Head>
  );
};

export default MataData;
