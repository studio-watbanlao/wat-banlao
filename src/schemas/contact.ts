import { z } from 'zod';

const CONTACT_STATUSES = ['NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'ARCHIVED'] as const;

export const contactPublicFormSchema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(120, 'ชื่อยาวเกินไป'),
  email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง').max(254),
  subject: z.string().trim().max(200, 'หัวข้อยาวเกินไป').default(''),
  message: z.string().trim().min(1, 'กรุณากรอกข้อความ').max(5000, 'ข้อความยาวเกินไป'),
  company: z.string().default(''),
});

export type ContactPublicFormValues = z.infer<typeof contactPublicFormSchema>;

export const contactAdminFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(120, 'ชื่อยาวเกินไป'),
  email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง').max(254),
  subject: z.string().trim().min(1, 'กรุณากรอกหัวข้อ').max(200, 'หัวข้อยาวเกินไป'),
  message: z.string().trim().min(1, 'กรุณากรอกข้อความ').max(5000, 'ข้อความยาวเกินไป'),
  status: z.enum(CONTACT_STATUSES),
  adminNote: z.string().trim().max(3000, 'บันทึกยาวเกินไป').default(''),
});

export type ContactAdminFormValues = z.infer<typeof contactAdminFormSchema>;
