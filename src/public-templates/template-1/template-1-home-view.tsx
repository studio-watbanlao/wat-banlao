'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { usePublicTemple } from 'src/public-templates/use-public-temple';
import { useGetArchitecture } from 'src/queries/architecture';
import { useGetBanner } from 'src/queries/banner';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import HomeArticle from 'src/sections/home/home-article';
import { usePublicTempleDirectory } from 'src/sections/monks/use-public-temple-directory';
import type { BannerItem } from 'src/types/banner';

const contactText = (contact: Record<string, unknown> | undefined, key: string) => {
  const value = contact?.[key];
  return typeof value === 'string' ? value.trim() : '';
};

const bannerImage = (banner: BannerItem, mobile = false) =>
  (mobile ? banner.mobileImageUrl : banner.desktopImageUrl) ||
  banner.desktopImageUrl ||
  banner.imageUrl ||
  '';

const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const sectionEyebrowSx = {
  fontWeight: 800,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
} as const;

export function Template1HomeView() {
  const theme = useTheme();
  const { data: temple } = usePublicTemple();
  const { data: bannerData = [], isLoading: isBannerLoading } = useGetBanner();
  const { data: directoryEntries = [], isLoading: isDirectoryLoading } = usePublicTempleDirectory();
  const { data: architectureData = [], isLoading: isArchitectureLoading } = useGetArchitecture();
  const [heroIndex, setHeroIndex] = useState(0);

  const contact = temple?.branding.contact;
  const templeName = temple?.name || 'เว็บไซต์วัด';
  const templeNameEnglish = contactText(contact, 'nameEnglish');
  const address = contactText(contact, 'address');
  const openingHours = contactText(contact, 'openingHours');
  const email = contactText(contact, 'email');
  const templeLogo = temple?.branding.logoUrl;
  const currentAbbot = directoryEntries.find((entry) => entry.entryType === 'CURRENT_ABBOT');
  const featuredArchitectures = architectureData.slice(0, 4);
  const heroBanners = useMemo(
    () => bannerData.filter((banner) => Boolean(bannerImage(banner))),
    [bannerData]
  );
  const activeBanner = heroBanners[heroIndex];

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined;
    const timer = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % heroBanners.length),
      6500
    );
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);

  useEffect(() => {
    setHeroIndex((current) => (current < heroBanners.length ? current : 0));
  }, [heroBanners.length]);

  return (
    <Box component="main" sx={{ overflow: 'hidden', bgcolor: '#F6F1E7', color: '#163B2D' }}>
      <Box
        component="section"
        aria-label="ภาพแนะนำวัด"
        sx={{
          minHeight: { xs: 650, md: 760, lg: 820 },
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          color: 'common.white',
          bgcolor: '#0B2F22',
        }}
      >
        {isBannerLoading ? (
          <Skeleton
            variant="rectangular"
            animation="wave"
            sx={{ position: 'absolute', inset: 0, height: 1, bgcolor: alpha('#FFFFFF', 0.08) }}
          />
        ) : null}

        {!isBannerLoading && heroBanners.length
          ? heroBanners.map((banner, index) => (
              <Box key={banner.id} sx={{ position: 'absolute', inset: 0 }}>
                <Image
                  src={bannerImage(banner, true)}
                  alt={banner.title || `ภาพแนะนำ ${templeName}`}
                  visibleByDefault
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: 1,
                    height: 1,
                    display: { xs: 'block', md: 'none' },
                    opacity: index === heroIndex ? 1 : 0,
                    transition: 'opacity 900ms ease',
                    '& img': { objectFit: 'cover', objectPosition: 'center' },
                  }}
                />
                <Image
                  src={bannerImage(banner)}
                  alt={banner.title || `ภาพแนะนำ ${templeName}`}
                  visibleByDefault
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: 1,
                    height: 1,
                    display: { xs: 'none', md: 'block' },
                    opacity: index === heroIndex ? 1 : 0,
                    transition: 'opacity 900ms ease',
                    '& img': { objectFit: 'cover', objectPosition: 'center' },
                  }}
                />
              </Box>
            ))
          : null}

        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: heroBanners.length
              ? 'linear-gradient(90deg, rgba(5,30,21,0.94) 0%, rgba(5,30,21,0.62) 45%, rgba(5,30,21,0.12) 78%), linear-gradient(0deg, rgba(5,30,21,0.92) 0%, transparent 52%)'
              : 'radial-gradient(circle at 80% 20%, rgba(201,155,65,0.24), transparent 30%), linear-gradient(135deg, #123E2F 0%, #06271C 75%)',
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, pb: { xs: 6, md: 8 } }}>
          <Box sx={{ maxWidth: 760 }}>
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
              {templeLogo ? (
                <Image
                  src={templeLogo}
                  alt={`โลโก้${templeName}`}
                  ratio="1/1"
                  sx={{
                    width: { xs: 64, md: 78 },
                    borderRadius: '50%',
                    bgcolor: alpha('#FFFFFF', 0.12),
                    '& img': { objectFit: 'contain' },
                  }}
                />
              ) : null}
              {templeNameEnglish ? (
                <Typography
                  sx={{ color: alpha('#FFFFFF', 0.72), fontWeight: 700, letterSpacing: 2 }}
                >
                  {templeNameEnglish}
                </Typography>
              ) : null}
            </Stack>

            <Typography
              component="h1"
              sx={{
                maxWidth: 720,
                fontSize: { xs: 44, sm: 60, md: 78 },
                fontWeight: 800,
                lineHeight: 1.08,
                textWrap: 'balance',
              }}
            >
              {activeBanner?.title || templeName}
            </Typography>
            {activeBanner?.title && activeBanner.title !== templeName ? (
              <Typography variant="h5" sx={{ mt: 2, color: alpha('#FFFFFF', 0.78) }}>
                {templeName}
              </Typography>
            ) : null}
            {address ? (
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 2.5 }}>
                <Iconify icon="solar:map-point-linear" width={21} sx={{ mt: 0.25 }} />
                <Typography sx={{ maxWidth: 580, color: alpha('#FFFFFF', 0.72), lineHeight: 1.8 }}>
                  {address}
                </Typography>
              </Stack>
            ) : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4 }}>
              {activeBanner?.linkUrl ? (
                <Button
                  component="a"
                  href={activeBanner.linkUrl}
                  variant="contained"
                  color="secondary"
                  endIcon={<Iconify icon="solar:arrow-right-linear" />}
                  sx={{ minHeight: 48, px: 3 }}
                >
                  ดูรายละเอียด
                </Button>
              ) : null}
              <Button
                component={RouterLink}
                href={paths.activity.root}
                variant="outlined"
                sx={{
                  minHeight: 48,
                  px: 3,
                  color: 'common.white',
                  borderColor: alpha('#FFFFFF', 0.46),
                  '&:hover': { borderColor: 'common.white', bgcolor: alpha('#FFFFFF', 0.08) },
                }}
              >
                กิจกรรมและข่าวสาร
              </Button>
            </Stack>
          </Box>

          {heroBanners.length > 1 ? (
            <Stack direction="row" spacing={1} sx={{ mt: 5 }}>
              {heroBanners.map((banner, index) => (
                <Box
                  key={banner.id}
                  component="button"
                  type="button"
                  aria-label={`แสดงแบนเนอร์ ${index + 1}`}
                  onClick={() => setHeroIndex(index)}
                  sx={{
                    p: 0,
                    border: 0,
                    height: 4,
                    width: index === heroIndex ? 52 : 18,
                    borderRadius: 2,
                    cursor: 'pointer',
                    bgcolor: index === heroIndex ? 'secondary.main' : alpha('#FFFFFF', 0.36),
                    transition: 'width 220ms ease, background-color 220ms ease',
                  }}
                />
              ))}
            </Stack>
          ) : null}
        </Container>
      </Box>

      <Box component="section" sx={{ position: 'relative', zIndex: 2, mt: { md: -3 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              borderRadius: { xs: 0, md: 2.5 },
              overflow: 'hidden',
              bgcolor: '#FFFFFF',
              boxShadow: { md: '0 24px 70px rgba(18,62,47,0.14)' },
            }}
          >
            {[
              { icon: 'solar:map-point-linear', label: 'สถานที่ตั้ง', value: address },
              { icon: 'solar:clock-circle-linear', label: 'ช่วงเวลาทำการ', value: openingHours },
              { icon: 'solar:letter-linear', label: 'อีเมล', value: email },
            ].map((item, index) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={2}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderTop: { xs: index ? '1px solid' : 0, md: 0 },
                  borderLeft: { md: index ? '1px solid' : 0 },
                  borderColor: 'divider',
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.secondary.main, 0.18),
                  }}
                >
                  <Iconify icon={item.icon} width={22} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 0.4, color: 'text.primary' }}>
                    {item.value || 'ยังไม่ได้ระบุข้อมูล'}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      <Box component="section" sx={{ py: { xs: 8, md: 13 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gap: { xs: 5, md: 8 },
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 0.88fr) minmax(0, 1.12fr)' },
              alignItems: 'center',
            }}
          >
            {isDirectoryLoading ? (
              <Skeleton
                variant="rounded"
                sx={{ width: 1, aspectRatio: '4 / 5', borderRadius: 3 }}
              />
            ) : currentAbbot?.imageUrl ? (
              <Box sx={{ position: 'relative', maxWidth: 600 }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    left: -20,
                    width: 120,
                    height: 120,
                    borderTop: '2px solid',
                    borderLeft: '2px solid',
                    borderColor: 'secondary.main',
                  }}
                />
                <Image
                  src={currentAbbot.imageUrl}
                  alt={`รูป${currentAbbot.fullName}`}
                  sx={{
                    width: 1,
                    aspectRatio: '4 / 5',
                    borderRadius: 3,
                    boxShadow: '0 28px 70px rgba(16,55,41,0.18)',
                    '& img': { objectFit: 'cover', objectPosition: 'center top' },
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  aspectRatio: '4 / 5',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 3,
                  border: '1px dashed',
                  borderColor: alpha(theme.palette.primary.main, 0.24),
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Stack alignItems="center" spacing={1.5}>
                  <Iconify icon="solar:user-circle-linear" width={52} />
                  <Typography color="text.secondary">ยังไม่มีข้อมูลเจ้าอาวาสปัจจุบัน</Typography>
                </Stack>
              </Box>
            )}

            <Box>
              <Typography variant="overline" color="secondary.dark" sx={sectionEyebrowSx}>
                ฝ่ายปกครองวัด
              </Typography>
              <Typography
                component="h3"
                sx={{ mt: 1, fontSize: { xs: 38, md: 58 }, fontWeight: 700, lineHeight: 1.15 }}
              >
                เจ้าอาวาส{templeName}
              </Typography>
              <Typography variant="h4" sx={{ mt: 3 }}>
                {currentAbbot?.fullName || 'อยู่ระหว่างปรับปรุงข้อมูล'}
              </Typography>
              {currentAbbot?.displayTitle ? (
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {currentAbbot.displayTitle}
                </Typography>
              ) : null}
              {currentAbbot?.biography ? (
                <Typography sx={{ mt: 3, maxWidth: 680, color: 'text.secondary', lineHeight: 1.9 }}>
                  {plainText(currentAbbot.biography).slice(0, 420)}
                  {plainText(currentAbbot.biography).length > 420 ? '…' : ''}
                </Typography>
              ) : null}
              {currentAbbot?.monasticRank ? (
                <Chip
                  label={plainText(currentAbbot.monasticRank).slice(0, 100)}
                  sx={{
                    mt: 3,
                    bgcolor: alpha(theme.palette.secondary.main, 0.2),
                    color: 'primary.dark',
                  }}
                />
              ) : null}
              <Button
                component={RouterLink}
                href={paths.banlao.abbot}
                variant="contained"
                endIcon={<Iconify icon="solar:arrow-right-linear" />}
                sx={{ mt: 4 }}
              >
                ดูประวัติเจ้าอาวาส
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        component="section"
        sx={{ py: { xs: 8, md: 12 }, color: 'common.white', bgcolor: '#0B3023' }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ md: 'flex-end' }}
            spacing={2}
            sx={{ mb: 5 }}
          >
            <Box>
              <Typography variant="overline" sx={{ ...sectionEyebrowSx, color: 'secondary.main' }}>
                มรดกทางศิลปวัฒนธรรม
              </Typography>
              <Typography
                component="h2"
                sx={{ mt: 1, fontSize: { xs: 38, md: 56 }, fontWeight: 700 }}
              >
                สถาปัตย์และสิ่งสำคัญ
              </Typography>
              <Typography
                sx={{ mt: 1.5, maxWidth: 680, color: alpha('#FFFFFF', 0.64), lineHeight: 1.8 }}
              >
                เรียนรู้เรื่องราวและคุณค่าของสถานที่สำคัญภายใน{templeName}
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              href={paths.banlao.architecture.root}
              color="secondary"
              endIcon={<Iconify icon="solar:arrow-right-linear" />}
            >
              ดูทั้งหมด
            </Button>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gap: 2.5,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            }}
          >
            {isArchitectureLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    sx={{ height: 390, bgcolor: alpha('#FFFFFF', 0.08) }}
                  />
                ))
              : featuredArchitectures.map((item, index) => (
                  <Box
                    key={item.id}
                    component={RouterLink}
                    href={paths.banlao.architecture.details(item.id)}
                    sx={{
                      display: 'block',
                      position: 'relative',
                      minHeight: { xs: 340, lg: index % 2 ? 430 : 390 },
                      overflow: 'hidden',
                      borderRadius: 2.5,
                      color: 'common.white',
                      textDecoration: 'none',
                      bgcolor: '#153D30',
                      '&:hover img': { transform: 'scale(1.045)' },
                    }}
                  >
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          width: 1,
                          height: 1,
                          '& img': { objectFit: 'cover', transition: 'transform 500ms ease' },
                        }}
                      />
                    ) : null}
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        background:
                          'linear-gradient(0deg, rgba(3,24,16,0.96) 0%, rgba(3,24,16,0.06) 68%)',
                      }}
                    />
                    <Box sx={{ position: 'absolute', insetInline: 0, bottom: 0, p: 3 }}>
                      {item.year ? (
                        <Typography variant="caption" sx={{ color: 'secondary.main' }}>
                          {item.year}
                        </Typography>
                      ) : null}
                      <Typography variant="h5" sx={{ mt: 0.5 }}>
                        {item.title}
                      </Typography>
                      {item.description ? (
                        <Typography
                          sx={{
                            mt: 1,
                            color: alpha('#FFFFFF', 0.62),
                            display: '-webkit-box',
                            overflow: 'hidden',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                          }}
                        >
                          {plainText(item.description)}
                        </Typography>
                      ) : null}
                    </Box>
                  </Box>
                ))}
          </Box>

          {!isArchitectureLoading && !featuredArchitectures.length ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                minHeight: 260,
                border: `1px dashed ${alpha('#FFFFFF', 0.24)}`,
                borderRadius: 2.5,
              }}
            >
              <Iconify
                icon="solar:buildings-2-linear"
                width={48}
                sx={{ color: alpha('#FFFFFF', 0.48) }}
              />
              <Typography sx={{ color: alpha('#FFFFFF', 0.64) }}>
                ยังไม่มีข้อมูลสถาปัตย์ที่เผยแพร่
              </Typography>
            </Stack>
          ) : null}
        </Container>
      </Box>

      <HomeArticle maxWidth="xl" />
    </Box>
  );
}
