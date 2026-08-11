import type { PropsWithChildren } from 'react';

import { SimpleLayout } from '../simple';

export default function CompactLayout({ children }: PropsWithChildren) {
  return <SimpleLayout slotProps={{ content: { compact: true } }}>{children}</SimpleLayout>;
}
