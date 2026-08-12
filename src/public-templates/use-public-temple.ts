'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { isPublicTemplateKey } from 'src/public-templates/catalog';
import type { TempleBranding } from 'src/types/temple';
import type { Temple } from 'src/types/temple';
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
        const response = await axios.get('/api/admin/public-templates');
        const temples = response.data.temples as Temple[];
        const temple = temples.find((item) => item.id === templeId) || temples[0];

        if (!temple) throw new Error('ไม่พบข้อมูลวัดสำหรับแสดงตัวอย่าง');

        return {
          id: temple.id,
          slug: temple.slug,
          name: temple.name,
          branding: {
            ...temple.branding,
            publicTemplate: requestedTemplate || temple.branding.publicTemplate,
          },
          primaryDomain: temple.domains.find((domain) => domain.isPrimary)?.domain || '',
        } satisfies PublicTempleConfig;
      }

      const response = await axios.get('/api/public/config');
      return response.data.temple as PublicTempleConfig;
    },
    enabled: !isPreviewRoute || router.isReady,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
