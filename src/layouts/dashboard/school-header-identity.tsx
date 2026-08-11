'use client';

import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';
import { useTranslate } from 'src/locales';


// ----------------------------------------------------------------------

export function SchoolHeaderIdentity() {
  const { t } = useTranslate();
  const schoolName = t('วัดบ้านเหล่า');

  return (
    <Link
      component={RouterLink}
      href={paths.teacher.root}
      underline="none"
      sx={{
        gap: 1.25,
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        color: 'grey.900',
      }}
    >
      <Avatar
        src="/logo/logo.png"
        alt={schoolName}
        variant="rounded"
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          fontWeight: 700,
          color: 'primary.main',
          bgcolor: 'primary.lighter',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {schoolName.charAt(0)}
      </Avatar>
      <Typography
        variant="subtitle1"
        sx={{
          maxWidth: { sm: 220, md: 320 },
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {schoolName}
      </Typography>
    </Link>
  );
}
