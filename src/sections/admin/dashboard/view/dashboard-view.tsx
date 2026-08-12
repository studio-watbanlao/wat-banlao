'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useCurrentTempleAccess } from 'src/hooks/use-current-temple-access';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import type { TempleModule } from 'src/types/temple';
import axios from 'src/utils/axios';
import { fDateTime } from 'src/utils/format-time';

type ContentStatus = 'DRAFT' | 'PUBLIC';

type DashboardItem = {
  id: string;
  title: string;
  imageUrl?: string;
  status: ContentStatus;
  view?: number;
  createdAt?: string;
  createdDate?: string;
};

type ContentSource = {
  key: 'activity' | 'blog' | 'dharma' | 'festival';
  module: TempleModule;
  responseKey: 'activities' | 'blogs' | 'dharmas' | 'festivals';
  title: string;
  endpoint: string;
  path: string;
  createPath: string;
  icon: string;
  color: string;
  softColor: string;
};

type SourceResult = ContentSource & {
  items: DashboardItem[];
  failed: boolean;
};

const CONTENT_SOURCES: ContentSource[] = [
  {
    key: 'activity',
    module: 'activities',
    responseKey: 'activities',
    title: 'กิจกรรม',
    endpoint: '/api/admin/activities',
    path: paths.dashboard.activity,
    createPath: paths.dashboard.activityNew,
    icon: 'solar:calendar-bold-duotone',
    color: '#1677FF',
    softColor: '#E8F2FF',
  },
  {
    key: 'blog',
    module: 'blogs',
    responseKey: 'blogs',
    title: 'บทความ',
    endpoint: '/api/admin/blogs',
    path: paths.dashboard.blogs,
    createPath: paths.dashboard.blogNew,
    icon: 'solar:document-text-bold-duotone',
    color: '#8E33FF',
    softColor: '#F3E8FF',
  },
  {
    key: 'dharma',
    module: 'dharmas',
    responseKey: 'dharmas',
    title: 'ธรรมะ',
    endpoint: '/api/admin/dharmas',
    path: paths.dashboard.dharmas,
    createPath: paths.dashboard.dharmaNew,
    icon: 'solar:notebook-bold-duotone',
    color: '#00A76F',
    softColor: '#DDF6EC',
  },
  {
    key: 'festival',
    module: 'festivals',
    responseKey: 'festivals',
    title: 'งานประเพณี',
    endpoint: '/api/admin/festivals',
    path: paths.dashboard.festivals,
    createPath: paths.dashboard.festivalNew,
    icon: 'solar:confetti-minimalistic-bold-duotone',
    color: '#F79009',
    softColor: '#FFF1D6',
  },
];

const number = (value: number) => new Intl.NumberFormat('th-TH').format(value);

const loadDashboard = async (sources: ContentSource[]): Promise<SourceResult[]> =>
  Promise.all(
    sources.map(async (source) => {
      try {
        const response = await axios.get(source.endpoint);
        return {
          ...source,
          items: (response.data[source.responseKey] || []) as DashboardItem[],
          failed: false,
        };
      } catch {
        return { ...source, items: [], failed: true };
      }
    })
  );

