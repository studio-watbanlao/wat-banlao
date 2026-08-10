import { getErrorMessage, getStatusErrorMessage } from 'src/utils/error-message';

export const getSafeApiError = (error: unknown, fallback = 'Request failed.') => {
  const statusValue =
    error && typeof error === 'object' && 'status' in error ? Number(error.status) : 500;
  const status = statusValue >= 400 && statusValue < 600 ? statusValue : 500;

  return {
    status,
    message:
      status >= 500
        ? getStatusErrorMessage(status, fallback)
        : getErrorMessage(error, getStatusErrorMessage(status, fallback), status),
  };
};
