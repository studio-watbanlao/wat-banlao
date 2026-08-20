import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Image from 'src/components/image';
import {
  RiBookOpenLine,
  RiCommunityLine,
  RiMapPinLine,
  RiSchoolLine,
} from 'src/components/remix-icon';

const SCHOOL_DETAILS = [
  {
    icon: <RiSchoolLine />,
    label: 'ชื่อสถานศึกษา',
    value: 'โรงเรียนบ้านเหล่า (คุรุประชานุเคราะห์)',
  },
  {
    icon: <RiMapPinLine />,
    label: 'ที่ตั้ง',
    value: 'ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม',
  },
  {
    icon: <RiBookOpenLine />,
    label: 'ข้อมูลการศึกษา',
    value: 'รอเพิ่มระดับชั้นและรายละเอียดหลักสูตร',
  },
  {
    icon: <RiCommunityLine />,
    label: 'บทบาทในชุมชน',
    value: 'ศูนย์กลางการเรียนรู้และกิจกรรมของเด็ก เยาวชน และชุมชน',
  },
];

export function BanlaoSchoolView() {
  return (
    <Container maxWidth={false} sx={{ py: { xs: 6, md: 10 } }}>
      <Stack spacing={{ xs: 6, md: 9 }}>
        <Grid container spacing={{ xs: 3, md: 6 }} alignItems="center">
          <Grid size={{ xs: 12, md: 5.5 }}>
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 3,
                bgcolor: 'primary.lighter',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Image
                src="/assets/images/school.png"
                alt="โรงเรียนบ้านเหล่า"
                ratio="4/3"
                sx={{ objectFit: 'contain', position: 'relative' }}
              />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6.5 }}>
            <Typography color="primary" variant="overline">
              เกี่ยวกับโรงเรียน
            </Typography>
            <Typography component="h1" variant="h3" sx={{ mt: 1, mb: 2 }}>
              โรงเรียนของชุมชน เพื่ออนาคตของลูกหลาน
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.9 }}>
              โรงเรียนบ้านเหล่า (คุรุประชานุเคราะห์) เป็นสถานศึกษาที่อยู่คู่กับชุมชนบ้านเหล่า
              ทำหน้าที่ส่งเสริมการศึกษา คุณธรรม ทักษะชีวิต และการมีส่วนร่วมในกิจกรรมท้องถิ่น
              โดยประสานความร่วมมือกับผู้ปกครอง วัด และหน่วยงานในพื้นที่
            </Typography>
          </Grid>
        </Grid>

        <Box component="section">
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Typography component="h2" variant="h4">
              ข้อมูลโรงเรียน
            </Typography>
            <Typography color="text.secondary">
              ข้อมูลสำคัญสำหรับผู้ปกครอง นักเรียน และผู้ที่ต้องการติดต่อโรงเรียน
            </Typography>
          </Stack>
          <Grid container spacing={2.5}>
            {SCHOOL_DETAILS.map((detail) => (
              <Grid key={detail.label} size={{ xs: 12, sm: 6 }}>
                <Card sx={{ height: 1 }}>
                  <CardContent>
                    <Stack direction="row" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          flexShrink: 0,
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          bgcolor: 'primary.lighter',
                          '& svg': { width: 24, height: 24 },
                        }}
                      >
                        {detail.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2">{detail.label}</Typography>
                        <Typography color="text.secondary">{detail.value}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          component="section"
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            color: 'primary.contrastText',
            bgcolor: 'primary.main',
          }}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography component="h2" variant="h4">
                โรงเรียน วัด และชุมชน
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography sx={{ opacity: 0.84, lineHeight: 1.8 }}>
                ความร่วมมือของทั้งสามส่วนช่วยสร้างพื้นที่เรียนรู้ที่ครอบคลุมทั้งวิชาการ คุณธรรม
                วัฒนธรรม และการอยู่ร่วมกัน เพื่อให้เด็กและเยาวชนเติบโตอย่างมีคุณภาพ
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </Container>
  );
}
