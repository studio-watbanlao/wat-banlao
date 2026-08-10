import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => {
  return (
    <Html lang="th">
      <Head>
        <title>วัดบ้านเหล่า - สุขธัมมาราม</title>
        <meta charSet="utf-8" />
        <link
          rel="icon"
          href="https://res.cloudinary.com/dkdbilwtj/image/upload/v1677241558/%E0%B9%82%E0%B8%A5%E0%B9%82%E0%B8%81%E0%B9%89%E0%B8%A7%E0%B8%B1%E0%B8%94_2x_cywhb2.png"
        />
        {/* <meta
          property="og:image"
          content="https://imagedelivery.net/EEuP_or275XVr8IHP_-n6Q/06be70c1-e5c2-4e43-d23d-878e656e4700/public"
        /> */}
        {/* <meta property="og:title" content="วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao)" /> */}
        {/* <meta
          property="og:description"
          content={
            'วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao) - หลวงปู่สาธุ์ สุขธัมโม วัดบ้านเหล่า ต.เม็กดำ อ.พยัคฆภูมิพิสัย จ.มหาสารคาม'
          }
        /> */}
        <meta
          name="description"
          content="วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao) - หลวงปู่สาธุ์ สุขธัมโม วัดบ้านเหล่า ต.เม็กดำ อ.พยัคฆภูมิพิสัย จ.มหาสารคาม"
        />
        <meta name="keywords" content="วัดบ้านเหล่า,จังหวัดมหาสารคาม,ตำบลเม็กดำ,หลวงปู่สาธุ์" />
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