export default function DashboardView() {
  const access = useCurrentTempleAccess();
  const temple = access?.temple;
  const primaryDomain = temple?.domains.find(
    (domain) => domain.isPrimary && domain.verificationStatus === 'VERIFIED'
  )?.domain;
  const publicWebsiteUrl =
    temple && access?.role === 'super_admin'
      ? `${paths.dashboard.templates}/preview?${new URLSearchParams({
          templeId: temple.id,
        }).toString()}`
      : primaryDomain
        ? /^https?:\/\//i.test(primaryDomain)
          ? primaryDomain
          : `https://${primaryDomain}`
      : '';
  const isWebsitePreview = access?.role === 'super_admin' || !primaryDomain;

  const enabledSources = useMemo(
    () =>
      CONTENT_SOURCES.filter(
        (source) =>
          temple?.modules[source.module] !== false &&
          (access?.role === 'super_admin' || access?.permissions[source.module]?.includes('read'))
      ),
    [access?.permissions, access?.role, temple]
  );

  const creatableSources = useMemo(
    () =>
      enabledSources.filter(
        (source) =>
          access?.role === 'super_admin' || access?.permissions[source.module]?.includes('create')
      ),
    [access?.permissions, access?.role, enabledSources]
  );

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['dashboard-overview', temple?.id, enabledSources.map((source) => source.key).join(',')],
    queryFn: () => loadDashboard(enabledSources),
    enabled: Boolean(temple?.id),
    staleTime: 60 * 1000,
    retry: false,
  });

  const totalItems = results.reduce((sum, source) => sum + source.items.length, 0);
  const totalViews = results.reduce(
    (sum, source) => sum + source.items.reduce((itemSum, item) => itemSum + (item.view || 0), 0),
    0
  );
  const totalPublished = results.reduce(
    (sum, source) => sum + source.items.filter((item) => item.status === 'PUBLIC').length,
    0
  );
  const failedCount = results.filter((source) => source.failed).length;

  const recentItems = useMemo(
    () =>
      results
        .flatMap((source) =>
          source.items.map((item) => ({
            ...item,
            sourceTitle: source.title,
            sourcePath: source.path,
            sourceColor: source.color,
          }))
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.createdDate || 0).getTime() -
            new Date(a.createdAt || a.createdDate || 0).getTime()
        )
        .slice(0, 6),
    [results]
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography variant="h4">ภาพรวม</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {access?.role === 'temple_contributor'
                ? `สรุปผลงานของคุณใน ${temple?.name || 'วัดที่กำลังเลือก'}`
                : `สรุปข้อมูลและผลการเข้าชมของ ${temple?.name || 'วัดของคุณ'}`}
            </Typography>
          </Box>
          <Button
            component="a"
            href={publicWebsiteUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            disabled={!publicWebsiteUrl}
            variant="outlined"
            startIcon={<Iconify icon="solar:eye-bold" />}
          >
            {isWebsitePreview ? 'ดูตัวอย่างหน้าเว็บ' : 'ดูหน้าเว็บ'}
          </Button>
        </Stack>

        {failedCount > 0 ? (
          <Alert severity="warning">
            มี {failedCount} หมวดที่ยังโหลดข้อมูลไม่สำเร็จ กรุณาลองรีเฟรชหน้าอีกครั้ง
          </Alert>
        ) : null}

        <Card
          sx={(theme) => ({
            overflow: 'hidden',
            color: 'common.white',
            background: `linear-gradient(125deg, ${theme.vars.palette.primary.dark}, ${theme.vars.palette.primary.main} 65%, ${theme.vars.palette.secondary.main})`,
          })}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 }, '&:last-child': { pb: { xs: 3, md: 4 } } }}>
            <Grid container spacing={3} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h4">ยินดีต้อนรับกลับ</Typography>
                <Typography sx={{ mt: 1, opacity: 0.8, maxWidth: 540 }}>
                  {access?.role === 'temple_contributor'
                    ? 'ดูแลและติดตามแบบร่างที่คุณสร้างได้จากหน้าเดียว'
                    : 'ติดตามเนื้อหาที่เผยแพร่และยอดเข้าชมของเว็บได้จากหน้าเดียว'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Grid container spacing={1.5}>
                  {[
                    { label: 'ยอดเข้าชมรวม', value: totalViews },
                    { label: 'เนื้อหาทั้งหมด', value: totalItems },
                    { label: 'เผยแพร่แล้ว', value: totalPublished },
                  ].map((summary) => (
                    <Grid key={summary.label} size={{ xs: 4 }}>
                      <Box
                        sx={{
                          p: 2,
                          height: 1,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.12)',
                          border: '1px solid rgba(255,255,255,0.16)',
                        }}
                      >
                        <Typography variant="h4">{isLoading ? '—' : number(summary.value)}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.76 }}>
                          {summary.label}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Grid container spacing={2.5}>
          {enabledSources.map((source) => {
            const result = results.find((item) => item.key === source.key);
            const items = result?.items || [];
            const views = items.reduce((sum, item) => sum + (item.view || 0), 0);
            const published = items.filter((item) => item.status === 'PUBLIC').length;

            return (
              <Grid key={source.key} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Card sx={{ height: 1 }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          display: 'grid',
                          placeItems: 'center',
                          borderRadius: 2,
                          color: source.color,
                          bgcolor: source.softColor,
                        }}
                      >
                        <Iconify icon={source.icon} width={28} />
                      </Box>
                      <Tooltip title={`ไปหน้าจัดการ${source.title}`}>
                        <IconButton component={RouterLink} href={source.path} size="small">
                          <Iconify icon="eva:arrow-ios-forward-fill" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography variant="h4" sx={{ mt: 2.5 }}>
                      {isLoading ? '—' : number(items.length)}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 0.25 }}>
                      {source.title}
                    </Typography>
                    <Stack
                      direction="row"
                      divider={<Divider orientation="vertical" flexItem />}
                      spacing={1.5}
                      sx={{ mt: 2, color: 'text.secondary' }}
                    >
                      <Typography variant="caption">เผยแพร่ {number(published)}</Typography>
                      <Typography variant="caption">เข้าชม {number(views)}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 3 }}>
                <Box>
                  <Typography variant="h6">เนื้อหาล่าสุด</Typography>
                  <Typography variant="body2" color="text.secondary">
                    รายการที่สร้างหรือแก้ไขล่าสุด
                  </Typography>
                </Box>
              </Stack>
              <TableContainer>
                <Scrollbar>
                  <Table sx={{ minWidth: 680 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>เนื้อหา</TableCell>
                        <TableCell>หมวด</TableCell>
                        <TableCell>สถานะ</TableCell>
                        <TableCell align="right">ยอดเข้าชม</TableCell>
                        <TableCell>วันที่</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                            <CircularProgress size={30} />
                          </TableCell>
                        </TableRow>
                      ) : recentItems.length ? (
                        recentItems.map((item) => (
                          <TableRow hover key={`${item.sourcePath}-${item.id}`}>
                            <TableCell>
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar variant="rounded" src={item.imageUrl} alt={item.title}>
                                  {item.title.charAt(0)}
                                </Avatar>
                                <Typography variant="subtitle2" noWrap sx={{ maxWidth: 230 }}>
                                  {item.title}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={item.sourceTitle}
                                sx={{ color: item.sourceColor, bgcolor: `${item.sourceColor}14` }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                variant="soft"
                                color={item.status === 'PUBLIC' ? 'success' : 'default'}
                                label={item.status === 'PUBLIC' ? 'เผยแพร่' : 'แบบร่าง'}
                              />
                            </TableCell>
                            <TableCell align="right">{number(item.view || 0)}</TableCell>
                            <TableCell>
                              {item.createdAt || item.createdDate
                                ? fDateTime(item.createdAt || item.createdDate, 'dd/MM/yyyy')
                                : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                            ยังไม่มีเนื้อหา
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ height: 1 }}>
              <CardContent>
                <Typography variant="h6">เมนูลัด</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
                  สร้างเนื้อหาใหม่ได้ทันที
                </Typography>
                <Stack spacing={1.25}>
                  {creatableSources.map((source) => (
                    <Button
                      key={source.key}
                      component={RouterLink}
                      href={source.createPath}
                      variant="outlined"
                      color="inherit"
                      fullWidth
                      startIcon={<Iconify icon={source.icon} sx={{ color: source.color }} />}
                      endIcon={<Iconify icon="mingcute:add-line" />}
                      sx={{ justifyContent: 'flex-start', py: 1.25 }}
                    >
                      เพิ่ม{source.title}
                    </Button>
                  ))}
                  {!creatableSources.length ? (
                    <Alert severity="info">ยังไม่มีสิทธิ์สร้างเนื้อหา</Alert>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
