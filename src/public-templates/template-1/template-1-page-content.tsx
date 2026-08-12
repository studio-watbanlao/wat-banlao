import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import NextImage from 'next/image';

import { applyDefaultContentImage, resolveContentImage } from 'src/constants/images';
import type { TemplePage } from 'src/types/temple-page';

export function Template1PageContent({ page }: { page: TemplePage }) {
  const isLanding = page.templateKey === 'landing';

  return (
    <>
      <Box
        component="section"
        sx={{
          color: 'common.white',
          bgcolor: '#10291F',
          borderBottom: '4px solid',
          borderColor: 'secondary.main',
          backgroundImage:
            'radial-gradient(circle at 78% 0%, rgba(214,173,92,0.22), transparent 36%)',
        }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 8, md: 13 } }}>
          <Stack spacing={2} alignItems={isLanding ? 'center' : 'flex-start'}>
            {page.eyebrow ? (
              <Typography variant="overline" sx={{ color: 'secondary.main', letterSpacing: 3 }}>
                {page.eyebrow}
              </Typography>
            ) : null}
            <Typography
              component="h1"
              align={isLanding ? 'center' : 'left'}
              sx={{ fontSize: { xs: '2.6rem', md: '4.8rem' }, fontWeight: 800, lineHeight: 1.1 }}
            >
              {page.title}
            </Typography>
            {page.excerpt ? (
              <Typography
                variant="h6"
                align={isLanding ? 'center' : 'left'}
                sx={{
                  maxWidth: 760,
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 400,
                  lineHeight: 1.8,
                }}
              >
                {page.excerpt}
              </Typography>
            ) : null}
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: { xs: 4, md: 7 } }}>
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 260, md: 560 },
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <NextImage
            src={resolveContentImage(page.heroImageUrl)}
            alt={page.title}
            fill
            unoptimized
            onError={applyDefaultContentImage}
            sizes="(max-width: 1200px) 100vw, 1200px"
            style={{ objectFit: 'cover' }}
          />
        </Box>
      </Container>

      {page.content ? (
        <Container maxWidth="xl" sx={{ py: { xs: 7, md: 11 } }}>
          <Box
            sx={{
              typography: 'body1',
              fontSize: 18,
              lineHeight: 1.95,
              color: '#263A31',
              '& h2, & h3': { color: '#10291F' },
              '& a': { color: 'primary.main' },
              '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2 },
            }}
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </Container>
      ) : null}
    </>
  );
}
