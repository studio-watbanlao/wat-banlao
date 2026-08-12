import { access, mkdir, writeFile } from 'fs/promises';
import path from 'path';

const toPascalCase = (value: string) =>
  value
    .split('-')
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join('');

export async function scaffoldPublicTemplate(templateKey: string) {
  const directory = path.join(process.cwd(), 'src', 'public-templates', templateKey);
  try {
    await access(directory);
    return { created: false, path: `src/public-templates/${templateKey}` };
  } catch {
    // The directory does not exist yet.
  }

  const componentName = toPascalCase(templateKey);
  await mkdir(directory, { recursive: true });
  const files = {
    'public-layout.tsx': `export function ${componentName}PublicLayout({ children }: { children: React.ReactNode }) {\n  return <>{children}</>;\n}\n`,
    'home-view.tsx': `export function ${componentName}HomeView() {\n  return <main>TODO: ${templateKey} home template</main>;\n}\n`,
    'page-content.tsx': `import type { TemplePage } from 'src/types/temple-page';\n\nexport function ${componentName}PageContent({ page }: { page: TemplePage }) {\n  return <main>{page.title}</main>;\n}\n`,
    'README.md': `# ${templateKey}\n\nImplement layout, home, and page components. Register this key in the parent catalog and runtime dispatch points before changing the template status to READY.\n`,
  };

  await Promise.all(
    Object.entries(files).map(([filename, content]) =>
      writeFile(path.join(directory, filename), content, { encoding: 'utf8', flag: 'wx' })
    )
  );

  return { created: true, path: `src/public-templates/${templateKey}` };
}

