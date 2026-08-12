# Public templates

Public templates are code-based and selected per temple by `temple_branding.public_template`.

Each template owns its public shell and presentation code. The current templates are:

- `custom`: the original Wat Ban Lao layout and home page.
- `serene`: a separate one-row header, dark footer, home page, and CMS page renderer.
- `template-1`: a dark heritage-style shell with a full hero, gold accents, and CMS page renderer.

Super Admin can edit display names and descriptions in `/dashboard/templates`. These values live in
`public.public_templates`; presentation code remains in Git and is deployed with the application.

To add another template:

1. Create a DRAFT in Super Admin. In local development the folder is scaffolded automatically.
2. For a DRAFT created on Cloud, run `npm run template:create -- <template-key>` locally.
3. Implement the generated layout, home, and managed-page components.
4. Add the key to `catalog.ts` and register the three runtime dispatch points in
   `layouts/main/layout.tsx`, `sections/home/view/home-view.tsx`, and
   `sections/temple-page/temple-page-view.tsx`.
5. Run typecheck/build, deploy, then change the catalog status to READY. Only READY code templates
   can be assigned to a temple.

Templates contain presentation code only. Content remains tenant-scoped in the shared database, so changing templates does not duplicate or delete temple content.
