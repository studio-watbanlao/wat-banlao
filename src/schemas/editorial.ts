import { z } from 'zod';

import { optionalImageFileSchema, requireImage, statusSchema } from './common';

export const editorialFormSchema = z
  .object({
    title: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(200, 'ชื่อยาวเกินไป'),
    description: z.string().trim().max(1000, 'คำอธิบายยาวเกินไป').default(''),
    content: z.string().default(''),
    author: z.string().trim().max(120, 'ชื่อผู้เขียนยาวเกินไป').default(''),
    createdDate: z.string().default(''),
    status: statusSchema,
    coverImage: optionalImageFileSchema.default(null),
    currentImageUrl: z.string().default(''),
  })
  .superRefine((data, ctx) => requireImage(data, ctx));

export type EditorialFormValues = z.infer<typeof editorialFormSchema>;
