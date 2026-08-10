'use client';

import { Grid, Skeleton, Stack } from '@mui/material';
import EmptyContent from 'src/components/empty-content';
import { useGetSacred } from 'src/queries/sacred';
import SacredItem from '../sacred/sacred-item';

const SacredList = () => {
  const { data = [], isLoading } = useGetSacred();
  const isEmpty = !isLoading && data.length === 0;

  return (
    <Stack>
      {/* Loading */}
      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty */}
      {isEmpty && <EmptyContent title="ไม่พบข้อมูล" />}

      {!isLoading && !isEmpty && (
        <Grid container spacing={3}>
          {data.map((item: any) => (
            <Grid item key={item.id} xs={12} sm={6} md={3}>
              <SacredItem data={item} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
};

export default SacredList;
