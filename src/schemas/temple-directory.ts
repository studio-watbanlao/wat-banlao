import { z } from 'zod';

import { optionalImageFileSchema, requireImage, statusSchema } from './common';

import { TEMPLE_DIRECTORY_ENTRY_TYPES } from 'src/types/temple-directory';

const optionalText = (maximum = 10000) =>
  z.string().trim().max(maximum, 'ข้อความยาวเกินกำหนด').default('');

export const templeDirectoryFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(200, 'ชื่อยาวเกินไป'),
    displayTitle: optionalText(200),
    entryType: z.enum(TEMPLE_DIRECTORY_ENTRY_TYPES.map((item) => item.value)),
    termStart: optionalText(100),
    termEnd: optionalText(100),
    birth: optionalText(200),
    age: optionalText(100),
    ordination: optionalText(200),
    vassa: optionalText(100),
    templeName: optionalText(300),
    province: optionalText(200),
    affiliation: optionalText(300),
    education: optionalText(),
    honoraryAwards: optionalText(),
    administrativePositions: optionalText(),
    monasticRank: optionalText(),
    biography: optionalText(50000),
    sources: optionalText(30000),
    sortOrder: z.coerce.number().int().min(0, 'ลำดับต้องไม่ต่ำกว่า 0').max(9999),
    status: statusSchema,
    profileImage: optionalImageFileSchema.default(null),
    currentImageUrl: z.string().default(''),
  })
  .superRefine((data, ctx) =>
    requireImage(
      { coverImage: data.profileImage, currentImageUrl: data.currentImageUrl },
      ctx,
      'profileImage',
      'กรุณาเลือกรูปประจำตัว'
    )
  );

export type TempleDirectoryFormValues = z.infer<typeof templeDirectoryFormSchema>;
