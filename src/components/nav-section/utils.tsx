import type { Theme } from '@mui/material/styles';

import type { NavItemDataProps } from './types';

import { RouterLink } from 'src/routes/components';

export const bulletColor = { light: '#E5E7EB', dark: '#4B5563' } as const;

export const navSectionClasses = {
  ul: 'nav__ul',
  li: 'nav__li',
  item: { root: 'nav__item', icon: 'nav__item__icon', title: 'nav__item__title' },
  state: { open: 'nav__item--open', active: 'nav__item--active' },
} as const;

export const navItemStyles = {
  icon: { width: 24, height: 24, flexShrink: 0, display: 'inline-flex' },
  title: (theme: Theme) => ({
    minWidth: 0,
    flex: '1 1 auto',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    margin: theme.spacing(0, 0.75),
  }),
  arrow: (theme: Theme) => ({ width: 16, height: 16, flexShrink: 0, marginLeft: theme.spacing(0.75) }),
} as const;

type CreateNavItemOptions = {
  path: string;
  icon?: React.ReactNode;
  hasChild?: boolean;
  externalLink?: boolean;
};

export function createNavItem({ path, icon, hasChild, externalLink }: CreateNavItemOptions) {
  const baseProps = hasChild
    ? { component: 'button' as const, type: 'button' as const }
    : externalLink
      ? { component: 'a' as const, href: path, target: '_blank', rel: 'noopener noreferrer' }
      : { component: RouterLink, href: path };

  return { baseProps, renderIcon: icon };
}

export function isNavDataActive(pathname: string, item: NavItemDataProps): boolean {
  const currentPath = pathname.replace(/\/+$/, '');
  const itemPath = item.path.replace(/\/+$/, '');
  const matchesDeepPath = item.deep && currentPath.startsWith(`${itemPath}/`);

  if (
    currentPath === itemPath ||
    matchesDeepPath ||
    item.activePaths?.some((path) => currentPath.startsWith(path.replace(/\/+$/, '')))
  ) {
    return true;
  }

  return item.children?.some((child: NavItemDataProps) => isNavDataActive(pathname, child)) ?? false;
}
