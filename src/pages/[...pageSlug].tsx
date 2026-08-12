import { useRouter } from 'next/router';

import { DynamicTemplePage } from 'src/sections/temple-page/temple-page-view';

export default function CustomTemplePage() {
  const router = useRouter();
  const slug = Array.isArray(router.query.pageSlug) ? router.query.pageSlug.join('/') : '';
  return <DynamicTemplePage slug={slug} />;
}
