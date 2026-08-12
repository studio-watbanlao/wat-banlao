import axios, { AxiosRequestConfig } from 'axios';

import { HOST_API } from 'src/config-global';
import { getPublicPreviewTempleId, isPublicTenantRequest } from './public-tenant';
import { ApiClientError, getErrorMessage, getStatusErrorMessage } from './error-message';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: HOST_API });

axiosInstance.interceptors.request.use((config) => {
  const templeId = getPublicPreviewTempleId();

  if (templeId && isPublicTenantRequest(config.url)) {
    config.headers.set('x-temple-id', templeId);
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status as number | undefined;
    const responseData = error.response?.data;
    const contentType = String(error.response?.headers?.['content-type'] || '');
    const isHtmlResponse = contentType.includes('text/html');
    const message = isHtmlResponse
      ? getStatusErrorMessage(status)
      : getErrorMessage(responseData || error, undefined, status);

    return Promise.reject(new ApiClientError(message, status));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosInstance.get(url, { ...config });

  return res.data;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/auth/me',
    login: '/api/auth/login',
    googleToken: '/api/auth/google-token',
    logout: '/api/auth/logout',
    register: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
