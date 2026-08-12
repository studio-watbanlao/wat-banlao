'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import axios from 'src/utils/axios';

type Props = { templeId?: string };
type VisitResponse = { totalVisits: number };

export default function WebsiteVisitorCount({ templeId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isPreview = router.pathname === '/dashboard/templates/preview';
  const queryKey = ['public-website-visits', templeId];
  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axios.get<VisitResponse>('/api/public/website-visits');
      return response.data.totalVisits;
    },
    enabled: Boolean(templeId) && !isPreview,
    staleTime: 30 * 1000,
    retry: false,
  });

  useEffect(() => {
    if (!templeId || isPreview) return;
    const sessionKey = `wat-website-visit:${templeId}`;

    try {
      if (sessionStorage.getItem(sessionKey) === 'counted') return;
      sessionStorage.setItem(sessionKey, 'counted');
    } catch {
      return;
    }

    axios
      .post<VisitResponse>('/api/public/website-visits')
      .then((response) =>
        queryClient.setQueryData(['public-website-visits', templeId], response.data.totalVisits)
      )
      .catch(() => {
        try {
          sessionStorage.removeItem(sessionKey);
        } catch {
          // Session storage may be unavailable in privacy mode.
        }
      });
  }, [isPreview, queryClient, templeId]);

  if (isPreview) return null;

  return (
    <Box component="section" aria-label="จำนวนผู้เข้าชมเว็บไซต์" sx={{ py: { xs: 4, md: 5 } }}>
      <Container maxWidth="lg">
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          spacing={1.5}
          sx={{
            mx: 'auto',
            px: 3,
            py: 2,
            width: 'fit-content',
            minWidth: '100%',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            bgcolor: 'background.paper',
            color: 'text.primary',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            จำนวนผู้เข้าชมเว็บไซต์
          </Typography>
          <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
            {(data ?? 0).toLocaleString('th-TH')} ครั้ง
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
