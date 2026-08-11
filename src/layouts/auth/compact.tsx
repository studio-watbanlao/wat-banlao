import type { PropsWithChildren } from 'react';

import { AuthCenteredLayout } from '../auth-centered';

export default function AuthLayoutCompact({ children }: PropsWithChildren) {
  return <AuthCenteredLayout>{children}</AuthCenteredLayout>;
}
