import { z } from 'zod';

import { optionalImageFileSchema } from './common';

import { PUBLIC_TEMPLATE_KEYS } from 'src/public-templates/catalog';

const COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const optionalCoordinate = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const coordinate = Number(value);
      return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max;
    }, `${label}ไม่ถูกต้อง`)
    .default('');

export const templeFormSchema = z
  .object({
    name: z.string().trim().min(1, 'กรุณากรอกชื่อวัด').max(200, 'ชื่อวัดยาวเกินไป'),
    nameEnglish: z.string().trim().max(200, 'ชื่อภาษาอังกฤษยาวเกินไป').default(''),
    address: z.string().trim().max(1000, 'สถานที่ตั้งยาวเกินไป').default(''),
    openingHours: z.string().trim().max(300, 'ช่วงเวลาทำการยาวเกินไป').default(''),
    email: z
      .string()
      .trim()
      .max(320, 'อีเมลยาวเกินไป')
      .refine((value) => !value || z.email().safeParse(value).success, 'รูปแบบอีเมลไม่ถูกต้อง')
      .default(''),
    mapLatitude: optionalCoordinate('ละติจูด', -90, 90),
    mapLongitude: optionalCoordinate('ลองจิจูด', -180, 180),
    slug: z
      .string()
      .trim()
      .min(1, 'กรุณากรอก slug')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'ใช้ตัวพิมพ์เล็ก ตัวเลข และขีดกลางเท่านั้น'),
    status: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']),
    primaryColor: z.string().regex(COLOR_PATTERN, 'รูปแบบสีไม่ถูกต้อง'),
    secondaryColor: z.string().regex(COLOR_PATTERN, 'รูปแบบสีไม่ถูกต้อง'),
    fontFamily: z.string().trim().max(120, 'ชื่อฟอนต์ยาวเกินไป').default(''),
    adminTemplate: z.string().trim().min(1),
    publicTemplate: z.enum(PUBLIC_TEMPLATE_KEYS, { message: 'กรุณาเลือก Public Template' }),
    faviconUrl: z.string().trim().max(2000, 'URL ยาวเกินไป').default(''),
    modules: z.array(z.string()).min(1, 'กรุณาเปิดอย่างน้อยหนึ่ง Module'),
    logoImage: optionalImageFileSchema.default(null),
    currentLogoUrl: z.string().default(''),
    loginBackgroundImage: optionalImageFileSchema.default(null),
    currentLoginBackgroundUrl: z.string().default(''),
    bankCode: z.string().trim().max(20, 'รหัสธนาคารไม่ถูกต้อง').default(''),
    bankAccountNumber: z.string().trim().max(80, 'เลขบัญชียาวเกินไป').default(''),
    bankAccountName: z.string().trim().max(200, 'ชื่อบัญชียาวเกินไป').default(''),
    bankQrImage: optionalImageFileSchema.default(null),
    currentBankQrUrl: z.string().default(''),
  })
  .superRefine((value, context) => {
    const hasDonationDetails = Boolean(
      value.bankCode || value.bankAccountNumber || value.bankAccountName || value.bankQrImage
    );
    if (!hasDonationDetails) return;

    if (!value.bankCode) {
      context.addIssue({ code: 'custom', path: ['bankCode'], message: 'กรุณาเลือกธนาคาร' });
    }
    if (!value.bankAccountNumber) {
      context.addIssue({
        code: 'custom',
        path: ['bankAccountNumber'],
        message: 'กรุณากรอกเลขที่บัญชี',
      });
    }
    if (!value.bankAccountName) {
      context.addIssue({
        code: 'custom',
        path: ['bankAccountName'],
        message: 'กรุณากรอกชื่อบัญชี',
      });
    }
  });

export type TempleFormValues = z.infer<typeof templeFormSchema>;

export const templeDomainFormSchema = z.object({
  domain: z.string().trim().min(3, 'กรุณากรอก Domain'),
  ownership: z.enum(['TEMPLE', 'PLATFORM']),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'FAILED']),
  registrar: z.string().trim().max(120).default(''),
  expiresAt: z.string().default(''),
  isPrimary: z.boolean().default(false),
});

export type TempleDomainFormValues = z.infer<typeof templeDomainFormSchema>;

export const templeMemberFormSchema = z.object({
  userId: z.string().min(1, 'กรุณาเลือกผู้ใช้งาน'),
  role: z.enum(['temple_admin', 'temple_editor']),
  modules: z.array(z.string()).min(1, 'กรุณาเลือกอย่างน้อยหนึ่ง Module'),
});

export type TempleMemberFormValues = z.infer<typeof templeMemberFormSchema>;

export const templeInvitationFormSchema = z.object({
  email: z.string().trim().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  role: z.enum(['temple_editor', 'temple_contributor']),
  modules: z.array(z.string()).min(1, 'กรุณาเลือกอย่างน้อยหนึ่ง Module'),
});

export type TempleInvitationFormValues = z.infer<typeof templeInvitationFormSchema>;
