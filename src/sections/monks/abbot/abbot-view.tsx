import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { usePublicTempleDirectory } from '../use-public-temple-directory';

import { AbbotSuccessionList } from './abbot-succession-list';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { usePublicTemple } from 'src/hooks/use-public-temple';

const formatThaiDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

type InfoItemProps = {
  icon: string;
  label: string;
  value: string;
};

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          width: 38,
          height: 38,
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 1.5,
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }}
      >
        <Iconify icon={icon} width={20} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body2">{value}</Typography>
      </Box>
    </Stack>
  );
}

type RichSectionProps = {
  title: string;
  content: string;
};

function RichSection({ title, content }: RichSectionProps) {
  if (!content) return null;
  return (
    <Box component="section">
      <Typography component="h2" variant="h5" sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box
        dangerouslySetInnerHTML={{ __html: content }}
        sx={{
          color: 'text.secondary',
          lineHeight: 1.85,
          '& p': { mt: 0, mb: 1.5 },
          '& ul, & ol': { pl: 3, mb: 1.5 },
          '& a': { color: 'primary.main' },
        }}
      />
    </Box>
  );
}

export function AbbotView() {
  const { data: temple } = usePublicTemple();
  const { data: entries = [], isLoading, error, refetch } = usePublicTempleDirectory();
  const abbot = entries.find((entry) => entry.entryType === 'CURRENT_ABBOT');
  const abbotEntries = entries.filter(
    (entry) => entry.entryType === 'CURRENT_ABBOT' || entry.entryType === 'FORMER_ABBOT'
  );

  return (
    <Container maxWidth={false} sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={{ xs: 6, md: 8 }}>
        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 10 }}>
            <CircularProgress />
          </Stack>
        ) : null}

        {error ? (
          <Alert
            severity="error"
            action={<Chip label="ลองใหม่" variant="outlined" onClick={() => refetch()} />}
          >
            ไม่สามารถโหลดข้อมูลเจ้าอาวาสได้
          </Alert>
        ) : null}

        {!isLoading && !error && !abbot ? (
          <Alert severity="info">
            ยังไม่ได้กำหนดเจ้าอาวาสปัจจุบัน กรุณาเพิ่มข้อมูลในหน้าจัดการทำเนียบวัด
          </Alert>
        ) : null}

        {!isLoading && !error && abbot ? (
          <Stack spacing={5}>
            <Grid container spacing={{ xs: 3, md: 5 }} alignItems="flex-start">
              <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ overflow: 'hidden' }}>
                  <Image
                    src={abbot.imageUrl}
                    alt={`รูป${abbot.fullName} เจ้าอาวาส${temple?.name || ''}`}
                    ratio="3/4"
                    sx={{
                      bgcolor: 'background.neutral',
                      '& img': { objectPosition: 'center top' },
                    }}
                  />
                  <CardContent>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      <Chip color="primary" variant="soft" label="เจ้าอาวาสองค์ปัจจุบัน" />
                      {abbot.vassa ? (
                        <Chip variant="outlined" label={`${abbot.vassa} พรรษา`} />
                      ) : null}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={3}>
                  <Box>
                    <Typography color="primary" variant="overline">
                      เจ้าอาวาส{abbot.templeName || temple?.name || 'วัด'}
                    </Typography>
                    <Typography component="h1" variant="h3" sx={{ mt: 0.75 }}>
                      {abbot.fullName}
                    </Typography>
                    {abbot.displayTitle ? (
                      <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
                        {abbot.displayTitle}
                      </Typography>
                    ) : null}
                  </Box>

                  <Divider />

                  <Grid container spacing={2.5}>
                    {abbot.birth ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                          icon="solar:calendar-linear"
                          label="วันเกิด"
                          value={formatThaiDate(abbot.birth)}
                        />
                      </Grid>
                    ) : null}
                    {abbot.age ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem icon="solar:user-linear" label="อายุ" value={abbot.age} />
                      </Grid>
                    ) : null}
                    {abbot.ordination ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                          icon="solar:medal-ribbon-linear"
                          label="อุปสมบท"
                          value={abbot.ordination}
                        />
                      </Grid>
                    ) : null}
                    {abbot.templeName ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                          icon="solar:buildings-2-linear"
                          label="วัด"
                          value={abbot.templeName}
                        />
                      </Grid>
                    ) : null}
                    {abbot.province ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                          icon="solar:map-point-linear"
                          label="จังหวัด"
                          value={abbot.province}
                        />
                      </Grid>
                    ) : null}
                    {abbot.termStart || abbot.termEnd ? (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoItem
                          icon="solar:hourglass-line-linear"
                          label="วาระดำรงตำแหน่ง"
                          value={[abbot.termStart, abbot.termEnd || 'ปัจจุบัน']
                            .filter(Boolean)
                            .join(' – ')}
                        />
                      </Grid>
                    ) : null}
                    {abbot.affiliation ? (
                      <Grid size={{ xs: 12 }}>
                        <InfoItem
                          icon="solar:users-group-rounded-linear"
                          label="สังกัด"
                          value={abbot.affiliation}
                        />
                      </Grid>
                    ) : null}
                  </Grid>

                  <RichSection title="ตำแหน่งและหน้าที่" content={abbot.administrativePositions} />
                  <RichSection title="สมณศักดิ์" content={abbot.monasticRank} />
                </Stack>
              </Grid>
            </Grid>

            <Divider />

            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={4}>
                  <RichSection title="การศึกษา" content={abbot.education} />
                  <RichSection title="เกียรติคุณ" content={abbot.honoraryAwards} />
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={4}>
                  <RichSection title="ประวัติ" content={abbot.biography} />
                  <RichSection title="ที่มาและแหล่งอ้างอิง" content={abbot.sources} />
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        ) : null}
        {!isLoading && !error ? (
          <AbbotSuccessionList entries={abbotEntries} templeName={temple?.name || 'วัด'} />
        ) : null}
      </Stack>
    </Container>
  );
}
