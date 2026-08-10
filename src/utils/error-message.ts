const DEFAULT_ERROR_MESSAGE = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';

const STATUS_MESSAGES: Record<number, string> = {
  400: 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  401: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่',
  403: 'บัญชีนี้ไม่มีสิทธิ์ดำเนินการ',
  404: 'ไม่พบข้อมูลหรือบริการที่ร้องขอ',
  405: 'ระบบไม่รองรับคำสั่งนี้',
  408: 'การเชื่อมต่อใช้เวลานานเกินไป กรุณาลองใหม่',
  409: 'ข้อมูลนี้มีอยู่แล้วหรือเกิดความขัดแย้ง',
  413: 'ไฟล์มีขนาดใหญ่เกินกว่าที่ระบบรองรับ',
  422: 'ข้อมูลไม่ครบถ้วนหรือรูปแบบไม่ถูกต้อง',
  429: 'มีการใช้งานถี่เกินไป กรุณารอสักครู่',
  500: 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่ภายหลัง',
  502: 'ไม่สามารถเชื่อมต่อบริการภายนอกได้',
  503: 'ระบบยังไม่พร้อมให้บริการ กรุณาลองใหม่ภายหลัง',
  504: 'บริการใช้เวลาตอบกลับนานเกินไป',
};

const looksLikeHtml = (value: string) =>
  /<!doctype\s+html|<html|<head|<body|data-next-hide-fouc/i.test(value);

const cleanMessage = (value: string) =>
  value.replace(/\s+/g, ' ').replace(/[<>]/g, '').trim().slice(0, 300);

const extractMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  if (!error || typeof error !== 'object') return '';
  if ('message' in error && typeof error.message === 'string') return error.message;
  if ('error_description' in error && typeof error.error_description === 'string')
    return error.error_description;
  if ('error' in error && typeof error.error === 'string') return error.error;
  return '';
};

export const getErrorMessage = (
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
  status?: number
) => {
  const rawMessage = extractMessage(error);
  if (!rawMessage || looksLikeHtml(rawMessage)) return STATUS_MESSAGES[status || 0] || fallback;
  return cleanMessage(rawMessage) || STATUS_MESSAGES[status || 0] || fallback;
};

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const getStatusErrorMessage = (status?: number, fallback = DEFAULT_ERROR_MESSAGE) =>
  STATUS_MESSAGES[status || 0] || fallback;
