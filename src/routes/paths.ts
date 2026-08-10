import { _id, _postTitles } from 'src/_mock/assets';

const MOCK_ID = _id[1];

const MOCK_TITLE = _postTitles[2];

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  banlao: {
    root: `/banlao`,
    history: '/banlao/history',

    architecture: {
      root: `/banlao/architecture`,
      details: (id: string) => `/banlao/architecture/${id}`,
    },
  },

  parents: {
    root: '/parents',
    luangPuSa: '/parents/luang-pu-sa',
    luangPuPramuan: '/parents/luang-pu-pramuan',
    sacred: {
      root: `/parents/sacred`,
      details: (id: string) => `/parents/sacred/${id}`,
    },
  },

  activity: {
    root: `/activity`,
    details: (id: string) => `/activity/${id}`,
  },

  fastival: {
    root: `/fastival`,
    details: (id: string) => `/fastival/${id}`,
  },

  article: {
    root: `/article`,

    blog: {
      root: '/article/blog',
      details: (id: string) => `/article/blog/${id}`,
    },

    dharma: {
      root: '/article/dharma',
      details: (id: string) => `/article/dharma/${id}`,
    },
  },

  // comingSoon: '/coming-soon',
  about: '/about-us',
  contact: '/contact-us',
  // faqs: '/faqs',
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',
  // components: '/components',
  // docs: 'https://docs.minimals.cc',
  // changelog: 'https://docs.minimals.cc/changelog',
  // zoneUI: 'https://mui.com/store/items/zone-landing-page/',
  // minimalUI: 'https://mui.com/store/items/minimal-dashboard/',
  // freeUI: 'https://mui.com/store/items/minimal-dashboard-free/',
  // figma:
  //   'https://www.figma.com/file/hjxMnGUJCjY7pX8lQbS7kn/%5BPreview%5D-Minimal-Web.v5.4.0?type=design&node-id=0-1&mode=design&t=2fxnS70DuiTLGzND-0',

  auth: {
    amplify: {
      login: `${ROOTS.AUTH}/amplify/login`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      register: `${ROOTS.AUTH}/amplify/register`,
      newPassword: `${ROOTS.AUTH}/amplify/new-password`,
      forgotPassword: `${ROOTS.AUTH}/amplify/forgot-password`,
    },
    jwt: {
      login: `${ROOTS.AUTH}/jwt/login`,
      register: `${ROOTS.AUTH}/jwt/register`,
    },
    firebase: {
      login: `${ROOTS.AUTH}/firebase/login`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      register: `${ROOTS.AUTH}/firebase/register`,
      forgotPassword: `${ROOTS.AUTH}/firebase/forgot-password`,
    },
    auth0: {
      login: `${ROOTS.AUTH}/auth0/login`,
    },
  },
  authDemo: {
    classic: {
      login: `${ROOTS.AUTH_DEMO}/classic/login`,
      register: `${ROOTS.AUTH_DEMO}/classic/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/classic/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/classic/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/classic/verify`,
    },
    modern: {
      login: `${ROOTS.AUTH_DEMO}/modern/login`,
      register: `${ROOTS.AUTH_DEMO}/modern/register`,
      forgotPassword: `${ROOTS.AUTH_DEMO}/modern/forgot-password`,
      newPassword: `${ROOTS.AUTH_DEMO}/modern/new-password`,
      verify: `${ROOTS.AUTH_DEMO}/modern/verify`,
    },
  },
  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    activity: `${ROOTS.DASHBOARD}/activity`,
    manageSacred: `${ROOTS.DASHBOARD}/manage-sacred`,
  },
};
