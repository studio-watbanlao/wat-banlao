import Head from 'next/head';
import React from 'react';

type MataDataProps = {
  url?: string;
  data?: {
    title: string;
    description?: string;
    imageUrl?: string;
  };
};

const MataData: React.FC<MataDataProps> = ({ data, url }) => {
  return (
    <>
      <Head>
        <title>{data?.title || 'วัดบ้านเหล่า - สุขธัมมาราม'}</title>
        <meta charSet="utf-8" />
        <meta property="og:url" content={url} />
        <meta
          name="description"
          content={
            data?.description ||
            'วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao) - หลวงปู่สาธุ์ สุขธัมโม วัดบ้านเหล่า ต.เม็กดำ อ.พยัคฆภูมิพิสัย จ.มหาสารคาม'
          }
        />
        <meta property="og:title" content={data?.title || 'วัดบ้านเหล่า - สุขธัมมาราม'} />
        <meta
          property="og:description"
          content={
            data?.description ||
            'วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao) - หลวงปู่สาธุ์ สุขธัมโม วัดบ้านเหล่า ต.เม็กดำ อ.พยัคฆภูมิพิสัย จ.มหาสารคาม'
          }
        />
        <meta
          property="og:image"
          content={
            data?.imageUrl ||
            'https://imagedelivery.net/EEuP_or275XVr8IHP_-n6Q/06be70c1-e5c2-4e43-d23d-878e656e4700/public'
          }
        />
        <meta
          name="keywords"
          content="วัดบ้านเหล่า, จังหวัดมหาสารคาม, ตำบลเม็กดำ, หลวงปู่สาธุ์, watbanlao"
        />
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      </Head>

      <main style={{ display: 'none' }}>
        <h1>{data?.title || 'วัดบ้านเหล่า - สุขธัมมาราม'}</h1>
        <h2>
          {data?.description ||
            'วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao) - หลวงปู่สาธุ์ สุขธัมโม วัดบ้านเหล่า ต.เม็กดำ อ.พยัคฆภูมิพิสัย จ.มหาสารคาม'}
        </h2>
        <p>
          {data?.description ||
            'วัดบ้านเหล่า - สุขธัมมาราม (Wat Banlao) - หลวงปู่สาธุ์ สุขธัมโม วัดบ้านเหล่า ต.เม็กดำ อ.พยัคฆภูมิพิสัย จ.มหาสารคาม'}
        </p>
      </main>
    </>
  );
};

export default MataData;
