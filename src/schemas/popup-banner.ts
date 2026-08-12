import { z } from 'zod';

import { optionalImageFileSchema, statusSchema } from './common';

const optionalDateTime = z
  .string()
  .trim()
  .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), 'วันเวลาไม่ถูกต้อง')
  .default('');

export const popupBannerFormSchema = z
  .object({
    title: z.string().trim().min(1, 'กรุณากรอกชื่อ Popup Banner').max(200, 'ชื่อยาวเกินไป'),
    linkUrl: z.string().trim().max(2000, 'ลิงก์ยาวเกินไป').default(''),
    displayFrequency: z.enum(['EVERY_VISIT', 'ONCE_PER_SESSION', 'ONCE_PER_DAY']),
    startsAt: optionalDateTime,
    endsAt: optionalDateTime,
    sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
    status: statusSchema,
    image: optionalImageFileSchema.default(null),
    currentImageUrl: z.string().default(''),
  })
  .superRefine((data, context) => {
    if (!data.image && !data.currentImageUrl) {
      context.addIssue({
        code: 'custom',
        path: ['image'],
        message: 'กรุณาเลือกรูป Popup Banner',
      });
    }
    if (data.startsAt && data.endsAt && new Date(data.startsAt) > new Date(data.endsAt)) {
      context.addIssue({
        code: 'custom',
        path: ['endsAt'],
        message: 'วันสิ้นสุดต้องอยู่หลังวันเริ่มต้น',
      });
    }
  });

export type PopupBannerFormValues = z.infer<typeof popupBannerFormSchema>;
