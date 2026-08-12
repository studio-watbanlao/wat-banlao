import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useCurrentTempleAccess } from 'src/hooks/use-current-temple-access';

const contactText = (contact: Record<string, unknown> | undefined, key: string) => {
  const value = contact?.[key];
  return typeof value === 'string' ? value.trim() : '';
};

export function DashboardTempleIdentity({ compact = false }: { compact?: boolean }) {
  const access = useCurrentTempleAccess();
  const temple = access?.temple;
  const name = temple?.name || 'ระบบจัดการวัด';
  const nameEnglish = contactText(temple?.branding.contact, 'nameEnglish');
  const logoUrl = temple?.branding.logoUrl || '/logo/logo.png';

  if (compact) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
        <Avatar
          src={logoUrl}
          alt={name}
          sx={{ width: 40, height: 40, color: 'primary.main', bgcolor: 'background.neutral' }}
        >
          {name.charAt(0)}
        </Avatar>
      </Box>
    );
  }

  return (
    <Box display="flex" alignItems="center" sx={{ minWidth: 0, pl: 3.5, pr: 2, pt: 2.5, pb: 1 }}>
      <Avatar
        src={logoUrl}
        alt={name}
        sx={{
          width: 50,
          height: 50,
          flexShrink: 0,
          fontSize: 24,
          color: 'primary.main',
          bgcolor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {name.charAt(0)}
      </Avatar>
      <Stack ml={2} sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap title={name}>
          {name}
        </Typography>
        {nameEnglish ? (
          <Typography variant="body2" color="text.secondary" noWrap title={nameEnglish}>
            {nameEnglish}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}
