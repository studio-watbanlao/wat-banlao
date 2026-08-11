import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import Iconify from 'src/components/iconify';

import { Grid, Skeleton } from '@mui/material';
import EmptyContent from 'src/components/empty-content';
import { useGetActivity } from 'src/queries/activity';
import ActivityItem from './activity-item';

const ActivityList = () => {
  const { data = [], isLoading } = useGetActivity();
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

      {!isLoading && !isEmpty && (
        <Grid container spacing={3}>
          {data.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <ActivityItem data={item} />
            </Grid>
          ))}
        </Grid>
      )}

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
    </>
  );
};

export default ActivityList;
