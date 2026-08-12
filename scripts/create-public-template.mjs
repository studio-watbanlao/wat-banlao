import { access, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const key = String(process.argv[2] || '').trim().toLowerCase();
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
  throw new Error('Template key ต้องเป็นตัวพิมพ์เล็ก ตัวเลข หรือขีดกลาง เช่น modern-temple');
}

const directory = path.join(process.cwd(), 'src', 'public-templates', key);
try {
  await access(directory);
  throw new Error(`มี folder นี้แล้ว: ${directory}`);
} catch (error) {
  if (error instanceof Error && error.message.startsWith('มี folder')) throw error;
}

await mkdir(directory, { recursive: true });

const pascalName = key
  .split('-')
  .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
  .join('');

const files = {
  'public-layout.tsx': `export function ${pascalName}PublicLayout({ children }: { children: React.ReactNode }) {\n  return <>{children}</>;\n}\n`,
  'home-view.tsx': `export function ${pascalName}HomeView() {\n  return <main>TODO: ${key} home template</main>;\n}\n`,
  'page-content.tsx': `import type { TemplePage } from 'src/types/temple-page';\n\nexport function ${pascalName}PageContent({ page }: { page: TemplePage }) {\n  return <main>{page.title}</main>;\n}\n`,
  'README.md': `# ${key}\n\nTemplate scaffold created. Implement layout, home, and managed page components, then register the key in ../catalog.ts and the three runtime dispatch points documented in ../README.md.\n`,
};

await Promise.all(
  Object.entries(files).map(([filename, content]) =>
    writeFile(path.join(directory, filename), content, { encoding: 'utf8', flag: 'wx' })
  )
);

process.stdout.write(`Created ${directory}\n`);

