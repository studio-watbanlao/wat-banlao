import { useAuthContext } from 'src/auth/hooks';
import type { TempleAccess } from 'src/types/temple';

export function useCurrentTempleAccess() {
  const { user } = useAuthContext();
  const accesses = (user?.templeAccesses || []) as TempleAccess[];
  return (
    accesses.find((access) => access.temple.id === user?.currentTempleId) || accesses[0] || null
  );
}

