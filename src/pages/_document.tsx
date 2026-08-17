import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => {
  return (
    <Html lang="th">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="stylesheet" href="/fonts/index.css" />
        <link rel="stylesheet" href="/fonts/kanit/index.css" />
        <link
          rel="preload"
          href="/fonts/LINESeedSansTH-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/LINESeedSansTH-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/LINESeedSansTH-Heavy.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/LINESeedSansTH-Thin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
