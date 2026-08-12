import { z } from 'zod';

import { optionalImageFileSchema, statusSchema } from './common';

export const bannerFormSchema = z
  .object({
    title: z.string().trim().min(1, 'กรุณากรอกชื่อ Banner').max(200, 'ชื่อยาวเกินไป'),
    linkUrl: z.string().trim().max(2000, 'ลิงก์ยาวเกินไป').default(''),
    sortOrder: z.coerce.number().int('ลำดับต้องเป็นจำนวนเต็ม').default(0),
    status: statusSchema,
    desktopImage: optionalImageFileSchema.default(null),
    mobileImage: optionalImageFileSchema.default(null),
    currentDesktopUrl: z.string().default(''),
    currentMobileUrl: z.string().default(''),
  })
  .superRefine((data, ctx) => {
    if (!data.desktopImage && !data.currentDesktopUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['desktopImage'],
        message: 'กรุณาเลือกรูป Desktop',
      });
    }
  });

export type BannerFormValues = z.infer<typeof bannerFormSchema>;
