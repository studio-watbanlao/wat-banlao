import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import {
  RiGovernmentLine,
  RiMapPinLine,
  RiShieldUserLine,
  RiTeamLine,
} from 'src/components/remix-icon';
import {
  COMMUNITY_VILLAGES,
  type CommunityLeader,
  type CommunityLeaderGroup,
} from 'src/types/community-leader';
import axios from 'src/utils/axios';

const GROUP_META: Record<
  CommunityLeaderGroup,
  { label: string; icon: React.ReactNode; color: 'primary' | 'info' | 'success' | 'warning' }
> = {
  'village-head': { label: 'ผู้ใหญ่บ้าน', icon: <RiShieldUserLine />, color: 'primary' },
  assistant: { label: 'ผู้ช่วยผู้ใหญ่บ้าน', icon: <RiTeamLine />, color: 'info' },
  council: { label: 'สมาชิกสภา อบต.', icon: <RiGovernmentLine />, color: 'success' },
  other: { label: 'ผู้นำชุมชน', icon: <RiTeamLine />, color: 'warning' },
};

export function CommunityLeadersView() {
  const { data: temple } = usePublicTemple();
  const [selectedVillage, setSelectedVillage] = useState(0);
  const [leaders, setLeaders] = useState<CommunityLeader[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const village = COMMUNITY_VILLAGES[selectedVillage];
  const villageLeaders = useMemo(
    () => leaders.filter((leader) => leader.villageKey === village.key),
    [leaders, village.key]
  );

  const loadLeaders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/public/community-leaders');
      setLeaders(response.data.leaders || []);
    } catch {
      setError('ไม่สามารถโหลดข้อมูลผู้นำชุมชนได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaders();
  }, [loadLeaders]);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={5}>
        <Stack spacing={1} sx={{ maxWidth: 760 }}>
          <Typography color="primary" variant="overline">
            ทำเนียบผู้นำชุมชน
          </Typography>
          <Typography component="h1" variant="h3">
            ผู้นำชุมชนของ{temple?.name || 'วัด'}
          </Typography>
          <Typography color="text.secondary">
            เลือกดูรายชื่อผู้นำ ตำแหน่ง และหน้าที่รับผิดชอบ แยกตามทั้ง 6 หมู่บ้าน
          </Typography>
        </Stack>

        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Tabs
            value={selectedVillage}
            onChange={(_, value: number) => setSelectedVillage(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label={`เลือกหมู่บ้านในชุมชนของ${temple?.name || 'วัด'}`}
            sx={{ px: 1, bgcolor: 'background.neutral' }}
          >
            {COMMUNITY_VILLAGES.map((item) => (
              <Tab key={item.key} label={item.name} />
            ))}
          </Tabs>
        </Box>

        <Box component="section" aria-labelledby="selected-village-title">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'flex-end' }}
            spacing={2}
            sx={{ mb: 3 }}
          >
            <Stack spacing={0.75}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <RiMapPinLine />
                <Typography id="selected-village-title" component="h2" variant="h4">
                  {village.name}
                </Typography>
              </Stack>
              <Typography color="text.secondary">
                ทำเนียบผู้นำและผู้แทนท้องถิ่นของ{village.name}
              </Typography>
            </Stack>
            <Chip color="primary" variant="soft" label={`${villageLeaders.length} รายชื่อ`} />
          </Stack>

          {error ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadLeaders}>
                  ลองใหม่
                </Button>
              }
            >
              {error}
            </Alert>
          ) : null}

          {loading ? (
            <Stack alignItems="center" sx={{ py: 8 }}>
              <CircularProgress />
            </Stack>
          ) : null}

          {!loading && !error && !villageLeaders.length ? (
            <Stack alignItems="center" spacing={1.5} sx={{ py: 8, color: 'text.secondary' }}>
              <Iconify icon="solar:users-group-rounded-linear" width={56} />
              <Typography variant="h6">ยังไม่มีข้อมูลผู้นำของหมู่บ้านนี้</Typography>
              <Typography variant="body2">ข้อมูลจะแสดงเมื่อผู้ดูแลเผยแพร่รายชื่อแล้ว</Typography>
            </Stack>
          ) : null}

          {!loading && !error && villageLeaders.length ? (
            <Grid container spacing={2.5}>
              {villageLeaders.map((leader) => {
                const meta = GROUP_META[leader.group];
                return (
                  <Grid key={leader.id} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card sx={{ height: 1 }}>
                      <Box sx={{ position: 'relative', bgcolor: 'background.neutral' }}>
                        <Image
                          src={leader.imageUrl}
                          alt={`รูป${leader.role} ${leader.fullName} ${village.name}`}
                          ratio="4/3"
                          sx={{ objectPosition: 'center top' }}
                        />
                        <Chip
                          size="small"
                          color={meta.color}
                          label={meta.label}
                          sx={{ position: 'absolute', left: 12, bottom: 12, zIndex: 2 }}
                        />
                      </Box>
                      <CardContent>
                        <Stack spacing={1.25}>
                          <Typography component="h3" variant="subtitle1">
                            {leader.fullName}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Box
                              sx={{
                                mt: 0.25,
                                color: `${meta.color}.main`,
                                '& svg': { width: 19, height: 19 },
                              }}
                            >
                              {meta.icon}
                            </Box>
                            <Box>
                              <Typography variant="body2" color={`${meta.color}.main`}>
                                {leader.role}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {leader.responsibility}
                              </Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : null}
        </Box>
      </Stack>
    </Container>
  );
}
