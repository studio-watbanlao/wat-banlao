import { m } from 'framer-motion';
import { useMemo } from 'react';

import { Avatar, Chip, Container, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { MotionViewport, varFade } from 'src/components/animate';
import { useGetDharma } from 'src/queries/article/dharma';
import { fDateTime } from 'src/utils/format-time';

const HomeDailyDhamma = () => {
  const { data, isLoading } = useGetDharma();

  const list = useMemo(() => data?.pages?.flatMap((page) => page.items) ?? [], [data]);

  const latestDharma = useMemo(() => {
    if (!list.length) return null;

    return [...list].sort(
      (a, b) =>
        new Date(b.createdDate || b.createdAt || 0).getTime() -
        new Date(a.createdDate || a.createdAt || 0).getTime()
    )[0];
  }, [list]);

  if (!isLoading && list.length === 0) return null;

  return (
    <Container component={MotionViewport} sx={{ py: { xs: 10 } }}>
      <Stack
        alignItems="center"
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          p: 3,
          justifyContent: 'center',
          borderRadius: 2,
          borderColor: 'divider',
          borderStyle: 'dashed',
        }}
      >
        <Box
          component={m.div}
          variants={varFade().inUp}
          sx={{ textAlign: 'center', maxWidth: 600 }}
        >
          {isLoading ? (
            <Skeleton variant="rectangular" width={300} height={200} />
          ) : (
            <>
              <Chip label="ธรรมะ" color="secondary" sx={{ mb: 2 }} />

              {/* <Stack component={m.div} variants={varFade().inUp} alignItems="center">
                <Image
                  alt={latestBlog?.title}
                  src={latestBlog?.imageUrl}
                  sx={{ borderRadius: 2 }}
                />
              </Stack> */}

              <Typography variant="h3" gutterBottom>
                {latestDharma?.title || '-'}
              </Typography>

              <Stack spacing={1} alignItems="center" mt={2}>
                <Avatar alt={latestDharma?.author} src={latestDharma?.authorImageUrl}>
                  {latestDharma?.author?.charAt(0)}
                </Avatar>

                <Typography variant="h6">{latestDharma?.author || 'ไม่ระบุผู้เขียน'}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {latestDharma?.createdDate
                    ? fDateTime(latestDharma.createdDate, 'dd/MM/yyyy HH:mm')
                    : '-'}
                </Typography>
              </Stack>
            </>
          )}
        </Box>
      </Stack>
    </Container>
  );
};

export default HomeDailyDhamma;
