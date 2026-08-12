import { z } from 'zod';

import { optionalImageFileSchema } from './common';

export const templePageFormSchema = z.object({
  title: z.string().trim().min(1, 'กรุณากรอกชื่อหน้า').max(200),
  pageKey: z.string().trim().min(1).regex(/^[a-z0-9-]+$/, 'ใช้ตัวพิมพ์เล็ก ตัวเลข และขีดกลาง'),
  slug: z
    .string()
    .trim()
    .min(1, 'กรุณากรอก URL slug')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/, 'รูปแบบ slug ไม่ถูกต้อง'),
  pageType: z.enum(['SYSTEM', 'CUSTOM']),
  templateKey: z.enum(['default', 'landing', 'biography']),
  eyebrow: z.string().trim().max(120).default(''),
  excerpt: z.string().trim().max(500).default(''),
  content: z.string().default(''),
  status: z.enum(['DRAFT', 'PUBLIC', 'ARCHIVED']),
  showInMenu: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  seoTitle: z.string().trim().max(200).default(''),
  seoDescription: z.string().trim().max(500).default(''),
  heroImage: optionalImageFileSchema.default(null),
  currentHeroImageUrl: z.string().default(''),
});

export type TemplePageFormValues = z.infer<typeof templePageFormSchema>;
