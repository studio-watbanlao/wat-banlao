import { Box, Card, Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useEffect } from 'react';
import ReactPlayer from 'react-player';

import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { usePostArchitecture } from 'src/queries/architecture';
import { fShortenNumber } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

import { useParams } from 'next/navigation';
import Image from 'src/components/image';
import MataData from 'src/components/mata-data/mata-data';
import ShareComponent from 'src/components/social-share/share';
import { CONFIG } from 'src/config-global';
import { useGetArchitectureById } from 'src/queries/architecture';
import { paths } from 'src/routes/paths';
import Banking from 'src/sections/share/banking';
import ArchitectureImageCarousel from '../architecture-image-carousel';

const ArchitectureDetailsView = () => {
  const params = useParams();
  const id = params?.id as string;

  const theme = useTheme();

  const { data } = useGetArchitectureById(id);
  const { mutate } = usePostArchitecture();

  useEffect(() => {
    mutate(id);
  }, [id]);

  const urlShare = `${CONFIG.websiteUrl}${paths.banlao.architecture.root}/${data?.id}`;

  return (
    <>
      <MataData data={data ?? undefined} url={urlShare} />
      <CustomBreadcrumbs
        links={[
          {
            name: 'สถาปัตย์และสิ่งสำคัญ',
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
                <Typography variant="body2" color="primary">
                  {data?.createdDate && fDateTime(data?.createdDate, 'dd/MM/yyyy hh:mm:ss')}
                </Typography>
                <Stack spacing={2} direction="row" alignItems="center">
                  {data?.title && <ShareComponent urlShare={urlShare} title={data.title} />}

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
                </Stack>
              </Stack>

              {data?.images && <ArchitectureImageCarousel data={data} />}

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

              {data?.content && (
                <Box
                  component={'div'}
                  dangerouslySetInnerHTML={{
                    __html: data?.content,
                  }}
                />
              )}

              {data?.videoUrl && (
                <Stack>
                  <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
                  <Stack sx={{ backgroundColor: '#000', p: 1, borderRadius: 2, mt: 2 }}>
                    <ReactPlayer
                      src={data?.videoUrl}
                      width="100%"
                      height={400}
                      style={{ borderRadius: '50px' }}
                      config={{
                        youtube: {
                          color: 'white',
                        },
                      }}
                    />
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Grid>

          <Grid item xs={12} md={4}>
            <Banking
              price="$50"
              title={`Invite friends \n and earn`}
              description="Praesent egestas tristique nibh. Duis lobortis massa imperdiet quam."
              img="/assets/illustrations/characters/character_11.png"
            />
            {data?.logoUrl && (
              <Stack mt={3}>
                <Card sx={{ width: '100%', height: 'auto', borderRadius: 3, p: 1 }}>
                  <Image
                    src={data?.logoUrl}
                    alt="1"
                    ratio="1/1"
                    sx={{ height: 'auto', width: '100%', borderRadius: 2 }}
                  />
                </Card>
              </Stack>
            )}

            {data?.openingUrl && (
              <Stack mt={3}>
                <Divider sx={{ borderStyle: 'dashed', my: 2 }} />
                <Typography variant="h4" color="primary">
                  วิดีโอการแสดงเปิดงาน
                </Typography>

                <Stack sx={{ backgroundColor: '#000', p: 2, borderRadius: 2, mt: 2 }}>
                  <ReactPlayer
                    src={data?.openingUrl}
                    width="100%"
                    height={200}
                    style={{ borderRadius: '50px' }}
                    config={{
                      youtube: {
                        color: 'white',
                      },
                    }}
                  />
                </Stack>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Stack>
    </>
  );
};

export default ArchitectureDetailsView;
