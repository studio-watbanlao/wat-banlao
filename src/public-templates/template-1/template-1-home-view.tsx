'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { usePublicTemple } from 'src/public-templates/use-public-temple';
import { useGetArchitecture } from 'src/queries/architecture';
import { useGetBanner } from 'src/queries/banner';
import { paths } from 'src/routes/paths';
import HomeArticle from 'src/sections/home/home-article';
import { usePublicTempleDirectory } from 'src/sections/monks/use-public-temple-directory';
import type { BannerItem } from 'src/types/banner';

// ----------------------------------------------------------------------

const DEFAULT_HERO_IMAGE = '/assets/images/overlay_4.jpg';
const MEMORIAL_IMAGE = '/assets/akhahas-sri/rip-1.jpeg';

const SCENES_1_IMAGE = '/assets/akhahas-sri/hero-5.jpeg';

const highlights = [
  {
    icon: '99',
    title: 'ศูนย์รวมแห่งศรัทธา',
    body: 'พื้นที่สืบสานพระพุทธศาสนาและเป็นศูนย์รวมจิตใจของชุมชน',
  },
  {
    icon: '99',
    title: 'กิจกรรมและข่าวสาร',
    body: 'ติดตามกิจกรรม งานบุญ และข่าวสารสำคัญของวัดได้ในที่เดียว',
  },
  {
    icon: '99',
    title: 'พระธรรมและชุมชน',
    body: 'ร่วมเรียนรู้หลักธรรมและสืบสานวัฒนธรรมที่ดีงามของชุมชน',
  },
];

const contactText = (contact: Record<string, unknown> | undefined, key: string) => {
  const value = contact?.[key];
  return typeof value === 'string' ? value.trim() : '';
};

const bannerImage = (banner: BannerItem, mobile = false) =>
  (mobile ? banner.mobileImageUrl : banner.desktopImageUrl) ||
  banner.desktopImageUrl ||
  banner.imageUrl ||
  DEFAULT_HERO_IMAGE;

const ROYAL_IMAGE_ITEMS = [
  {
    title: 'สมเด็จพระกนิษฐาธิราชเจ้า ฯ เชิญขวัญแม่โคสกเจ้า เข้าคืนนา',
    src: '/assets/akhahas-sri/ac-1.png',
  },
  {
    title: 'สมเด็จพระกนิษฐาธิราชเจ้า ฯ เชิญขวัญแม่โคสกเจ้า เข้าคืนนา',
    src: '/assets/akhahas-sri/ac-2.png',
  },
  {
    title: 'สมเด็จพระกนิษฐาธิราชเจ้า ฯ เชิญขวัญแม่โคสกเจ้า เข้าคืนนา',
    src: '/assets/akhahas-sri/ac-3.png',
  },
  {
    title: 'สมเด็จพระกนิษฐาธิราชเจ้า ฯ เชิญขวัญแม่โคสกเจ้า เข้าคืนนา',
    src: '/assets/akhahas-sri/ac-4.png',
  },
];

