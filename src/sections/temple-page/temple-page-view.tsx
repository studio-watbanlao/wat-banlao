import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';
import dynamic from 'next/dynamic';

import Image from 'src/components/image';
import MataData from 'src/components/mata-data/mata-data';
import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';
import { resolvePublicTemplateKey } from 'src/public-templates/catalog';
import { usePublicTemple } from 'src/public-templates/use-public-temple';
import { usePublicTenantKey } from 'src/public-templates/use-public-tenant-key';

const SerenePageContent = dynamic(() =>
  import('src/public-templates/serene/serene-page-content').then(
    (module) => module.SerenePageContent
  )
);

const Template1PageContent = dynamic(() =>
  import('src/public-templates/template-1/template-1-page-content').then(
    (module) => module.Template1PageContent
  )
);

const fetchPage = async (params: { pageKey?: string; slug?: string }) => {
  const response = await axios.get('/api/public/pages', { params });
  return response.data as { temple: string; page: TemplePage };
};

export function TemplePageContent({ page }: { page: TemplePage }) {
  const { data: temple } = usePublicTemple();
  const template = resolvePublicTemplateKey(temple?.branding.publicTemplate);

  return (
    <MainLayout>
      <MataData
        data={{
          title: page.seoTitle || page.title,
          description: page.seoDescription || page.excerpt,
          imageUrl: page.heroImageUrl,
        }}
      />
      {template === 'serene' ? (
        <SerenePageContent page={page} />
      ) : template === 'template-1' ? (
        <Template1PageContent page={page} />
      ) : (
        <Container
          maxWidth="lg"
          sx={{ py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT } }}
        >
          <Stack spacing={3} alignItems={page.templateKey === 'landing' ? 'center' : 'stretch'}>
            {page.eyebrow ? (
              <Typography align="center" color="text.secondary">
                {page.eyebrow}
              </Typography>
            ) : null}
            <Typography variant="h2" align={page.templateKey === 'landing' ? 'center' : 'left'}>
              {page.title}
            </Typography>
            {page.excerpt ? (
              <Typography
                variant="h6"
                color="text.secondary"
                align={page.templateKey === 'landing' ? 'center' : 'left'}
              >
                {page.excerpt}
              </Typography>
            ) : null}
            {page.heroImageUrl ? (
              <Image
                src={page.heroImageUrl}
                alt={page.title}
                visibleByDefault
                sx={{ width: '100%', maxHeight: 560, objectFit: 'cover', borderRadius: 2 }}
              />
            ) : null}
            {page.content ? (
              <Box
                sx={{
                  typography: 'body1',
                  width: '100%',
                  '& img': { maxWidth: '100%', height: 'auto' },
                }}
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            ) : null}
          </Stack>
        </Container>
      )}
    </MainLayout>
  );
}

export function ManagedPageOverride({
  pageKey,
  children,
}: {
  pageKey: string;
  children: React.ReactNode;
}) {
  const tenantKey = usePublicTenantKey();
  const { data } = useQuery({
    queryKey: ['managed-page', tenantKey, pageKey],
    queryFn: () => fetchPage({ pageKey }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  const page = data?.page;
  const hasManagedContent = Boolean(
    page?.heroImageUrl || page?.content || page?.excerpt || page?.eyebrow
  );
  const shouldUseManagedPage = Boolean(page && !page.useLegacyContent && hasManagedContent);
  return shouldUseManagedPage && page ? <TemplePageContent page={page} /> : children;
}

export function DynamicTemplePage({ slug }: { slug: string }) {
  const tenantKey = usePublicTenantKey();
  const { data, isLoading, error } = useQuery({
    queryKey: ['managed-page-slug', tenantKey, slug],
    queryFn: () => fetchPage({ slug }),
    enabled: Boolean(slug),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
  if (isLoading)
    return (
      <MainLayout>
        <Container sx={{ py: 10 }}>
          <Typography>กำลังโหลด...</Typography>
        </Container>
      </MainLayout>
    );
  if (error || !data)
    return (
      <MainLayout>
        <Container sx={{ py: 10 }}>
          <Typography variant="h4">ไม่พบหน้าเว็บไซต์</Typography>
        </Container>
      </MainLayout>
    );
  return <TemplePageContent page={data.page} />;
}
