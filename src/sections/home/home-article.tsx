'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import type { ContainerProps } from '@mui/material/Container';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import { useGetActivity } from 'src/queries/activity';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import type { ActivityContentType, ActivityItem } from 'src/types/activity';
import { fDate } from 'src/utils/format-time';

const MAX_ITEMS = 6;
const FALLBACK_IMAGE = '/assets/background/overlay_4.jpg';

const CONTENT_TYPE_LABEL: Record<ActivityContentType, string> = {
  activity: 'กิจกรรม',
  news: 'ข่าวสาร',
};

type Props = {
  maxWidth?: ContainerProps['maxWidth'];
};

function ActivityNewsCard({ item }: { item: ActivityItem }) {
  const href = paths.activity.details(item.id);
  const category = CONTENT_TYPE_LABEL[item.contentType || 'activity'];

  return (
    <Card
      variant="outlined"
      sx={{
        height: 1,
        overflow: 'hidden',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 18px 38px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <CardActionArea
        component={RouterLink}
        href={href}
        aria-label={`อ่าน ${item.title}`}
        sx={{ height: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <Image
            src={item.imageUrl || FALLBACK_IMAGE}
            alt={item.title}
            ratio="6/4"
            sx={{
              bgcolor: 'grey.100',
              transition: 'transform 300ms ease',
              '.MuiCardActionArea-root:hover &': { transform: 'scale(1.035)' },
            }}
          />
          <Chip
            size="small"
            color="success"
            label={category}
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              height: 24,
              fontWeight: 700,
              bgcolor: 'success.main',
              color: 'success.contrastText',
            }}
          />
        </Box>

        <Stack spacing={1} sx={{ flex: 1, p: 2 }}>
          <Typography component="h3" variant="subtitle1" sx={{ color: 'text.primary' }}>
            {item.title}
          </Typography>
          {item.description ? (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                overflow: 'hidden',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
              }}
            >
              {item.description}
            </Typography>
          ) : null}
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 'auto', pt: 1 }}>
            <Iconify icon="solar:calendar-linear" width={16} sx={{ color: 'text.disabled' }} />
            <Typography variant="caption" color="text.secondary">
              {fDate(item.createdDate || item.createdAt)}
            </Typography>
          </Stack>
        </Stack>
      </CardActionArea>
    </Card>
  );
}

export default function HomeArticle({ maxWidth = 'xl' }: Props) {
  const { data = [], isLoading } = useGetActivity();
  const { data: temple } = usePublicTemple();
  const displayItems = data.slice(0, MAX_ITEMS);
  const templeName = temple?.name || 'วัด';

  return (
    <Box
      component="section"
      aria-labelledby="home-activity-news-title"
      sx={{ bgcolor: '#f7f7f5', color: 'text.primary', py: { xs: 7, md: 11 } }}
    >
      <Container maxWidth={maxWidth}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'flex-end' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography color="primary.main" variant="overline" sx={{ letterSpacing: 1.4 }}>
              เรื่องราวล่าสุดจากวัดและชุมชน
            </Typography>
            <Typography id="home-activity-news-title" component="h2" variant="h3" sx={{ mt: 0.5 }}>
              กิจกรรม และข่าวสาร
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640 }}>
              ติดตามกิจกรรม งานบุญ ข่าวประชาสัมพันธ์ และเรื่องราวที่เกิดขึ้นภายในวัด โรงเรียน
              และชุมชนของ{templeName}
            </Typography>
          </Box>

          {data.length ? (
            <Button
              component={RouterLink}
              href={paths.activity.root}
              color="inherit"
              endIcon={<Iconify icon="solar:arrow-right-linear" />}
              sx={{ flexShrink: 0 }}
            >
              ดูทั้งหมด
            </Button>
          ) : null}
        </Stack>

        {displayItems.length ? (
          <Grid container spacing={2.5}>
            {displayItems.map((item) => (
              <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <ActivityNewsCard item={item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1}
            sx={{ minHeight: 180, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
          >
            <Iconify
              icon={isLoading ? 'solar:refresh-circle-linear' : 'solar:calendar-linear'}
              width={36}
              sx={{ color: 'text.disabled' }}
            />
            <Typography color="text.secondary">
              {isLoading ? 'กำลังโหลดกิจกรรมและข่าวสาร' : 'ยังไม่มีกิจกรรมและข่าวสารที่เผยแพร่'}
            </Typography>
          </Stack>
        )}
      </Container>
    </Box>
  );
}
