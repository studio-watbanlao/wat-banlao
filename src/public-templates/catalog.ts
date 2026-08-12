export const PUBLIC_TEMPLATE_KEYS = ['custom', 'serene', 'template-1'] as const;

export type PublicTemplateKey = (typeof PUBLIC_TEMPLATE_KEYS)[number];

export type PublicTemplateDefinition = {
  key: PublicTemplateKey;
  name: string;
  description: string;
  features: string[];
  preview: {
    background: string;
    surface: string;
    accent: string;
    text: string;
  };
};

export type PublicTemplateStatus = 'DRAFT' | 'READY' | 'ARCHIVED';

export type ManagedPublicTemplate = Omit<PublicTemplateDefinition, 'key'> & {
  id: string;
  key: string;
  status: PublicTemplateStatus;
  codeAvailable: boolean;
  scaffoldPath: string;
};

export const PUBLIC_TEMPLATES: PublicTemplateDefinition[] = [
  {
    key: 'custom',
    name: 'บ้านเหล่า Classic',
    description: 'รูปแบบเดิมของวัดบ้านเหล่า เน้นข้อมูลครบถ้วนและเมนูสองระดับ',
    features: ['Header สองแถว', 'หน้าแรกเนื้อหาครบ', 'Footer แบบข้อมูลวัด'],
    preview: {
      background: '#FFFFFF',
      surface: '#F7F2EC',
      accent: '#6F4E37',
      text: '#34251D',
    },
  },
  {
    key: 'serene',
    name: 'Serene Temple',
    description: 'รูปแบบโปร่ง สงบ และร่วมสมัย เหมาะกับวัดที่ต้องการภาพลักษณ์เรียบหรู',
    features: ['Header แถวเดียว', 'Hero เต็มพื้นที่', 'Footer สีเข้ม'],
    preview: {
      background: '#F8F7F2',
      surface: '#FFFFFF',
      accent: '#9A6A32',
      text: '#25302B',
    },
  },
  {
    key: 'template-1',
    name: 'Temple Heritage',
    description: 'รูปแบบเข้มสง่างาม เน้นภาพ Hero ขนาดใหญ่ ลายเส้นสีทอง และเนื้อหาที่อ่านง่าย',
    features: ['Header โปร่งทับ Hero', 'Hero เต็มพื้นที่', 'Footer โทนเข้ม', 'รองรับหน้าคงที่'],
    preview: {
      background: '#10291F',
      surface: '#F7F0DF',
      accent: '#D6AD5C',
      text: '#FFF8E8',
    },
  },
];

export const DEFAULT_PUBLIC_TEMPLATE: PublicTemplateKey = 'custom';

export const isPublicTemplateKey = (value: unknown): value is PublicTemplateKey =>
  typeof value === 'string' && PUBLIC_TEMPLATE_KEYS.includes(value as PublicTemplateKey);

export const resolvePublicTemplateKey = (value: unknown): PublicTemplateKey =>
  isPublicTemplateKey(value) ? value : DEFAULT_PUBLIC_TEMPLATE;
