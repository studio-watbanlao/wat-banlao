'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useGetBanner } from 'src/queries/banner';
import HomeArticle from 'src/sections/home/home-article';
import HomeBannerList from 'src/sections/home/home-banner-list';
import HomeDailyDhamma from 'src/sections/home/home-daily-dhamma';
import HomeTempleFestival from 'src/sections/home/home-temple-festival';
import { usePublicTemple } from 'src/public-templates/use-public-temple';

export function SereneHomeView() {
  const { data: banners = [] } = useGetBanner();
  const { data: temple } = usePublicTemple();

  return (
    <>
      <Box component="section" sx={{ pt: { xs: 6, md: 10 }, pb: { xs: 7, md: 12 }, overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Stack spacing={2.5} alignItems="center" textAlign="center" sx={{ maxWidth: 820, mx: 'auto', mb: 6 }}>
            <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 3 }}>
              ศรัทธา · สงบ · เรียนรู้
            </Typography>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, lineHeight: 1.08 }}>
              {temple?.name || 'ยินดีต้อนรับสู่เว็บไซต์วัด'}
            </Typography>
            <Typography variant="h6" sx={{ maxWidth: 660, color: 'text.secondary', fontWeight: 400, lineHeight: 1.8 }}>
              ศูนย์รวมจิตใจของชุมชน และพื้นที่เผยแผ่พระธรรม ประเพณี และวัฒนธรรม
            </Typography>
          </Stack>
          <Box sx={{ p: { xs: 1, md: 1.5 }, bgcolor: 'common.white', borderRadius: { xs: 2, md: 4 }, boxShadow: '0 24px 80px rgba(37,48,43,0.12)' }}>
            <HomeBannerList list={banners} />
          </Box>
        </Container>
      </Box>

      <Box sx={{ bgcolor: 'common.white', py: { xs: 6, md: 10 } }}>
        <HomeDailyDhamma />
      </Box>
      <HomeTempleFestival />
      <Box sx={{ bgcolor: 'common.white', py: { xs: 2, md: 4 } }}>
        <HomeArticle />
      </Box>
    </>
  );
}