export function Template1HomeView() {
  const theme = useTheme();
  const { data: temple } = usePublicTemple();
  const { data: bannerData = [], isLoading: isBannerLoading } = useGetBanner();
  const { data: directoryEntries = [], isLoading: isAbbotLoading } = usePublicTempleDirectory();
  const { data: architectureData = [], isLoading: isArchitectureLoading } = useGetArchitecture();
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedImage, setSelectedImage] = useState<(typeof ROYAL_IMAGE_ITEMS)[number] | null>(
    null
  );
  const heroBanners: BannerItem[] = bannerData.length
    ? bannerData
    : [
        {
          id: 'default-hero',
          title: temple?.name || 'เว็บไซต์วัด',
          desktopImageUrl: DEFAULT_HERO_IMAGE,
          mobileImageUrl: DEFAULT_HERO_IMAGE,
          sortOrder: 0,
          status: 'PUBLIC',
        },
      ];
  const contact = temple?.branding.contact;
  const templeName = temple?.name || 'เว็บไซต์วัด';
  const templeNameEnglish = contactText(contact, 'nameEnglish');
  const templeAddress = contactText(contact, 'address');
  const templeLogo = temple?.branding.logoUrl;
  const currentAbbot = directoryEntries.find((entry) => entry.entryType === 'CURRENT_ABBOT');
  const featuredArchitectures = architectureData.slice(0, 4);

  useEffect(() => {
    if (heroBanners.length <= 1) return undefined;
    const timer = window.setInterval(
      () => setHeroIndex((current) => (current + 1) % heroBanners.length),
      5000
    );
    return () => window.clearInterval(timer);
  }, [heroBanners.length]);

  useEffect(() => {
    setHeroIndex((current) => (current < heroBanners.length ? current : 0));
  }, [heroBanners.length]);

  return (
    <Box
      component="main"
      sx={{
        minHeight: '100vh',
        color: theme.palette.secondary.main,
        overflow: 'hidden',
        bgcolor: theme.palette.primary.main,
        fontFamily: "'LINE Seed Sans TH', sans-serif",
      }}
    >
      <Box
        sx={{
          minHeight: { xs: 760, md: 1020 },
          position: 'relative',
          px: { xs: 2.5, md: 8, lg: 13 },
          pt: { xs: 14, md: 19 },
          pb: { xs: 7, md: 6 },
          bgcolor: '#052518',
        }}
      >
        <Box
          sx={{
            m: 0,
            inset: 0,
            width: 1,
            height: 1,
            zIndex: 0,
            position: 'absolute',
          }}
        >
          {isBannerLoading ? (
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{ width: 1, height: 1, bgcolor: 'rgba(255,255,255,0.08)' }}
            />
          ) : (
            heroBanners.map((banner, index) => (
              <Box key={banner.id} sx={{ position: 'absolute', inset: 0 }}>
                <Image
                  alt={banner.title || `${templeName} Banner ${index + 1}`}
                  src={bannerImage(banner, true)}
                  visibleByDefault
                  sx={{
                    inset: 0,
                    width: 1,
                    height: 1,
                    display: { xs: 'block', md: 'none' },
                    position: 'absolute',
                    opacity: index === heroIndex ? 1 : 0,
                    transition: 'opacity 900ms ease',
                    '& img': { objectFit: 'cover' },
                  }}
                />
                <Image
                  alt={banner.title || `${templeName} Banner ${index + 1}`}
                  src={bannerImage(banner)}
                  visibleByDefault
                  sx={{
                    inset: 0,
                    width: 1,
                    height: 1,
                    display: { xs: 'none', md: 'block' },
                    position: 'absolute',
                    opacity: index === heroIndex ? 1 : 0,
                    transition: 'opacity 900ms ease',
                    '& img': { objectFit: 'cover' },
                  }}
                />
              </Box>
            ))
          )}
        </Box>

        <Box
          sx={{
            inset: 0,
            zIndex: 1,
            position: 'absolute',
            pointerEvents: 'none',
            backgroundImage: `
              linear-gradient(180deg, rgba(9,47,33,0.18) 0%, rgba(9,47,33,0.58) 56%, ${theme.palette.secondary.main} 100%),
              linear-gradient(90deg, rgba(5,37,24,0.94) 0%, rgba(18,61,43,0.58) 48%, rgba(5,37,24,0.84) 100%),
              linear-gradient(0deg, rgba(217,181,109,0.08), rgba(217,181,109,0.08))
            `,
          }}
        />

        <Box sx={{ mx: 'auto', maxWidth: 1440, position: 'relative', zIndex: 2 }}>
          <Box sx={{ maxWidth: 610 }}>
            {templeLogo ? (
              <Image
                alt={`โลโก้${templeName}`}
                src={templeLogo}
                ratio="1/1"
                sx={{ width: { xs: 96, md: 132 }, '& img': { objectFit: 'contain' } }}
              />
            ) : null}
            {templeNameEnglish ? (
              <Typography
                sx={{
                  mt: templeLogo ? 2 : 0,
                  color: theme.palette.secondary.main,
                  fontSize: { xs: 32, sm: 48, md: 62 },
                  fontWeight: 800,
                  lineHeight: 1,
                  textTransform: 'uppercase',
                }}
              >
                {templeNameEnglish}
              </Typography>
            ) : null}
            <Typography
              component="h1"
              variant="h1"
              sx={{ mt: templeNameEnglish ? 1 : templeLogo ? 2 : 0 }}
            >
              {templeName}
            </Typography>

            {templeAddress ? <Typography variant="h5">{templeAddress}</Typography> : null}
          </Box>

          <Stack
            spacing={1.35}
            sx={{
              top: { xs: 152, md: 170 },
              right: 0,
              width: 120,
              display: { xs: 'none', md: 'flex' },
              position: 'absolute',
              alignItems: 'flex-end',
            }}
          >
            {heroBanners.map((banner, index) => (
              <Stack
                key={banner.id}
                direction="row"
                spacing={1.3}
                alignItems="center"
                sx={{
                  color:
                    index === heroIndex ? theme.palette.secondary.main : 'rgba(246,237,219,0.48)',
                  cursor: 'pointer',
                }}
                onClick={() => setHeroIndex(index)}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 800 }}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Box
                  sx={{
                    height: 2,
                    width: index === heroIndex ? 78 : 18,
                    bgcolor:
                      index === heroIndex ? theme.palette.secondary.main : 'rgba(234,215,161,0.28)',
                  }}
                />
              </Stack>
            ))}
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 3, md: 5 }}
            sx={{
              mt: { xs: 19, md: 23 },
              pt: 3,
              borderBottom: '1px solid rgba(234,215,161,0.26)',
              pb: 4,
            }}
          >
            {highlights.map((item) => (
              <Stack key={item.title} direction="row" spacing={2.2} sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    color: theme.palette.secondary.main,
                    fontSize: 24,
                    fontWeight: 800,
                    opacity: 0.78,
                    minWidth: 34,
                    lineHeight: 1,
                  }}
                >
                  {item.icon}
                </Typography>
                <Box>
                  <Typography variant="h6">{item.title}</Typography>
                  <Typography variant="body1" sx={{ mt: 0.8, color: 'rgba(246,237,219,0.58)' }}>
                    {item.body}
                  </Typography>
                  {/* <Typography
                    variant="subtitle1"
                    sx={{
                      mt: 1.5,
                      color: theme.palette.secondary.main,
                      textTransform: 'uppercase',
                    }}
                  >
                    รากหดกหด
                  </Typography> */}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 7, md: 11 },
          // color: theme.palette.secondary.main,
          backgroundImage: `
            radial-gradient(circle at 50% 8%,  ${theme.palette.secondary.main} 0,  ${theme.palette.secondary.main} 10%),
            linear-gradient(180deg, ${theme.palette.secondary.main} 0, #034420 92px, #012d1a 100%)
          `,
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            component="img"
            src={MEMORIAL_IMAGE}
            alt="Lotus memorial collage"
            sx={{
              width: '400px',
              height: '100%',
              display: 'block',
              mx: 'auto',
              filter: 'drop-shadow(0 28px 55px rgba(9,47,33,0.12))',
            }}
          />

          <Stack sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 4 }}>
            <Box sx={{ width: '50%' }}>
              <Typography
                variant="h3"
                color="primary"
                sx={{
                  fontStyle: 'italic',
                }}
              >
                ปางเธอท่านผทม เสด็จชมเสวยสวรรค์ อาภาผ่องเพ็ญจันทร์ พระเธอนั้นนิทราลัย
                เสด็จมาเป็นแก้วตา ให้ประชาได้ชื่นใจ เสด็จสู่สุราลัย ดังดวงใจจะรานรอน
              </Typography>

              <Typography
                variant="h4"
                color="primary"
                sx={{
                  fontStyle: 'italic',
                  mt: 3,
                }}
              >
                &quot;รจนาอาลัย : รัฐพล อินโพนทัน&quot;
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              mt: 3,
              mx: 'auto',
              width: 180,
              height: 4,
              bgcolor: theme.palette.secondary.main,
              opacity: 0.72,
            }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 7, md: 10 },
          minHeight: 800,
          backgroundImage: `
            linear-gradient(0deg, ${theme.palette.primary.main} 10%, rgba(9,47,33,0.64) 48%, ${theme.palette.secondary.main} 100%),
            linear-gradient(0deg, rgba(217,181,109,0.1), rgba(217,181,109,0.1)),
            url(${SCENES_1_IMAGE})
          `,
          backgroundSize: 'cover',
          backgroundPosition: '100% 20%',
        }}
      >
        <Box sx={{ mx: 'auto', maxWidth: 1000, textAlign: 'center' }}>
          <Typography variant="h3" color="primary">
            สมเด็จพระกนิษฐาธิราชเจ้า ฯ เชิญขวัญแม่โคสกเจ้า เข้าคืนนา
          </Typography>
          <Typography variant="subtitle1" color="primary" sx={{ mt: 1.4, textAlign: 'center' }}>
            พระเทพนารี สองมือนี้ข้าถวาย มืออันเคยกรำหนักปักกล้าทำนามิวาย ขอฟ้อนถวายพระเทพนารี
            อิตถีรัตนา ข้าหมายยิ่งว่า เทิดพระทรงศรี ขอได้สดับขับกล่อมพาที ลำนำชาวนา
            เถิดพระทูลพระหม่อม เอย พระยอดกัลยา ข้า บ่มีสิ่งสูงค่าถวาย หากบ่ควรค่าใด
            ขอทรงอภัยพระยอดกัลยา ธ แสนประเสริฐ ขอสำราญเถิด พระพุทธเจ้าข้า เหล่ากสิกรจักฟ้อนถวยพร
            ไหว้ว่า ขอพระกนิษฐา จงยศยิ่งยงทรงชัย อนตายสังอันใด อย่าได้กายใกล้ พระทูลกระหม่อม เอย
          </Typography>

          <Box
            sx={{
              mt: 7,
              display: 'grid',
              gap: { xs: 2.2, sm: 2.5 },
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            {ROYAL_IMAGE_ITEMS.map((image) => (
              <Box
                key={image.src}
                className="royal-image-button"
                component="button"
                type="button"
                aria-label={`ดูภาพ ${image.title}`}
                onClick={() => setSelectedImage(image)}
                sx={{
                  p: 0,
                  m: 0,
                  border: 0,
                  width: 1,
                  display: 'block',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 1,
                  bgcolor: 'transparent',
                  position: 'relative',
                  '&::after': {
                    inset: 0,
                    opacity: 0,
                    content: '""',
                    position: 'absolute',
                    transition: 'opacity 180ms ease',
                    background:
                      'linear-gradient(180deg, rgba(5,37,24,0.02) 0%, rgba(5,37,24,0.46) 100%)',
                  },
                  '&:hover::after, &:focus-visible::after': {
                    opacity: 1,
                  },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.secondary.main}`,
                    outlineOffset: 4,
                  },
                  '&:hover .royal-image-preview-icon, &:focus-visible .royal-image-preview-icon': {
                    opacity: 1,
                    transform: 'translate(-50%, -50%) scale(1)',
                  },
                }}
              >
                <Image
                  alt={image.title}
                  src={image.src}
                  ratio="3/4"
                  sx={{
                    width: 1,
                    transition: 'transform 220ms ease',
                    '.royal-image-button:hover > &, .royal-image-button:focus-visible > &': {
                      transform: 'scale(1.04)',
                    },
                  }}
                />
                <Box
                  className="royal-image-preview-icon"
                  sx={{
                    top: '50%',
                    left: '50%',
                    zIndex: 1,
                    width: 52,
                    height: 52,
                    opacity: 0,
                    display: 'grid',
                    borderRadius: '50%',
                    placeItems: 'center',
                    position: 'absolute',
                    color: theme.palette.secondary.main,
                    transform: 'translate(-50%, -50%) scale(0.92)',
                    transition: 'opacity 180ms ease, transform 180ms ease',
                    bgcolor: 'rgba(9, 47, 33, 0.64)',
                    border: '1px solid rgba(234,215,161,0.58)',
                    boxShadow: '0 18px 40px rgba(0,0,0,0.34)',
                  }}
                >
                  <Iconify icon="solar:eye-bold" width={24} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 8, md: 12 },
          minHeight: 670,
          backgroundImage: `
            radial-gradient(circle at 15% 20%, rgba(246,237,219,0.14), transparent 34%),
            linear-gradient(135deg, ${theme.palette.secondary.main} 0%, #B48608 42%, ${theme.palette.primary.main} 100%)
          `,
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            gap: { xs: 6, md: 5 },
            maxWidth: 1280,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '0.88fr 1.12fr' },
          }}
        >
          {isAbbotLoading ? (
            <Skeleton
              variant="rounded"
              animation="wave"
              sx={{ width: 1, height: { xs: 380, md: 520 }, bgcolor: 'rgba(255,255,255,0.1)' }}
            />
          ) : currentAbbot ? (
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: 'rgba(234,215,161,0.1)',
                border: '1px solid rgba(234,215,161,0.22)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
              }}
            >
              <Image
                src={currentAbbot.imageUrl}
                alt={`รูป${currentAbbot.fullName} เจ้าอาวาส${templeName}`}
                ratio="3/4"
                sx={{
                  width: 1,
                  borderRadius: 1,
                  bgcolor: '#052518',
                  '& img': { objectFit: 'cover', objectPosition: 'center top' },
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                minHeight: { xs: 300, md: 460 },
                display: 'grid',
                placeItems: 'center',
                borderRadius: 1.5,
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(234,215,161,0.22)',
              }}
            >
              <Typography sx={{ color: theme.palette.secondary.main }}>
                ข้อมูลเจ้าอาวาสอยู่ระหว่างปรับปรุง
              </Typography>
            </Box>
          )}

          <Box>
            <Typography variant="overline" sx={{ color: theme.palette.common.white }}>
              เจ้าอาวาส{templeName}องค์ปัจจุบัน
            </Typography>
            <Typography
              component="h2"
              sx={{
                color: theme.palette.common.white,
                maxWidth: 520,
                fontSize: { xs: 42, sm: 58, md: 68 },
                fontWeight: 600,
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              {currentAbbot?.fullName || 'ข้อมูลอยู่ระหว่างปรับปรุง'}
            </Typography>

            {currentAbbot?.displayTitle ? (
              <Typography variant="h5" sx={{ mt: 1.5, color: theme.palette.common.white }}>
                {currentAbbot.displayTitle}
              </Typography>
            ) : null}

            {currentAbbot?.biography ? (
              <Box
                dangerouslySetInnerHTML={{ __html: currentAbbot.biography }}
                sx={{
                  mt: 4,
                  maxWidth: 560,
                  color: theme.palette.common.white,
                  lineHeight: 1.85,
                  '& p': { mt: 0, mb: 1.5 },
                  '& ul, & ol': { pl: 3 },
                }}
              />
            ) : null}

            {currentAbbot?.administrativePositions ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.common.white }}>
                  ตำแหน่งและหน้าที่
                </Typography>
                <Box
                  dangerouslySetInnerHTML={{ __html: currentAbbot.administrativePositions }}
                  sx={{ mt: 1, color: theme.palette.common.white, lineHeight: 1.8 }}
                />
              </Box>
            ) : null}

            {currentAbbot?.monasticRank ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ color: theme.palette.common.white }}>
                  สมณศักดิ์
                </Typography>
                <Box
                  dangerouslySetInnerHTML={{ __html: currentAbbot.monasticRank }}
                  sx={{ mt: 1, color: theme.palette.common.white, lineHeight: 1.8 }}
                />
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          px: { xs: 2.5, md: 8, lg: 13 },
          py: { xs: 8, md: 12 },
          minHeight: 720,
          backgroundImage: `
            radial-gradient(circle at 85% 20%, rgba(246,237,219,0.12), transparent 30%),
            linear-gradient(135deg, ${theme.palette.secondary.main} 0%, #A67C06 44%, ${theme.palette.primary.main} 100%)
          `,
        }}
      >
        <Box
          sx={{
            mx: 'auto',
            gap: { xs: 6, md: 5 },
            maxWidth: 1280,
            display: 'grid',
            alignItems: 'center',
            gridTemplateColumns: { xs: '1fr', md: '0.88fr 1.12fr' },
          }}
        >
          <Box>
            <Typography
              component="h2"
              sx={{
                color: theme.palette.secondary.main,
                maxWidth: 520,
                fontSize: { xs: 42, sm: 58, md: 68 },
                fontWeight: 800,
                lineHeight: 1.2,
                textTransform: 'uppercase',
              }}
            >
              สถาปัตย์และสิ่งสำคัญ
            </Typography>

            <Typography
              sx={{
                mt: 4,
                maxWidth: 430,
                color: theme.palette.secondary.main,
                fontSize: 13,
                lineHeight: 1.75,
              }}
            >
              เรียนรู้เรื่องราว ความเป็นมา และคุณค่าของสถาปัตยกรรม
              รวมถึงสิ่งสำคัญภายในวัดที่สะท้อนศรัทธา ศิลปวัฒนธรรม และภูมิปัญญาของชุมชน
            </Typography>

            <Button
              component="a"
              href={paths.banlao.architecture.root}
              variant="outlined"
              endIcon={<Iconify icon="solar:arrow-right-linear" />}
              sx={{
                mt: 4,
                color: theme.palette.secondary.main,
                borderColor: 'rgba(234,215,161,0.5)',
                '&:hover': { borderColor: theme.palette.secondary.main },
              }}
            >
              ดูทั้งหมด
            </Button>
          </Box>

          <Box
            sx={{
              gap: 2,
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            }}
          >
            {isArchitectureLoading
              ? Array.from({ length: 4 }, (_, index) => (
                  <Skeleton
                    key={index}
                    variant="rounded"
                    animation="wave"
                    sx={{ height: 250, bgcolor: 'rgba(255,255,255,0.1)' }}
                  />
                ))
              : featuredArchitectures.map((item) => (
                  <Box
                    key={item.id}
                    component="a"
                    href={paths.banlao.architecture.details(item.id)}
                    sx={{
                      p: 1,
                      display: 'block',
                      overflow: 'hidden',
                      borderRadius: 1.5,
                      color: 'inherit',
                      textDecoration: 'none',
                      bgcolor: 'rgba(234,215,161,0.1)',
                      border: '1px solid rgba(234,215,161,0.22)',
                      boxShadow: '0 24px 60px rgba(0,0,0,0.22)',
                      transition: 'transform 180ms ease, border-color 180ms ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        borderColor: theme.palette.secondary.main,
                      },
                    }}
                  >
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      ratio="4/3"
                      sx={{
                        width: 1,
                        borderRadius: 1,
                        bgcolor: '#052518',
                        '& img': { objectFit: 'cover' },
                      }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{
                        mt: 1.5,
                        px: 0.5,
                        color: theme.palette.secondary.main,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.title}
                    </Typography>
                    {item.year ? (
                      <Typography
                        variant="caption"
                        sx={{ px: 0.5, color: 'rgba(246,237,219,0.58)' }}
                      >
                        {item.year}
                      </Typography>
                    ) : null}
                  </Box>
                ))}

            {!isArchitectureLoading && !featuredArchitectures.length ? (
              <Box
                sx={{
                  gridColumn: '1 / -1',
                  minHeight: 260,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1.5,
                  border: '1px solid rgba(234,215,161,0.22)',
                  bgcolor: 'rgba(255,255,255,0.06)',
                }}
              >
                <Typography
                  sx={{
                    color: theme.palette.secondary.main,
                  }}
                >
                  ยังไม่มีข้อมูลสถาปัตย์และสิ่งสำคัญ
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Box>

      <HomeArticle />

      <Dialog
        fullWidth
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        slotProps={{
          paper: {
            sx: {
              overflow: 'hidden',
              bgcolor: theme.palette.primary.main,
              borderRadius: 1.5,
              border: '1px solid rgba(234,215,161,0.24)',
            },
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.25,
            gap: 1.5,
            display: 'flex',
            alignItems: 'center',
            color: theme.palette.secondary.main,
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{selectedImage?.title}</Typography>

          <IconButton onClick={() => setSelectedImage(null)} sx={{ color: 'inherit' }}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Box>

        <DialogContent sx={{ py: 3, bgcolor: theme.palette.primary.main, width: 'auto' }}>
          {selectedImage && (
            <Box
              component="img"
              alt={selectedImage.title}
              src={selectedImage.src}
              sx={{
                width: 1,
                height: 'auto',
                display: 'block',
                objectFit: 'contain',
                maxHeight: { xs: '78vh', md: '82vh' },
                bgcolor: theme.palette.primary.main,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* <Stack
        component="footer"
        direction="row"
        spacing={4}
        justifyContent="center"
        sx={{ pb: 7, color: theme.palette.secondary.main, bgcolor: theme.palette.primary.main }}
      >
        {_socials.map((social) => (
          <IconButton key={social.label}>
            {social.value === 'twitter' && <Iconify icon="socials:twitter" />}
            {social.value === 'facebook' && <Iconify icon="socials:facebook" />}
            {social.value === 'instagram' && <Iconify icon="socials:instagram" />}
            {social.value === 'linkedin' && <Iconify icon="socials:linkedin" />}
          </IconButton>
        ))}
      </Stack> */}
    </Box>
  );
}
