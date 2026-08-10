import { Box, Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import MataData from 'src/components/mata-data/mata-data';
import { useGetSacredById } from 'src/queries/sacred';
import { usePostSacred } from 'src/queries/sacred/mutation';
import Banking from 'src/sections/share/banking';
import { fShortenNumber } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';
import SacredImageCarousel from './sacred-image-carousel';

const SacredDetailsView = () => {
  const theme = useTheme();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading } = useGetSacredById(id);
  const { mutate } = usePostSacred();

  useEffect(() => {
    mutate(id);
  }, [id]);

  return (
    <>
      <MataData data={data ?? undefined} />
      <CustomBreadcrumbs
        links={[
          {
            name: 'วัตถุมงคล',
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

              {data?.images && <SacredImageCarousel data={data} />}

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

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

export default SacredDetailsView;
