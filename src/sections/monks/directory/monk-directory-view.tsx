import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { usePublicTempleDirectory } from '../use-public-temple-directory';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import { usePublicTemple } from 'src/hooks/use-public-temple';
import type { TempleDirectoryEntry } from 'src/types/temple-directory';

export function MonkDirectoryView() {
  const [search, setSearch] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<TempleDirectoryEntry | null>(null);
  const { data: temple } = usePublicTemple();
  const { data: entries = [], isLoading, error, refetch } = usePublicTempleDirectory();
  const monkEntries = entries.filter((entry) => entry.entryType !== 'FORMER_ABBOT');
  const keyword = search.trim().toLocaleLowerCase('th');
  const filteredEntries = keyword
    ? monkEntries.filter((entry) =>
        [
          entry.fullName,
          entry.displayTitle,
          entry.templeName,
          entry.affiliation,
          entry.monasticRank,
        ]
          .join(' ')
          .toLocaleLowerCase('th')
          .includes(keyword)
      )
    : monkEntries;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 6 } }}>
      <Stack spacing={4}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ md: 'flex-end' }}
          spacing={2.5}
        >
          <Box>
            <Typography color="primary" variant="overline">
              รายนามพระสงฆ์
            </Typography>
            <Typography component="h1" variant="h3">
              ทำเนียบพระสงฆ์{temple?.name || 'วัด'}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              แสดงเฉพาะรายชื่อที่ผู้ดูแลวัดตรวจสอบและเผยแพร่แล้ว
            </Typography>
          </Box>
          <Chip color="primary" variant="soft" label={`${filteredEntries.length} รายชื่อ`} />
        </Stack>

        <TextField
          fullWidth
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ค้นหาชื่อ สมณศักดิ์ วัด หรือสังกัด"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ maxWidth: 560 }}
        />

        {isLoading ? (
          <Stack alignItems="center" sx={{ py: 10 }}>
            <CircularProgress />
          </Stack>
        ) : null}

        {error ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                ลองใหม่
              </Button>
            }
          >
            ไม่สามารถโหลดทำเนียบพระสงฆ์ได้
          </Alert>
        ) : null}

        {!isLoading && !error && filteredEntries.length ? (
          <Grid container spacing={3}>
            {filteredEntries.map((entry) => (
              <Grid key={entry.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card sx={{ height: 1, overflow: 'hidden' }}>
                  <CardActionArea
                    onClick={() => setSelectedEntry(entry)}
                    aria-label={`ดูข้อมูล${entry.fullName}`}
                    sx={{ height: 1, alignItems: 'stretch' }}
                  >
                    <Box sx={{ position: 'relative', bgcolor: 'background.neutral' }}>
                      <Image
                        src={entry.imageUrl}
                        alt={`รูป${entry.fullName}`}
                        ratio="3/4"
                        sx={{ '& img': { objectPosition: 'center top' } }}
                      />
                      {entry.entryType === 'CURRENT_ABBOT' ? (
                        <Chip
                          color="primary"
                          size="small"
                          label="เจ้าอาวาส"
                          sx={{ position: 'absolute', left: 16, bottom: 16, zIndex: 2 }}
                        />
                      ) : null}
                    </Box>
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Box>
                          <Typography component="h2" variant="h6">
                            {entry.fullName}
                          </Typography>
                          {entry.displayTitle ? (
                            <Typography variant="body2" color="primary.main">
                              {entry.displayTitle}
                            </Typography>
                          ) : null}
                        </Box>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                          {entry.vassa ? (
                            <Chip size="small" variant="outlined" label={`${entry.vassa} พรรษา`} />
                          ) : null}
                          {entry.age ? (
                            <Chip size="small" variant="outlined" label={`อายุ ${entry.age}`} />
                          ) : null}
                        </Stack>
                        {entry.affiliation ? (
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            <Iconify
                              icon="solar:users-group-rounded-linear"
                              width={18}
                              sx={{ mt: 0.25, color: 'text.disabled' }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              {entry.affiliation}
                            </Typography>
                          </Stack>
                        ) : null}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : null}

        {!isLoading && !error && !filteredEntries.length ? (
          <Stack alignItems="center" spacing={1.5} sx={{ py: 9, textAlign: 'center' }}>
            <Iconify
              icon="solar:users-group-rounded-linear"
              width={64}
              sx={{ color: 'text.disabled' }}
            />
            <Typography variant="h5">
              {search ? 'ไม่พบรายชื่อที่ค้นหา' : 'ยังไม่มีข้อมูลทำเนียบพระสงฆ์'}
            </Typography>
            <Typography color="text.secondary">
              {search
                ? 'ลองค้นหาด้วยชื่อหรือคำสำคัญอื่น'
                : 'ข้อมูลจะแสดงเมื่อผู้ดูแลเพิ่มรายชื่อและตั้งสถานะเป็นเผยแพร่'}
            </Typography>
          </Stack>
        ) : null}
      </Stack>

      <Dialog
        open={Boolean(selectedEntry)}
        onClose={() => setSelectedEntry(null)}
        fullWidth
        maxWidth="md"
        aria-labelledby="monk-detail-dialog-title"
        slotProps={{ paper: { sx: { borderRadius: { xs: 0, sm: 3 } } } }}
      >
        {selectedEntry ? (
          <>
            <DialogTitle id="monk-detail-dialog-title" sx={{ pr: 7 }}>
              ข้อมูลพระสงฆ์
              <IconButton
                aria-label="ปิดหน้าต่างข้อมูลพระสงฆ์"
                onClick={() => setSelectedEntry(null)}
                sx={{ position: 'absolute', top: 12, right: 12 }}
              >
                <Iconify icon="mingcute:close-line" />
              </IconButton>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Grid container spacing={{ xs: 3, md: 4 }}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <Image
                    src={selectedEntry.imageUrl}
                    alt={`รูป${selectedEntry.fullName}`}
                    ratio="3/4"
                    sx={{
                      borderRadius: 2,
                      bgcolor: 'background.neutral',
                      '& img': { objectPosition: 'center top' },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 7 }}>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography component="h2" variant="h4">
                        {selectedEntry.fullName}
                      </Typography>
                      {selectedEntry.displayTitle ? (
                        <Typography color="primary.main" sx={{ mt: 0.5 }}>
                          {selectedEntry.displayTitle}
                        </Typography>
                      ) : null}
                    </Box>

                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {selectedEntry.entryType === 'CURRENT_ABBOT' ? (
                        <Chip color="primary" variant="soft" label="เจ้าอาวาส" />
                      ) : null}
                      {selectedEntry.age ? <Chip label={`อายุ ${selectedEntry.age}`} /> : null}
                      {selectedEntry.vassa ? <Chip label={`${selectedEntry.vassa} พรรษา`} /> : null}
                    </Stack>

                    {[
                      ['ชื่อวัด', selectedEntry.templeName],
                      ['จังหวัด', selectedEntry.province],
                      ['วันเกิด', selectedEntry.birth],
                      ['อุปสมบท', selectedEntry.ordination],
                      ['สังกัด', selectedEntry.affiliation],
                      ['สมณศักดิ์', selectedEntry.monasticRank],
                      ['ตำแหน่งทางการปกครอง', selectedEntry.administrativePositions],
                      ['การศึกษา', selectedEntry.education],
                      ['เกียรติคุณและรางวัล', selectedEntry.honoraryAwards],
                      ['ประวัติ', selectedEntry.biography],
                      ['แหล่งอ้างอิง', selectedEntry.sources],
                    ].map(([label, value]) =>
                      value ? (
                        <Box key={label}>
                          <Typography variant="subtitle2">{label}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5, whiteSpace: 'pre-line' }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      ) : null
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </Container>
  );
}
