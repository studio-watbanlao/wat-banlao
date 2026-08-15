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
    abbot: '/banlao/abbot',
    monks: '/banlao/monks',

    architecture: {
      root: `/banlao/architecture`,
      details: (id: string) => `/banlao/architecture/${id}`,
    },
  },

  community: {
    root: `/community`,
    communityHistory: '/community/community-history',
    communityLeaders: '/community/community-leaders',
    school: '/community/school',
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
  components: '/components',
  docs: '/docs',
  legal: {
    privacyPolicy: '/privacy-policy',
    serviceAgreement: '/service-agreement',
    termsOfService: '/terms-of-service',
  },
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
      login: `${ROOTS.AUTH}/login`,
      signIn: `${ROOTS.AUTH}/login`,
      register: `${ROOTS.AUTH}/register`,
      changePassword: `${ROOTS.AUTH}/change-password`,
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
    profile: `${ROOTS.DASHBOARD}/profile`,
    temples: `${ROOTS.DASHBOARD}/temples`,
    templeNew: `${ROOTS.DASHBOARD}/temples/new`,
    templeEdit: (id: string) => `${ROOTS.DASHBOARD}/temples/${id}/edit`,
    pages: `${ROOTS.DASHBOARD}/pages`,
    menus: `${ROOTS.DASHBOARD}/menus`,
    pageNew: `${ROOTS.DASHBOARD}/pages/new`,
    pageEdit: (id: string) => `${ROOTS.DASHBOARD}/pages/${id}/edit`,
    activity: `${ROOTS.DASHBOARD}/activity`,
    activityNew: `${ROOTS.DASHBOARD}/activity/new`,
    activityEdit: (id: string) => `${ROOTS.DASHBOARD}/activity/${id}/edit`,
    architectures: `${ROOTS.DASHBOARD}/architectures`,
    architectureNew: `${ROOTS.DASHBOARD}/architectures/new`,
    architectureEdit: (id: string) => `${ROOTS.DASHBOARD}/architectures/${id}/edit`,
    directory: `${ROOTS.DASHBOARD}/directory`,
    directoryNew: `${ROOTS.DASHBOARD}/directory/new`,
    directoryEdit: (id: string) => `${ROOTS.DASHBOARD}/directory/${id}/edit`,
    communityLeaders: `${ROOTS.DASHBOARD}/community-leaders`,
    communityLeaderNew: `${ROOTS.DASHBOARD}/community-leaders/new`,
    communityLeaderEdit: (id: string) => `${ROOTS.DASHBOARD}/community-leaders/${id}/edit`,
    banners: `${ROOTS.DASHBOARD}/banners`,
    popupBanners: `${ROOTS.DASHBOARD}/popup-banners`,
    popupBannerNew: `${ROOTS.DASHBOARD}/popup-banners/new`,
    popupBannerEdit: (id: string) => `${ROOTS.DASHBOARD}/popup-banners/${id}/edit`,
    bannerNew: `${ROOTS.DASHBOARD}/banners/new`,
    bannerEdit: (id: string) => `${ROOTS.DASHBOARD}/banners/${id}/edit`,
    blogs: `${ROOTS.DASHBOARD}/blogs`,
    blogNew: `${ROOTS.DASHBOARD}/blogs/new`,
    blogEdit: (id: string) => `${ROOTS.DASHBOARD}/blogs/${id}/edit`,
    contacts: `${ROOTS.DASHBOARD}/contacts`,
    dharmas: `${ROOTS.DASHBOARD}/dharmas`,
    dharmaNew: `${ROOTS.DASHBOARD}/dharmas/new`,
    dharmaEdit: (id: string) => `${ROOTS.DASHBOARD}/dharmas/${id}/edit`,
    festivals: `${ROOTS.DASHBOARD}/festivals`,
    festivalNew: `${ROOTS.DASHBOARD}/festivals/new`,
    festivalEdit: (id: string) => `${ROOTS.DASHBOARD}/festivals/${id}/edit`,
    manageSacred: `${ROOTS.DASHBOARD}/manage-sacred`,
    sacredNew: `${ROOTS.DASHBOARD}/manage-sacred/new`,
    sacredEdit: (id: string) => `${ROOTS.DASHBOARD}/manage-sacred/${id}/edit`,
    users: `${ROOTS.DASHBOARD}/users`,
    members: `${ROOTS.DASHBOARD}/members`,
  },
};
