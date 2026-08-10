import { getErrorMessage, getStatusErrorMessage } from 'src/utils/error-message';

export const getSafeApiError = (error: unknown, fallback = 'Request failed.') => {
  const statusValue =
    error && typeof error === 'object' && 'status' in error ? Number(error.status) : 500;
  const status = statusValue >= 400 && statusValue < 600 ? statusValue : 500;
  const errorName =
    error && typeof error === 'object' && 'name' in error ? String(error.name) : '';
  const rawMessage =
    error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  const isInternalServiceError =
    errorName === 'SupabaseRequestError' || /Supabase request failed|PGRST\d+/i.test(rawMessage);

  return {
    status,
    message:
      status >= 500 || isInternalServiceError
        ? getStatusErrorMessage(status, fallback)
        : getErrorMessage(error, getStatusErrorMessage(status, fallback), status),
  };
};
