import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import type { TempleDirectoryEntry } from 'src/types/temple-directory';

type Props = { entries: TempleDirectoryEntry[] };

export function AbbotSuccessionList({ entries }: Props) {
  return (
    <Box component="section" aria-labelledby="abbot-succession-title">
      <Stack spacing={1} sx={{ mb: 2.5 }}>
        <Typography id="abbot-succession-title" component="h2" variant="h4">
          เจ้าอาวาสวัดบ้านเหล่าอดีต–ปัจจุบัน
        </Typography>
        <Typography color="text.secondary">
          ลำดับรายนามเจ้าอาวาสผู้บริหารและปกครองคณะสงฆ์วัดบ้านเหล่า
        </Typography>
      </Stack>

      <Card variant="outlined" sx={{ overflow: 'hidden' }}>
        {entries.length ? (
          <Stack divider={<Divider flexItem />}>
            {entries.map((abbot, index) => {
              const current = abbot.entryType === 'CURRENT_ABBOT';
              const term = [abbot.termStart, abbot.termEnd || (current ? 'ปัจจุบัน' : '')]
                .filter(Boolean)
                .join(' – ');
              return (
                <Stack
                  key={abbot.id}
                  direction="row"
                  alignItems="center"
                  spacing={2}
                  sx={{ px: { xs: 2, sm: 3 }, py: 2 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '50%',
                      typography: 'subtitle2',
                      color: current ? 'primary.contrastText' : 'primary.main',
                      bgcolor: current ? 'primary.main' : 'primary.lighter',
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle1">{abbot.fullName}</Typography>
                    {abbot.displayTitle || term ? (
                      <Typography variant="body2" color="text.secondary">
                        {[abbot.displayTitle, term].filter(Boolean).join(' · ')}
                      </Typography>
                    ) : null}
                  </Box>
                  {current ? (
                    <Chip size="small" color="primary" variant="soft" label="องค์ปัจจุบัน" />
                  ) : null}
                </Stack>
              );
            })}
          </Stack>
        ) : (
          <Typography color="text.secondary" sx={{ px: 3, py: 3 }}>
            ยังไม่มีรายนามเจ้าอาวาสที่เผยแพร่
          </Typography>
        )}
      </Card>
    </Box>
  );
}
