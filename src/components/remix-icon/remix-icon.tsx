import type { ComponentProps } from 'react';

import Iconify from '../iconify';

// ----------------------------------------------------------------------

export type RemixIconProps = ComponentProps<typeof Iconify>;

export function RemixIcon(props: RemixIconProps) {
  return <Iconify {...props} />;
}
