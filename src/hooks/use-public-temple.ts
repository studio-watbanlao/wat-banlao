'use client';

import { useQuery } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

import type { TempleBranding, TempleModule } from 'src/types/temple';
import axios from 'src/utils/axios';

export type PublicTempleConfig = {
  id: string;
  slug: string;
  name: string;
  branding: TempleBranding;
  modules: Record<TempleModule, boolean>;
  primaryDomain: string;
};

export const PUBLIC_TEMPLE_QUERY_KEY = ['public-temple-config'] as const;
export const PublicTempleInitialDataContext = createContext<PublicTempleConfig | undefined>(
  undefined
);

export function usePublicTemple() {
  const initialTemple = useContext(PublicTempleInitialDataContext);

  return useQuery({
    queryKey: PUBLIC_TEMPLE_QUERY_KEY,
    queryFn: async () => {
      const response = await axios.get('/api/public/config');
      return response.data.temple as PublicTempleConfig;
    },
    initialData: initialTemple,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
