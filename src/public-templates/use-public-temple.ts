'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { isPublicTemplateKey } from 'src/public-templates/catalog';
import type { TempleBranding } from 'src/types/temple';
import axios from 'src/utils/axios';

export type PublicTempleConfig = {
  id: string;
  slug: string;
  name: string;
  branding: TempleBranding;
  primaryDomain: string;
};

export const PUBLIC_TEMPLE_QUERY_KEY = ['public-temple-config'] as const;

export function usePublicTemple() {
  const router = useRouter();
  const isPreviewRoute = router.pathname === '/dashboard/templates/preview';
  const templeId = typeof router.query.templeId === 'string' ? router.query.templeId : '';
  const requestedTemplate =
    typeof router.query.template === 'string' && isPublicTemplateKey(router.query.template)
      ? router.query.template
      : '';

  return useQuery({
    queryKey: isPreviewRoute
      ? [...PUBLIC_TEMPLE_QUERY_KEY, 'preview', templeId, requestedTemplate]
      : PUBLIC_TEMPLE_QUERY_KEY,
    queryFn: async () => {
      if (isPreviewRoute) {
        if (!templeId) throw new Error('ไม่พบข้อมูลวัดสำหรับแสดงตัวอย่าง');
        const response = await axios.get('/api/public/config', {
          headers: { 'x-temple-id': templeId },
        });
        const temple = response.data.temple as PublicTempleConfig;

        return {
          id: temple.id,
          slug: temple.slug,
          name: temple.name,
          branding: {
            ...temple.branding,
            publicTemplate: requestedTemplate || temple.branding.publicTemplate,
          },
          primaryDomain: temple.primaryDomain,
        } satisfies PublicTempleConfig;
      }

      const response = await axios.get('/api/public/config');
      return response.data.temple as PublicTempleConfig;
    },
    enabled: !isPreviewRoute || router.isReady,
    // Template/branding changes must be visible as soon as an admin saves them.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    retry: false,
  });
}
