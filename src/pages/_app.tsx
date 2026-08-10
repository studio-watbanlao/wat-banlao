import 'src/global.css';
import 'src/locales/i18n';

import Script from 'next/script';

import { LocalizationProvider } from 'src/locales';
import ThemeProvider from 'src/theme';

import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from 'src/auth/context/jwt';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import ProgressBar from 'src/components/progress-bar';
import { SettingsDrawer, SettingsProvider } from 'src/components/settings';
import SnackbarProvider from 'src/components/snackbar/snackbar-provider';

import type { AppProps } from 'next/app';
import queryClient from 'src/queries/client';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
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
      </QueryClientProvider>
    </>
  );
};

export default App;
