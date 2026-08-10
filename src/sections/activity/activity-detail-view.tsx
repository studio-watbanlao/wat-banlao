import { Box, Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import MataData from 'src/components/mata-data/mata-data';
import ShareComponent from 'src/components/social-share/share';
import { CONFIG } from 'src/config-global';
import { useGetActivityById } from 'src/queries/activity';
import { usePostActivity } from 'src/queries/activity/mutation';
import { paths } from 'src/routes/paths';
import { fShortenNumber } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import Banking from '../share/banking';
import ActivityImageCarousel from './activity-image-carousel';

const ActivityDetailsView = () => {
  const theme = useTheme();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading } = useGetActivityById(id);

  const { mutate } = usePostActivity();

  useEffect(() => {
    mutate(id);
  }, [id]);

  const urlShare = `${CONFIG.websiteUrl}/${paths.activity.root}/${data?.id}`;

  return (
    <>
      <MataData data={data ?? undefined} />
      <CustomBreadcrumbs
        links={[
          {
            name: 'กิจกรรมต่างๆ',
            href: '/',
          },
          { name: data?.title },
        ]}
        sx={{
          mb: 3,
        }}
      />
      <Stack>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Stack spacing={2}>
              <Typography variant="h4" color="primary">
                {data?.title}
              </Typography>

              <Typography variant="body1">{data?.description}</Typography>

              <Stack
                spacing={1.5}
                direction="row"
                justifyContent="space-between"
                sx={{
                  typography: 'caption',
                  opacity: 0.64,
                  color: 'common.white',
                }}
              >
                <Typography variant="body1" color="primary">
                  {data?.createdDate && fDateTime(data?.createdDate, 'dd/MM/yyyy hh:mm:ss')}
                </Typography>
                <Stack spacing={2} direction="row" alignItems="center">
                  {data?.title && <ShareComponent urlShare={urlShare} title={data?.title} />}
                  <Stack direction="row" alignItems="center">
                    <Iconify
                      icon="solar:eye-bold"
                      width={24}
                      sx={{ mr: 0.5, color: theme.palette.primary.main }}
                    />
                    <Typography variant="body1" color="primary">
                      {fShortenNumber(data?.view ?? 0)}
                    </Typography>
                  </Stack>

                  {/* <Stack direction="row" alignItems="center">
                    <Iconify
                      icon="solar:share-bold"
                      width={24}
                      sx={{ mr: 0.5, color: theme.palette.primary.main }}
                    />
                    <Typography variant="body1" color="primary">
                      {fShortenNumber(20000)}
                    </Typography>
                  </Stack> */}
                </Stack>
              </Stack>

              {data?.images && <ActivityImageCarousel data={data} />}

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

              <Box
                component={'div'}
                dangerouslySetInnerHTML={{
                  __html: data?.content || '',
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Banking
              price="$50"
              title={`Invite friends \n and earn`}
              description="Praesent egestas tristique nibh. Duis lobortis massa imperdiet quam."
              img="/assets/illustrations/characters/character_11.png"
            />
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default ActivityDetailsView;
