import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import Iconify from 'src/components/iconify';

import { Grid, Skeleton } from '@mui/material';
import { useMemo } from 'react';
import EmptyContent from 'src/components/empty-content';
import { useGetBlog } from 'src/queries/article/blog';
import BlogItem from './blog-item';

const BlogList = () => {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useGetBlog();

  const list = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const isEmpty = !isLoading && list.length === 0;

  return (
    <>
      {/* Loading */}
      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty */}
      {isEmpty && <EmptyContent title="ไม่พบข้อมูล" />}

      <Grid container spacing={3}>
        {list.map((post) => (
          <Grid item key={post.id} xs={12} sm={6} md={3}>
            <BlogItem data={post} />
          </Grid>
        ))}
      </Grid>

      {hasNextPage && (
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
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            startIcon={<Iconify icon="svg-spinners:12-dots-scale-rotate" width={24} />}
          >
            {isFetchingNextPage ? 'กำลังโหลด...' : 'โหลดเพิ่มเติม'}
          </Button>
        </Stack>
      )}
    </>
  );
};

export default BlogList;
