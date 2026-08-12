import { z } from 'zod';

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const imageFileSchema = z
  .instanceof(File)
  .refine((file) => ALLOWED_IMAGE_TYPES.includes(file.type), 'รองรับเฉพาะไฟล์ JPG, PNG และ WebP')
  .refine((file) => file.size <= MAX_IMAGE_BYTES, 'รูปภาพต้องมีขนาดไม่เกิน 8 MB');

export const optionalImageFileSchema = imageFileSchema.nullable();

const FAVICON_IMAGE_TYPES = [...ALLOWED_IMAGE_TYPES, 'image/x-icon', 'image/vnd.microsoft.icon'];

export const optionalFaviconFileSchema = z
  .instanceof(File)
  .refine(
    (file) => FAVICON_IMAGE_TYPES.includes(file.type),
    'รองรับเฉพาะไฟล์ ICO, JPG, PNG และ WebP'
  )
  .refine((file) => file.size <= MAX_IMAGE_BYTES, 'รูปภาพต้องมีขนาดไม่เกิน 8 MB')
  .nullable();

export const statusSchema = z.enum(['PUBLIC', 'DRAFT']);

export const requireImage = (
  data: { coverImage?: File | null; currentImageUrl?: string },
  ctx: z.RefinementCtx,
  field = 'coverImage',
  message = 'กรุณาเลือกรูปหน้าปก'
) => {
  if (!data.coverImage && !data.currentImageUrl) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message });
  }
};
