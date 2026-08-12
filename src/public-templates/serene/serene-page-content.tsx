import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import Image from 'src/components/image';
import type { TemplePage } from 'src/types/temple-page';

export function SerenePageContent({ page }: { page: TemplePage }) {
  const isLanding = page.templateKey === 'landing';

  return (
    <>
      <Box
        component="section"
        sx={{
          py: { xs: 8, md: 13 },
          textAlign: isLanding ? 'center' : 'left',
          bgcolor: '#F8F7F2',
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(154,106,50,0.14), transparent 46%)',
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={2} alignItems={isLanding ? 'center' : 'flex-start'}>
            {page.eyebrow ? (
              <Typography variant="overline" sx={{ color: 'primary.main', letterSpacing: 3 }}>
                {page.eyebrow}
              </Typography>
            ) : null}
            <Typography
              variant="h1"
              sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, lineHeight: 1.1 }}
            >
              {page.title}
            </Typography>
            {page.excerpt ? (
              <Typography
                variant="h6"
                sx={{ maxWidth: 720, color: 'text.secondary', fontWeight: 400, lineHeight: 1.8 }}
              >
                {page.excerpt}
              </Typography>
            ) : null}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -7 }, position: 'relative' }}>
        <Image
          src={page.heroImageUrl}
          alt={page.title}
          sx={{
            width: '100%',
            maxHeight: 620,
            objectFit: 'cover',
            borderRadius: { xs: 2, md: 4 },
            boxShadow: '0 24px 80px rgba(37,48,43,0.16)',
          }}
        />
      </Container>

      {page.content ? (
        <Container maxWidth="xl" sx={{ py: { xs: 7, md: 11 } }}>
          <Box
            sx={{
              typography: 'body1',
              fontSize: 18,
              lineHeight: 1.9,
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
            }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </Container>
      ) : null}
    </>
  );
}
