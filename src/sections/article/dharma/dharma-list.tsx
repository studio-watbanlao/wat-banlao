import { useEffect, useMemo, useRef } from 'react';

import { Grid, Skeleton } from '@mui/material';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import EmptyContent from 'src/components/empty-content';
import Iconify from 'src/components/iconify';
import { useGetDharma } from 'src/queries/article/dharma';
import DharmaItem from './dharma-item';

// ----------------------

const SKELETON_COUNT = 8;

const DharmaList = () => {
  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useGetDharma();

  const list = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);

  const isEmpty = !isLoading && list.length === 0;

  // ----------------------
  // ✅ Auto load more (Infinite Scroll)
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    const current = loadMoreRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [fetchNextPage, hasNextPage]);

  // ----------------------

  return (
    <>
      {/* ---------------- Loading ---------------- */}
      {isLoading && (
        <Grid container spacing={3}>
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ---------------- Empty ---------------- */}
      {isEmpty && <EmptyContent title="ไม่พบข้อมูล" />}

      {/* ---------------- List ---------------- */}
      {!isLoading && !isEmpty && (
        <Grid container spacing={3}>
          {list.map((post: any) => (
            <Grid item key={post.id ?? post.title} xs={12} sm={6} md={3}>
              <DharmaItem data={post} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ---------------- Load More (Manual fallback) ---------------- */}
      {hasNextPage && (
        <Stack alignItems="center" sx={{ mt: 8, mb: { xs: 10, md: 15 } }}>
          <Button
            size="large"
            variant="outlined"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            startIcon={<Iconify icon="svg-spinners:12-dots-scale-rotate" width={24} />}
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </Button>
        </Stack>
      )}

      {/* ---------------- Auto trigger ---------------- */}
      <div ref={loadMoreRef} />
    </>
  );
};

export default DharmaList;
