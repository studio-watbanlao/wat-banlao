import type { AuthUserType } from './types';
import type { TempleAccess } from 'src/types/temple';

import { paths } from 'src/routes/paths';

const normalizePath = (value: string) => {
  const pathname = value.split(/[?#]/, 1)[0].replace(/\/+$/, '');
  return pathname || '/';
};

export function getPostLoginPath(user: AuthUserType, returnTo?: string | null) {
  const accesses = (Array.isArray(user?.templeAccesses) ? user.templeAccesses : []) as TempleAccess[];

  if (user?.role === 'user' && !accesses.length) {
    return '/auth/pending-approval';
  }

  const requestedPath =
    returnTo?.startsWith('/') && !returnTo.startsWith('//') ? returnTo : paths.dashboard.root;
  const currentAccess =
    accesses.find((access) => access.temple.id === user?.currentTempleId) || accesses[0];
  const canManageMembers =
    user?.role === 'super_admin' ||
    currentAccess?.role === 'super_admin' ||
    currentAccess?.role === 'temple_admin' ||
    currentAccess?.permissions?.members?.includes('read');
  const membersPath = normalizePath(paths.dashboard.members);
  const normalizedRequestedPath = normalizePath(requestedPath);

  if (
    !canManageMembers &&
    (normalizedRequestedPath === membersPath ||
      normalizedRequestedPath.startsWith(`${membersPath}/`))
  ) {
    return paths.dashboard.root;
  }

  return requestedPath;
}
