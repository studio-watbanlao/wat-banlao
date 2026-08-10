import axios from 'axios';
import { HOST_API_KEY } from 'src/utils/config-global';

const axiosAuthInstance = axios.create({
  baseURL: `${HOST_API_KEY}`,
});

axiosAuthInstance.interceptors.request.use(async (config) => {
  const accessToken = '';
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  config.headers['Accept'] = 'application/json';
  // config.headers["ngrok-skip-browser-warning"] = "any";
  return config;
});

const axiosPublicInstance = axios.create({ baseURL: HOST_API_KEY });

axiosPublicInstance.interceptors.request.use((config) => {
  config.headers['Accept'] = 'application/json';
  return config;
});

const axiosFileInstance = axios.create({ baseURL: '' });

axiosFileInstance.interceptors.request.use((config) => {
  const accessToken = 'YWRtaW46dnZEckhyM2kzdFBrYTA1ck1ncHpNeFRXeUpNR3Ri';
  if (accessToken) {
    config.headers['Authorization'] = `Basic ${accessToken}`;
  }
  config.headers['Accept'] = 'application/json';
  // config.headers["ngrok-skip-browser-warning"] = "any";
  return config;
});

export { axiosAuthInstance, axiosPublicInstance, axiosFileInstance };

export type AxiosResponseHelper<T> = {
  statusCode: string;
  data: T | null;
  message: string;
  title: string;
  stackTrace?: string;
};

export type AxiosResponseDataHelper<T> = {
  statusCode: string;
  message: string;
  data: {
    data: T | null;
  };
};

export const handleApiError = <T extends { message?: string }>(
  error: T,
  fallback = 'Something went wrong'
): string => {
  const message = error?.message || fallback;
  return message;
};
