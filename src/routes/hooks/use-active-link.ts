import { usePathname } from "next/navigation";

// ----------------------------------------------------------------------

export function useActiveLink(targetPath: string, deep = true): boolean {
  const pathname = usePathname();

  if (!pathname || targetPath.startsWith("#")) return false;

  const normalize = (p: string) => p.replace(/\/+$/, ""); // ตัด / ท้ายออก

  const current = normalize(pathname);
  const target = normalize(targetPath);

  return current === target || (deep && current.startsWith(`${target}/`));
}
