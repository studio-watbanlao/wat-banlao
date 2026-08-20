import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';

import Iconify from 'src/components/iconify';

type Props = {
  icon: string;
  title: string;
  subheader: string;
};

export default function AdminFormSectionHeader({ icon, title, subheader }: Props) {
  return (
    <>
      <CardHeader
        avatar={
          <Avatar variant="rounded" sx={{ bgcolor: 'primary.lighter', color: 'primary.dark' }}>
            <Iconify icon={icon} />
          </Avatar>
        }
        title={title}
        subheader={subheader}
      />
      <Divider sx={{ mt: 2 }} />
    </>
  );
}
