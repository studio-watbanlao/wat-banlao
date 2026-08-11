import { usePathname as useNextPathname } from 'next/navigation';

export function usePathname(): string {
  return useNextPathname() ?? '/';
}
