import 'src/global.css';
import 'src/components/editor/components/code-highlight-block.css';
import 'src/locales/i18n';

import Script from 'next/script';
import localFont from 'next/font/local';
import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import type { AppProps } from 'next/app';

import { LocalizationProvider } from 'src/locales';
import ThemeProvider from 'src/theme';
import { AuthProvider } from 'src/auth/context/jwt';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import MataData from 'src/components/mata-data/mata-data';
import ProgressBar from 'src/components/progress-bar';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';
import { PublicTempleInitialDataContext } from 'src/hooks/use-public-temple';
import { createQueryClient } from 'src/queries/client';

const lineSeedSans = localFont({
  src: [
    { path: '../../public/fonts/LINESeedSansTH-Thin.woff2', weight: '100', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH-Regular.woff2', weight: '400', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH-Regular.woff2', weight: '500', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH-Bold.woff2', weight: '600', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH-Bold.woff2', weight: '700', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH-Heavy.woff2', weight: '800', style: 'normal' },
    { path: '../../public/fonts/LINESeedSansTH-Heavy.woff2', weight: '900', style: 'normal' },
  ],
  variable: '--font-line-seed-sans-th',
  display: 'swap',
  preload: true,
  fallback: ['Kanit', 'sans-serif'],
});

const App = ({ Component, pageProps }: AppProps) => {
  const [queryClient] = useState(createQueryClient);

  return (
    <div className={lineSeedSans.variable} style={{ display: 'contents' }}>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Q4X4YLKZY6"
        strategy="afterInteractive"
      />

      <Script id="ga-script" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Q4X4YLKZY6');
        `}
      </Script>

      <QueryClientProvider client={queryClient}>
        <PublicTempleInitialDataContext.Provider value={pageProps.publicTemple}>
          <MataData />
          <AuthProvider>
            <LocalizationProvider>
              <SettingsProvider
                defaultSettings={{
                  themeMode: 'light',
                  themeDirection: 'ltr',
                  themeContrast: 'default',
                  themeLayout: 'vertical',
                  themeColorPresets: 'default',
                  themeStretch: false,
                }}
              >
                <ThemeProvider>
                  <MotionLazy>
                    <SnackbarProvider>
                      <SettingsDrawer />
                      <ProgressBar />
                      <Component {...pageProps} />
                    </SnackbarProvider>
                  </MotionLazy>
                </ThemeProvider>
              </SettingsProvider>
            </LocalizationProvider>
          </AuthProvider>
        </PublicTempleInitialDataContext.Provider>
      </QueryClientProvider>
    </div>
  );
};

export default App;
