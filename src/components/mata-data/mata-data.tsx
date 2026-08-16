import Head from 'next/head';
import { useMemo } from 'react';

import { CONFIG } from 'src/config-global';
import { DEFAULT_OG_IMAGE } from 'src/constants/images';
import { usePathname } from 'src/routes/hooks';
import { usePublicTemple } from 'src/hooks/use-public-temple';

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
  '/article/content': 'บทความ',
  '/banlao/architecture': 'สถาปัตย์และสิ่งสำคัญ',
  '/banlao/history': 'ประวัติวัด',
  '/banlao/abbot': 'เจ้าอาวาสวัดบ้านเหล่า',
  '/banlao/monks': 'ทำเนียบพระสงฆ์',
  '/banlao/community-history': 'ประวัติชุมชนบ้านเหล่า',
  '/banlao/community-leaders': 'ผู้นำชุมชนบ้านเหล่า',
  '/banlao/school': 'โรงเรียนบ้านเหล่า',
  '/community/community-history': 'ประวัติชุมชนบ้านเหล่า',
  '/community/community-leaders': 'ผู้นำชุมชนบ้านเหล่า',
  '/community/school': 'โรงเรียนบ้านเหล่า',
  '/fastival': 'เทศกาลและงานประเพณี',
  '/article/blog': 'บทความ',
  '/article/dharma': 'ธรรมะ',
  '/contact-us': 'ติดต่อวัด',
  '/parents/sacred': 'สิ่งศักดิ์สิทธิ์',
  '/parents/luang-pu-sa': 'ประวัติหลวงปู่สาธุ์ สุขธมฺโม',
  '/parents/luang-pu-pramuan': 'ประวัติหลวงปู่ประมวล ญาณวโร',
};

const ROUTE_DESCRIPTIONS: Record<string, string> = {
  '/about-us': 'ประวัติ ความเป็นมา และข้อมูลสำคัญของวัด',
  '/activity': 'ติดตามกิจกรรม ข่าวสาร และประชาสัมพันธ์ล่าสุดจากทางวัด',
  '/article/blog': 'รวมบทความ ข่าวสาร และสาระน่ารู้จากทางวัด',
  '/article/content': 'รวมบทความและสาระน่ารู้จากทางวัด',
  '/article/dharma': 'รวมบทความธรรมะ หลักธรรม และข้อคิดสำหรับการดำเนินชีวิต',
  '/banlao/architecture': 'ชมสถาปัตยกรรม ศาสนสถาน และสิ่งสำคัญภายในวัด',
  '/banlao/history': 'เรียนรู้ประวัติและความเป็นมาของวัดบ้านเหล่า',
  '/contact-us': 'ข้อมูลการติดต่อ ที่อยู่ และช่องทางสื่อสารกับทางวัด',
  '/fastival': 'ข้อมูลเทศกาล งานบุญ และประเพณีสำคัญของวัดและชุมชน',
  '/parents/sacred': 'ข้อมูลสิ่งศักดิ์สิทธิ์และวัตถุมงคลภายในวัด',
};

const NO_INDEX_PREFIXES = ['/api', '/auth', '/dashboard', '/error', '/coming-soon'];

const SEO_KEYWORDS = [
  'หลวงปู่สาธุ์',
  'หลวงปู่สาธู์ สุขธัมโม',
  'วัดบ้านเหล่า',
  'วัดบ้านเหล่า สุขธัมมาราม',
  'ตำบลเม็กดำ',
  'พระเกจิ',
  'หลวงปู่ประมวล ญาณวโร',
  'พระครูประสาทสมณกิจ',
  'หลวงปู่สาธุ์ สุขธมฺโม',
];

const SEO_KEYWORDS_CONTENT = SEO_KEYWORDS.join(', ');

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
  const shouldIndex = !NO_INDEX_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const { data: temple } = usePublicTemple();
  const contact = temple?.branding.contact;
  const templeName = temple?.name || 'วัดบ้านเหล่า - สุขธัมมาราม';
  const pageName = data?.title || ROUTE_TITLES[pathname] || templeName;
  const title = pathname === '/' && !data?.title ? templeName : `${pageName} | ${templeName}`;
  const description =
    textValue(data?.description) ||
    ROUTE_DESCRIPTIONS[pathname] ||
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
    data?.imageUrl || temple?.branding.ogImageUrl || DEFAULT_OG_IMAGE,
    baseUrl
  );
  const isDefaultOgImage = imageUrl === DEFAULT_OG_IMAGE;
  const faviconUrl = absoluteUrl('/favicon.ico', baseUrl);
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
      keywords: SEO_KEYWORDS_CONTENT,
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
        keywords: SEO_KEYWORDS_CONTENT,
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
      {shouldIndex ? <meta key="keywords" name="keywords" content={SEO_KEYWORDS_CONTENT} /> : null}
      <meta
        key="robots"
        name="robots"
        content={shouldIndex ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}
      />
      <meta
        key="googlebot"
        name="googlebot"
        content={shouldIndex ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}
      />
      <link key="canonical" rel="canonical" href={canonicalUrl} />
      <link key="icon" rel="icon" href={faviconUrl} />
      <meta key="og-locale" property="og:locale" content="th_TH" />
      <meta key="og-type" property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta key="og-title" property="og:title" content={title} />
      <meta key="og-description" property="og:description" content={description} />
      <meta key="og-url" property="og:url" content={canonicalUrl} />
      <meta key="og-site-name" property="og:site_name" content={templeName} />
      {imageUrl ? <meta key="og-image" property="og:image" content={imageUrl} /> : null}
      {isDefaultOgImage ? (
        <meta key="og-image-width" property="og:image:width" content="1200" />
      ) : null}
      {isDefaultOgImage ? (
        <meta key="og-image-height" property="og:image:height" content="630" />
      ) : null}
      {imageUrl ? <meta key="og-image-alt" property="og:image:alt" content={title} /> : null}
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
