import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery } from '@tanstack/react-query';

import Image from 'src/components/image';
import MataData from 'src/components/mata-data/mata-data';
import { CONFIG } from 'src/config-global';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import { usePublicTenantKey } from 'src/hooks/use-public-tenant-key';
import { MainLayout } from 'src/layouts/main';
import type { TemplePage } from 'src/types/temple-page';
import axios from 'src/utils/axios';

const fetchPage = async (params: { pageKey?: string; slug?: string }) => {
  const response = await axios.get('/api/public/pages', { params });
  return response.data as { temple: string; page: TemplePage };
};

export function TemplePageContent({ page }: { page: TemplePage }) {
  return (
    <MainLayout>
      <MataData
        data={{
          title: page.seoTitle || page.title,
          description: page.seoDescription || page.excerpt,
          imageUrl: page.heroImageUrl,
        }}
      />
      <Container
        maxWidth="lg"
        sx={{ py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT } }}
      >
        <Stack spacing={3} alignItems="stretch">
          {page.eyebrow ? (
            <Typography align="center" color="text.secondary">
              {page.eyebrow}
            </Typography>
          ) : null}
          <Typography variant="h2" align="left">
            {page.title}
          </Typography>
          {page.excerpt ? (
            <Typography variant="h6" color="text.secondary" align="left">
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
  const { data: temple } = usePublicTemple();
  const { data, isLoading, error } = useQuery({
    queryKey: ['managed-page', tenantKey, pageKey],
    queryFn: () => fetchPage({ pageKey }),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <Container maxWidth={false} sx={{ py: { xs: 7, md: 10 } }}>
          <Stack spacing={2.5} alignItems="center">
            <Skeleton variant="text" width="28%" height={28} />
            <Skeleton variant="text" width="52%" height={56} />
            <Skeleton
              variant="rounded"
              animation="wave"
              sx={{ width: 1, height: { xs: 320, md: 520 }, borderRadius: 2 }}
            />
          </Stack>
        </Container>
      </MainLayout>
    );
  }

  // A missing managed page intentionally falls back to the route's legacy
  // implementation. Do not mount that tenant-specific legacy content while
  // the request is still pending, otherwise another temple flashes on screen.
  const canUseLegacyContent = pageKey === 'home' || temple?.slug === 'wat-banlao';

  if (error || !data) {
    if (canUseLegacyContent) return children;
    return (
      <MainLayout>
        <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 } }}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Typography variant="h4">ไม่พบข้อมูลหรือบริการที่ร้องขอ</Typography>
            <Typography color="text.secondary">
              วัดนี้ยังไม่ได้เผยแพร่ข้อมูลสำหรับหน้านี้
            </Typography>
          </Stack>
        </Container>
      </MainLayout>
    );
  }

  const page = data?.page;
  const hasManagedContent = Boolean(
    page?.heroImageUrl || page?.content || page?.excerpt || page?.eyebrow
  );
  const shouldUseManagedPage = Boolean(page && !page.useLegacyContent && hasManagedContent);
  if (shouldUseManagedPage && page) return <TemplePageContent page={page} />;
  if (canUseLegacyContent) return children;

  return (
    <MainLayout>
      <Container maxWidth="md" sx={{ py: { xs: 10, md: 16 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center">
          <Typography variant="h4">ยังไม่มีข้อมูลสำหรับหน้านี้</Typography>
          <Typography color="text.secondary">กรุณาติดตามการเผยแพร่ข้อมูลจากทางวัด</Typography>
        </Stack>
      </Container>
    </MainLayout>
  );
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
