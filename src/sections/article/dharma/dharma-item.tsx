import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import { alpha, useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { useResponsive } from 'src/hooks/use-responsive';

import { AvatarShape } from 'src/assets/illustrations';

import Image from 'src/components/image';
import TextMaxLine from 'src/components/text-max-line';
import { fDateTimeTH } from 'src/utils/format-time';
import type { EditorialItem } from 'src/types/editorial';

type Props = {
  data: EditorialItem;
  index?: number;
};

const DharmaItem = ({ data, index }: Props) => {
  const theme = useTheme();
  const mdUp = useResponsive('up', 'md');

  const { imageUrl, title, author, id, createdDate } = data;

  const latestPost = index === 0 || index === 1 || index === 2;

  if (mdUp && latestPost) {
    return (
      <Card>
        <Avatar
          alt={author || 'ผู้เขียน'}
          src={data.authorImageUrl}
          sx={{
            top: 24,
            left: 24,
            zIndex: 9,
            position: 'absolute',
          }}
        >
          B
        </Avatar>

        <DharmaCard title={title} index={index} id={id} createdDate={createdDate} />

        <Image
          alt={title}
          src={imageUrl}
          overlay={alpha(theme.palette.grey[900], 0.48)}
          sx={{
            width: 1,
            height: 360,
          }}
        />
      </Card>
    );
  }

  return (
    <Card>
      <Box sx={{ position: 'relative' }}>
        <AvatarShape
          sx={{
            left: 0,
            zIndex: 9,
            width: 88,
            height: 36,
            bottom: -16,
            position: 'absolute',
          }}
        />

        <Avatar
          alt={author || 'ผู้เขียน'}
          src={data.authorImageUrl || '/logo/logo.png'}
          sx={{
            left: 24,
            zIndex: 9,
            bottom: -24,
            position: 'absolute',
          }}
        />

        <Image alt={title} src={imageUrl} ratio="4/3" />
      </Box>

      <DharmaCard title={title} id={id} createdDate={createdDate} />
    </Card>
  );
};

export default DharmaItem;

type PostContentProps = {
  title: string;
  index?: number;
  id: string;
  createdDate?: string;
};

export const DharmaCard = ({ title, index, id, createdDate }: PostContentProps) => {
  const mdUp = useResponsive('up', 'md');

  const linkTo = paths.article.dharma.details(id);

  const latestPostLarge = index === 0;

  const latestPostSmall = index === 1 || index === 2;

  return (
    <CardContent
      sx={{
        p: 2,
        pb: 2,
        pt: 4,
        width: 1,
        ...((latestPostLarge || latestPostSmall) && {
          pt: 0,
          zIndex: 9,
          bottom: 0,
          position: 'absolute',
          color: 'common.white',
        }),
      }}
    >
      <Typography
        variant="caption"
        component="div"
        sx={{
          mb: 1,
          color: 'text.disabled',
          ...((latestPostLarge || latestPostSmall) && {
            opacity: 0.64,
            color: 'common.white',
          }),
        }}
      >
        ธรรมะ
      </Typography>

      <Link color="inherit" component={RouterLink} href={linkTo}>
        <TextMaxLine variant={mdUp && latestPostLarge ? 'h5' : 'subtitle2'} line={2} persistent>
          {title || '-'}
        </TextMaxLine>

        {/* <TextMaxLine variant={mdUp ? 'body2' : 'subtitle2'} line={2} persistent>
          {description || '-'}
        </TextMaxLine> */}
      </Link>

      <Typography
        variant="caption"
        component="div"
        sx={{
          mt: 1,
          color: 'text.disabled',
        }}
      >
        วันที่เผยแพร่ : {createdDate ? fDateTimeTH(createdDate) : '-'}
      </Typography>
    </CardContent>
  );
};
