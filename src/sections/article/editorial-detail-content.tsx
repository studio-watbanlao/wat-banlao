import { Box, CircularProgress, Divider, Grid, Stack, Typography, useTheme } from '@mui/material';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import MataData from 'src/components/mata-data/mata-data';
import ShareComponent from 'src/components/social-share/share';
import { CONFIG } from 'src/config-global';
import type { EditorialItem } from 'src/types/editorial';
import { fShortenNumber } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

type Props = {
  data?: EditorialItem;
  isLoading: boolean;
  sectionName: string;
  sectionPath: string;
};

export default function EditorialDetailContent({
  data,
  isLoading,
  sectionName,
  sectionPath,
}: Props) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 10 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!data) {
    return (
      <Typography align="center" color="text.secondary" sx={{ py: 10 }}>
        ไม่พบข้อมูล
      </Typography>
    );
  }

  const shareUrl = `${CONFIG.websiteUrl}${sectionPath}/${data.id}`;

  return (
    <>
      <MataData data={data} />
      <CustomBreadcrumbs
        links={[
          { name: 'หน้าหลัก', href: '/' },
          { name: sectionName, href: sectionPath },
          { name: data.title },
        ]}
        sx={{ mb: 3 }}
      />
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 9 }}>
          <Stack spacing={2}>
            <Typography variant="h4" color="primary">
              {data.title}
            </Typography>
            {data.description ? <Typography variant="body1">{data.description}</Typography> : null}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
            >
              <Stack spacing={0.5}>
                {data.author ? (
                  <Typography variant="body2" color="text.secondary">
                    ผู้เขียน: {data.author}
                  </Typography>
                ) : null}
                <Typography variant="body2" color="text.secondary">
                  {data.createdDate
                    ? fDateTime(data.createdDate, 'dd/MM/yyyy HH:mm')
                    : 'ไม่ระบุวันที่เผยแพร่'}
                </Typography>
              </Stack>
              <Stack spacing={2} direction="row" alignItems="center">
                <ShareComponent urlShare={shareUrl} title={data.title} />
                <Stack direction="row" alignItems="center">
                  <Iconify
                    icon="solar:eye-bold"
                    width={24}
                    sx={{ mr: 0.5, color: theme.palette.primary.main }}
                  />
                  <Typography variant="body1" color="primary">
                    {fShortenNumber(data.view ?? 0)}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Image alt={data.title} src={data.imageUrl} ratio="16/9" sx={{ borderRadius: 2 }} />
            <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
            <Box
              component="article"
              sx={{ typography: 'body1', '& img': { maxWidth: 1, height: 'auto' } }}
              dangerouslySetInnerHTML={{ __html: data.content || '' }}
            />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
