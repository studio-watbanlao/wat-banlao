import { z } from 'zod';

import { imageFileSchema, optionalImageFileSchema, requireImage, statusSchema } from './common';

export const sacredFormSchema = z
  .object({
    title: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(200, 'ชื่อยาวเกินไป'),
    year: z.string().trim().max(20, 'ปียาวเกินไป').default(''),
    description: z.string().trim().max(2000, 'คำอธิบายยาวเกินไป').default(''),
    content: z.string().default(''),
    status: statusSchema,
    coverImage: optionalImageFileSchema.default(null),
    currentImageUrl: z.string().default(''),
    galleryImages: z.array(imageFileSchema).max(8, 'อัปโหลดรูป Gallery ได้สูงสุด 8 รูป').default([]),
  })
  .superRefine((data, ctx) => requireImage(data, ctx));

export type SacredFormValues = z.infer<typeof sacredFormSchema>;
