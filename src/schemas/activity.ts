import { z } from 'zod';

import { imageFileSchema, optionalImageFileSchema, requireImage, statusSchema } from './common';

export const activityFormSchema = z
  .object({
    title: z.string().trim().min(1, 'กรุณากรอกชื่อกิจกรรม').max(200, 'ชื่อยาวเกินไป'),
    contentType: z.enum(['activity', 'news']),
    type: z.enum(['temple', 'community', 'school']),
    description: z.string().trim().max(2000, 'คำอธิบายยาวเกินไป').default(''),
    content: z.string().default(''),
    status: statusSchema,
    coverImage: optionalImageFileSchema.default(null),
    currentImageUrl: z.string().default(''),
    galleryImages: z
      .array(imageFileSchema)
      .max(8, 'อัปโหลดรูป Gallery ได้สูงสุด 8 รูป')
      .default([]),
  })
  .superRefine((data, ctx) => requireImage(data, ctx));

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
