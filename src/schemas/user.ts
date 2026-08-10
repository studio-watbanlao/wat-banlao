import { z } from 'zod';

export const createUserFormSchema = z.object({
  email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  role: z.enum(['user', 'admin']),
});

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;

export const changeRoleFormSchema = z.object({
  role: z.enum(['user', 'admin']),
});

export type ChangeRoleFormValues = z.infer<typeof changeRoleFormSchema>;
