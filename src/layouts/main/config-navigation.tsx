import { paths } from 'src/routes/paths';

import Iconify from 'src/components/iconify';

export const navConfig = [
  {
    title: 'หน้าหลัก',
    icon: <Iconify icon="solar:home-2-bold-duotone" />,
    path: '/',
    roles: ['user', 'admin'],
  },
  {
    title: 'เทศกาลงานบุญวัดบ้านเหล่า',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: '/fastival',
    roles: ['user', 'admin'],
  },
  {
    title: 'รู้จักวัดบ้านเหล่า',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: paths.banlao.root,
    roles: ['user', 'admin'],
    children: [
      {
        subheader: '',
        items: [
          {
            title: 'ประวัติวัดบ้านเหล่า',
            path: paths.banlao.history,
            roles: ['user', 'admin'],
          },
          {
            title: 'สถาปัตย์และสิ่งสำคัญ',
            path: paths.banlao.architecture.root,
            roles: ['user', 'admin'],
          },
        ],
      },
    ],
  },
  {
    title: 'ชีวประวัติบูรพาจารย์',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: paths.parents.root,
    roles: ['user', 'admin'],
    children: [
      {
        subheader: '',
        items: [
          {
            title: 'หลวงปู่สาธุ์ สุขธมฺโม',
            path: paths.parents.luangPuSa,
            roles: ['user', 'admin'],
          },
          {
            title: 'หลวงปู่ประมวล ญาณวโร',
            path: paths.parents.luangPuPramuan,
            roles: ['user', 'admin'],
          },
          { title: 'วัตถุมงคล', path: paths.parents.sacred.root, roles: ['user', 'admin'] },
        ],
      },
    ],
  },
  {
    title: 'บทความ/ธรรมะ',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: paths.article.root,
    roles: ['user', 'admin'],
    children: [
      {
        subheader: '',
        items: [
          {
            title: 'บทความ',
            path: paths.article.blog.root,
            roles: ['user', 'admin'],
          },
          {
            title: 'ธรรมะ',
            path: paths.article.dharma.root,
            roles: ['user', 'admin'],
          },
        ],
      },
    ],
  },
  {
    title: 'กิจกรรมต่าง ๆ',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: paths.activity.root,
    roles: ['user', 'admin'],
  },
  {
    title: 'ติดต่อสอบถาม',
    icon: <Iconify icon="solar:atom-bold-duotone" />,
    path: paths.contact,
    roles: ['user', 'admin'],
  },
];
