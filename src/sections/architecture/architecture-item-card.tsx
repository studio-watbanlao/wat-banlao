import { Button } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Iconify from 'src/components/iconify';
import Image from 'src/components/image';
import TextMaxLine from 'src/components/text-max-line';
import { paths } from 'src/routes/paths';
import type { ArchitectureItem } from 'src/types/architecture';

type ArchitectureItemCardProps = {
  data: ArchitectureItem;
  index?: number;
};

const ArchitectureItemCard = ({ data }: ArchitectureItemCardProps) => {
  const theme = useTheme();

  const { imageUrl, title, year, id, description } = data;

  return (
    <Stack>
      <Card>
        <Image alt={title} src={imageUrl} ratio="4/3" />
      </Card>
      <CardContent
        sx={{
          p: 2,
          px: 0,
          width: 1,
        }}
      >
        <Typography
          variant="caption"
          component="div"
          sx={{
            mb: 1,
            color: 'text.disabled',
          }}
        >
          สร้างเมื่อปี {year}
        </Typography>

        <TextMaxLine variant={'subtitle2'} line={2} persistent>
          {title}
        </TextMaxLine>

        <Stack alignItems="flex-start">
          <Button
            color="inherit"
            size="small"
            rel="noopener"
            href={paths.banlao.architecture.details(id)}
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
          >
            ดูเพิ่มเติม
          </Button>
        </Stack>
      </CardContent>
    </Stack>
  );
};

export default ArchitectureItemCard;
