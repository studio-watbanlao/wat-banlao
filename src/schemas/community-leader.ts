import { z } from 'zod';

import { optionalImageFileSchema, requireImage, statusSchema } from './common';
import { COMMUNITY_LEADER_GROUPS, COMMUNITY_VILLAGES } from 'src/types/community-leader';

const villageKeys = COMMUNITY_VILLAGES.map((item) => item.key) as [string, ...string[]];
const leaderGroups = COMMUNITY_LEADER_GROUPS.map((item) => item.value) as [string, ...string[]];

export const communityLeaderFormSchema = z
  .object({
    villageKey: z.enum(villageKeys, { message: 'กรุณาเลือกหมู่บ้าน' }),
    fullName: z.string().trim().min(1, 'กรุณากรอกชื่อผู้นำ').max(200, 'ชื่อยาวเกินไป'),
    role: z.string().trim().min(1, 'กรุณากรอกตำแหน่ง').max(200, 'ตำแหน่งยาวเกินไป'),
    responsibility: z.string().trim().max(1000, 'รายละเอียดหน้าที่ยาวเกินไป').default(''),
    phone: z.string().trim().max(30, 'เบอร์โทรศัพท์ยาวเกินไป').default(''),
    group: z.enum(leaderGroups, { message: 'กรุณาเลือกประเภทตำแหน่ง' }),
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
      'กรุณาเลือกรูปผู้นำ'
    )
  );

export type CommunityLeaderFormValues = z.infer<typeof communityLeaderFormSchema>;
