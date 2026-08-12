import type { PropsWithChildren } from 'react';

import { AuthCenteredLayout } from '../auth-centered';

type Props = PropsWithChildren<{
  split?: boolean;
}>;

export default function AuthLayoutCompact({ children, split = false }: Props) {
  return (
    <AuthCenteredLayout
      cssVars={split ? { '--layout-auth-content-width': '1040px' } : undefined}
      slotProps={
        split
          ? {
              content: {
                sx: {
                  p: 1,
                  overflow: 'hidden',
                  borderRadius: { xs: 2.5, md: 4 },
                },
              },
            }
          : undefined
      }
    >
      {children}
    </AuthCenteredLayout>
  );
}
