import { z } from 'zod';

import { imageFileSchema, optionalImageFileSchema, requireImage, statusSchema } from './common';

export const festivalFormSchema = z
  .object({
    title: z.string().trim().min(1, 'กรุณากรอกชื่อ Festival').max(200, 'ชื่อยาวเกินไป'),
    year: z.string().trim().min(1, 'กรุณากรอกปี').max(20, 'ปียาวเกินไป'),
    no: z.string().trim().max(50, 'ครั้งที่ยาวเกินไป').default(''),
    description: z.string().trim().max(2000, 'คำอธิบายยาวเกินไป').default(''),
    content: z.string().default(''),
    videoUrl: z.string().trim().max(2000, 'ลิงก์ยาวเกินไป').default(''),
    openingUrl: z.string().trim().max(2000, 'ลิงก์ยาวเกินไป').default(''),
    logoUrl: z.string().trim().max(2000, 'ลิงก์ยาวเกินไป').default(''),
    status: statusSchema,
    coverImage: optionalImageFileSchema.default(null),
    currentImageUrl: z.string().default(''),
    galleryImages: z.array(imageFileSchema).max(8, 'อัปโหลดรูป Gallery ได้สูงสุด 8 รูป').default([]),
  })
  .superRefine((data, ctx) => requireImage(data, ctx));

export type FestivalFormValues = z.infer<typeof festivalFormSchema>;
