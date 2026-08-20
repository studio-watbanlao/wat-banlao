import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RiCommunityLine, RiGroupLine, RiMapPinLine } from 'src/components/remix-icon';

const HISTORY_STAGES = [
  {
    title: 'รากฐานของชุมชน',
    description:
      'บ้านเหล่าเป็นชุมชนในตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม มีวิถีชีวิตที่ผูกพันกับพระพุทธศาสนา เกษตรกรรม และวัฒนธรรมท้องถิ่น',
  },
  {
    title: 'การขยายตัวของหมู่บ้าน',
    description:
      'เมื่อจำนวนครัวเรือนเพิ่มขึ้น พื้นที่ชุมชนได้ขยายเป็นกลุ่มหมู่บ้านที่ยังคงช่วยเหลือกัน ทั้งด้านงานบุญ ประเพณี การศึกษา และการพัฒนาท้องถิ่น',
  },
  {
    title: 'ชุมชนบ้านเหล่าในปัจจุบัน',
    description:
      'วัด โรงเรียน ผู้นำหมู่บ้าน และองค์กรปกครองส่วนท้องถิ่นร่วมกันดูแลคุณภาพชีวิต รักษาภูมิปัญญา และส่งต่ออัตลักษณ์ของชุมชนสู่คนรุ่นใหม่',
  },
];

const COMMUNITY_FACTS = [
  { icon: <RiMapPinLine />, label: 'ที่ตั้ง', value: 'ตำบลเม็กดำ จังหวัดมหาสารคาม' },
  {
    icon: <RiGroupLine />,
    label: 'เครือข่ายชุมชน',
    value: '6 กลุ่มหมู่บ้านที่มีความสัมพันธ์ร่วมกัน',
  },
  { icon: <RiCommunityLine />, label: 'ศูนย์รวมชุมชน', value: 'วัด โรงเรียน และองค์กรท้องถิ่น' },
];

export function CommunityHistoryView() {
  return (
    <Container maxWidth={false} sx={{ py: { xs: 6, md: 10 } }}>
      <Grid container spacing={{ xs: 3, md: 5 }}>
        <Grid size={{ xs: 12, md: 7.5 }}>
          <Stack spacing={4}>
            <Box>
              <Typography color="primary" variant="overline">
                ความเป็นมา
              </Typography>
              <Typography component="h1" variant="h3" sx={{ mt: 1, mb: 2 }}>
                ชุมชนที่เติบโตเคียงข้างวัดและโรงเรียน
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
                บ้านเหล่าเป็นชุมชนเก่าแก่ที่ผู้คนดำเนินชีวิตร่วมกันบนพื้นฐานของความเอื้อเฟื้อ
                ความศรัทธา และประเพณีอีสาน วัดบ้านเหล่าเป็นพื้นที่ประกอบศาสนกิจและงานบุญ
                ขณะที่โรงเรียนบ้านเหล่าเป็นศูนย์กลางการเรียนรู้ของเด็กและเยาวชนในชุมชน
              </Typography>
            </Box>

            <Stack spacing={0}>
              {HISTORY_STAGES.map((stage, index) => (
                <Stack key={stage.title} direction="row" spacing={2.5}>
                  <Stack alignItems="center">
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        typography: 'subtitle2',
                        color: 'primary.contrastText',
                        bgcolor: 'primary.main',
                      }}
                    >
                      {index + 1}
                    </Box>
                    {index < HISTORY_STAGES.length - 1 ? (
                      <Divider orientation="vertical" flexItem sx={{ minHeight: 72, my: 1 }} />
                    ) : null}
                  </Stack>
                  <Box sx={{ pb: index < HISTORY_STAGES.length - 1 ? 4 : 0 }}>
                    <Typography component="h3" variant="h6" sx={{ mb: 0.75 }}>
                      {stage.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {stage.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4.5 }}>
          <Card sx={{ position: { md: 'sticky' }, top: { md: 120 } }}>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2.5 }}>
                ข้อมูลชุมชนโดยสรุป
              </Typography>
              <Stack spacing={2.5}>
                {COMMUNITY_FACTS.map((fact) => (
                  <Stack key={fact.label} direction="row" spacing={2}>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        flexShrink: 0,
                        display: 'grid',
                        placeItems: 'center',
                        color: 'primary.main',
                        bgcolor: 'primary.lighter',
                        '& svg': { width: 22, height: 22 },
                      }}
                    >
                      {fact.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle2">{fact.label}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fact.value}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
