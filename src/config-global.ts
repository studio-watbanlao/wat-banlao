import { paths } from 'src/routes/paths';

// API
// ----------------------------------------------------------------------

export const HOST_API = process.env.NEXT_PUBLIC_HOST_API;
export const ASSETS_API = process.env.NEXT_PUBLIC_ASSETS_API;

export const FIREBASE_API = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APPID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const AMPLIFY_API = {
  userPoolId: process.env.NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_ID,
  userPoolWebClientId: process.env.NEXT_PUBLIC_AWS_AMPLIFY_USER_POOL_WEB_CLIENT_ID,
  region: process.env.NEXT_PUBLIC_AWS_AMPLIFY_REGION,
};

export const AUTH0_API = {
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
  callbackUrl: process.env.NEXT_PUBLIC_AUTH0_CALLBACK_URL,
};

export const MAPBOX_API = process.env.NEXT_PUBLIC_MAPBOX_API;

// ROOT PATH AFTER LOGIN SUCCESSFUL
export const PATH_AFTER_LOGIN = paths.dashboard.root; // as '/dashboard'

//
export const CONFIG = {
  image: 'https://lh3.googleusercontent.com/d/',
  websiteUrl: 'https://www.watbanlao.org',
  activity: { sheet_id: '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs', sheet_name: 'activity' },
  banner: { sheet_id: '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs', sheet_name: 'banner' },
  blog: { sheet_id: '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs', sheet_name: 'blog' },
  fastival: { sheet_id: '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs', sheet_name: 'fastival' },
  sacred: { sheet_id: '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs', sheet_name: 'sacred' },
  architecture: {
    sheet_id: '1FHH9HvMVDTvj7uSTs3RArzmKFA7TZKzHRI5sPG8Fzqs',
    sheet_name: 'architecture',
  },
  emailjs: {
    puclicKey: 'IliaKH3QDLgw_-l30',
    serviceKey: 'service_kw96412',
    templateKey: 'template_35i8lzf',
  },
  layout: {
    HEIGHT_LAYOUT: 8,
    HEIGHT_LAYOUT_XS: 6,
  },
};
