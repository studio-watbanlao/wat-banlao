'use client';

import { Button, Grid, Skeleton, Stack } from '@mui/material';
import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { useGetArchitecture } from 'src/queries/architecture';
import ArchitectureItemCard from '../architecture-item-card';

const ArchitectureView = () => {
  const { data = [], isLoading } = useGetArchitecture();

  const isEmpty = !isLoading && data.length === 0;

  return (
    <>
      {/* Loading */}
      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty */}
      {isEmpty && <EmptyContent title="ไม่พบข้อมูล" />}

      {/* Data */}
      {!isLoading && !isEmpty && (
        <Stack>
          <Grid container spacing={2}>
            {data.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <ArchitectureItemCard data={item} />
              </Grid>
            ))}
          </Grid>

          {data.length > 8 && (
            <Stack
              alignItems="center"
              sx={{
                mt: 8,
                mb: { xs: 10, md: 15 },
              }}
            >
              <Button
                size="large"
                variant="outlined"
                startIcon={<Iconify icon="svg-spinners:12-dots-scale-rotate" width={24} />}
              >
                Load More
              </Button>
            </Stack>
          )}
        </Stack>
      )}
    </>
  );
};

export default ArchitectureView;
