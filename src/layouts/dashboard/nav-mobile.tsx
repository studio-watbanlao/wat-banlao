import { useEffect } from 'react';
import { mergeClasses } from 'minimal-shared/utils';
import Drawer from '@mui/material/Drawer';

import { layoutClasses } from '../core';

import { DashboardTempleIdentity } from './temple-identity';

import { usePathname } from 'src/routes/hooks';
import { Scrollbar } from 'src/components/scrollbar';
import { NavSectionVertical } from 'src/components/nav-section';
import type { NavSectionProps } from 'src/components/nav-section';

// ----------------------------------------------------------------------

type NavMobileProps = NavSectionProps & {
  open: boolean;
  onClose: () => void;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
};

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  className,
  checkPermissions,
  ...other
}: NavMobileProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className]),
          sx: [
            {
              overflow: 'unset',
              bgcolor: 'var(--layout-nav-bg)',
              width: 'var(--layout-nav-mobile-width)',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}
    >
      {slots?.topArea ?? <DashboardTempleIdentity />}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          checkPermissions={checkPermissions}
          sx={{ px: 2, pb: 2, flex: '1 1 auto' }}
          {...other}
        />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}
