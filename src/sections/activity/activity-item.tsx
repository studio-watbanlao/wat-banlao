import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import { fShortenNumber } from 'src/utils/format-number';
import { fDate } from 'src/utils/format-time';

import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import TextMaxLine from 'src/components/text-max-line';

// --------------------
// ✅ TYPE SAFE
// --------------------
type ActivityType = 'temple' | 'community' | 'school';

type Activity = {
  id: string;
  title: string;
  imageUrl: string;
  view: number;
  createdAt: string;
  type?: ActivityType;
};

type ActivityItemProps = {
  data: Activity;
  index?: number;
};

// --------------------
// ✅ MAP (แทน switch)
// --------------------
const ACTIVITY_TYPE_MAP: Record<
  ActivityType,
  { label: string; color: 'warning' | 'info' | 'success' }
> = {
  temple: { label: 'วัด', color: 'warning' },
  community: { label: 'ชุมชน', color: 'info' },
  school: { label: 'โรงเรียน', color: 'success' },
};

const ActivityItem = ({ data }: ActivityItemProps) => {
  const theme = useTheme();
  const mdUp = useResponsive('up', 'md');

  const linkTo = paths.activity.details(data.id);

  const activity = data.type && ACTIVITY_TYPE_MAP[data.type] ? ACTIVITY_TYPE_MAP[data.type] : null;

  return (
    <Card sx={{ position: 'relative' }}>
      {/* -------------------- */}
      {/* TYPE CHIP */}
      {/* -------------------- */}
      {activity && (
        <Stack
          direction="row"
          sx={{
            position: 'absolute',
            top: 20,
            left: 24,
            zIndex: 9,
          }}
        >
          <Chip label={activity.label} color={activity.color} />
        </Stack>
      )}

      {/* -------------------- */}
      {/* VIEW COUNT */}
      {/* -------------------- */}
      <Stack
        direction="row"
        alignItems="center"
        sx={{
          position: 'absolute',
          top: 24,
          right: 24,
          zIndex: 9,
          color: 'common.white',
        }}
      >
        <Iconify icon="solar:eye-bold" width={16} sx={{ mr: 0.5 }} />
        <Typography variant="caption">{fShortenNumber(data.view)}</Typography>
      </Stack>

      {/* -------------------- */}
      {/* CONTENT */}
      {/* -------------------- */}
      <CardContent
        sx={{
          position: 'absolute',
          bottom: 0,
          width: 1,
          zIndex: 9,
          color: 'common.white',
        }}
      >
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          {fDate(data.createdAt)}
        </Typography>

        <Link component={RouterLink} href={linkTo} color="inherit">
          <TextMaxLine variant="subtitle2" line={2} persistent>
            {data.title}
          </TextMaxLine>
        </Link>
      </CardContent>

      {/* -------------------- */}
      {/* IMAGE */}
      {/* -------------------- */}
      <Image
        alt={data.title}
        src={data.imageUrl}
        overlay={alpha(theme.palette.grey[900], 0.2)}
        sx={{
          width: 1,
          height: mdUp ? 360 : 240,
        }}
      />
    </Card>
  );
};

export default ActivityItem;
