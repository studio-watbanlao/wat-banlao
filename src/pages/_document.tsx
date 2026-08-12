import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => {
  return (
    <Html lang="th">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
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
