import { IconButton, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import React from 'react';
import Iconify from '../iconify';

type ShareProps = {
  urlShare: string;
  title: string;
  keyword?: any;
};

const FacebookShareButton = dynamic(
  () => import('react-share').then((mod) => mod.FacebookShareButton),
  { ssr: false }
);

const LineShareButton = dynamic(() => import('react-share').then((mod) => mod.LineShareButton), {
  ssr: false,
});

const ShareComponent: React.FC<ShareProps> = ({ urlShare, title }) => {
  const theme = useTheme();
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <FacebookShareButton url={urlShare} title={title} htmlTitle={title}>
        <IconButton sx={{ bgcolor: theme.palette.primary.lighter, width: 40, height: 40 }}>
          <Iconify icon={'ri:facebook-fill'} color={theme.palette.primary.main} width="32px" />
        </IconButton>
      </FacebookShareButton>

      <LineShareButton url={urlShare} title={title} htmlTitle={title}>
        <IconButton sx={{ bgcolor: theme.palette.primary.lighter, width: 40, height: 40 }}>
          <Iconify icon={'ri:line-fill'} color={theme.palette.primary.main} width="32px" />
        </IconButton>
      </LineShareButton>
    </div>
  );
};

export default ShareComponent;
