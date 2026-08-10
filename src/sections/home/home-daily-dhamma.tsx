import { m } from 'framer-motion';
import { useMemo } from 'react';

import { Avatar, Chip, Container, Skeleton, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';

import { MotionViewport, varFade } from 'src/components/animate';
import { useGetDharma } from 'src/queries/article/dharma';
import { fDateTime } from 'src/utils/format-time';
import { getLabelByType } from 'src/utils/tranform-text';

const HomeDailyDhamma = () => {
  const theme = useTheme();
  const { data, isLoading } = useGetDharma();

  const list = useMemo(() => data?.pages?.flatMap((page) => page.items) ?? [], [data]);

  const latestBlog = useMemo(() => {
    if (!list.length) return null;

    return [...list].sort(
      (a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
    )[0];
  }, [list]);

  if (list?.length === 0) {
    return;
  }

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
              <Chip
                label={latestBlog?.type && getLabelByType(latestBlog?.type)}
                color="secondary"
                sx={{ mb: 2 }}
              />

              {/* <Stack component={m.div} variants={varFade().inUp} alignItems="center">
                <Image
                  alt={latestBlog?.title}
                  src={latestBlog?.imageUrl}
                  sx={{ borderRadius: 2 }}
                />
              </Stack> */}

              <Typography variant="h3" gutterBottom>
                {latestBlog?.title || '-'}
              </Typography>

              <Stack spacing={1} alignItems="center" mt={2}>
                <Avatar alt={latestBlog?.author} src={latestBlog?.authorImageUrl}>
                  {latestBlog?.author?.charAt(0)}
                </Avatar>

                <Typography variant="h6">{latestBlog?.author || 'Unknown'}</Typography>

                <Typography variant="body2" color="text.secondary">
                  {latestBlog?.createdDate
                    ? fDateTime(latestBlog.createdDate, 'dd/MM/yyyy HH:mm')
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
