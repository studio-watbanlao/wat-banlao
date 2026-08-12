import { z } from 'zod';

export const profileFormSchema = z.object({
  displayName: z.string().trim().min(1, 'กรุณากรอกชื่อที่แสดง').max(120, 'ชื่อยาวเกินไป'),
  penName: z.string().trim().max(120, 'นามปากกายาวเกินไป').default(''),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
