import type { NavMainProps } from './main/nav/types';

import { paths } from 'src/routes/paths';
import {
  RiHome5Line,
  RiMapPinLine,
  RiArticleLine,
  RiCalendarLine,
  RiBuildingLine,
  RiUserStarLine,
} from 'src/components/remix-icon';

export const navData: NavMainProps['data'] = [
  { title: 'หน้าหลัก', path: '/', icon: <RiHome5Line size={22} /> },
  {
    title: 'เทศกาลงานบุญวัดบ้านเหล่า',
    path: paths.fastival.root,
    icon: <RiCalendarLine size={22} />,
  },
  {
    title: 'รู้จักวัดบ้านเหล่า',
    path: paths.banlao.root,
    icon: <RiBuildingLine size={22} />,
    children: [
      {
        subheader: '',
        items: [
          { title: 'ประวัติวัดบ้านเหล่า', path: paths.banlao.history },
          { title: 'สถาปัตย์และสิ่งสำคัญ', path: paths.banlao.architecture.root },
        ],
      },
    ],
  },
  {
    title: 'ชีวประวัติบูรพาจารย์',
    path: paths.parents.root,
    icon: <RiUserStarLine size={22} />,
    children: [
      {
        subheader: '',
        items: [
          { title: 'หลวงปู่สาธุ์ สุขธมฺโม', path: paths.parents.luangPuSa },
          { title: 'หลวงปู่ประมวล ญาณวโร', path: paths.parents.luangPuPramuan },
          { title: 'วัตถุมงคล', path: paths.parents.sacred.root },
        ],
      },
    ],
  },
  {
    title: 'บทความ/ธรรมะ',
    path: paths.article.root,
    icon: <RiArticleLine size={22} />,
    children: [
      {
        subheader: '',
        items: [
          { title: 'บทความ', path: paths.article.blog.root },
          { title: 'ธรรมะ', path: paths.article.dharma.root },
        ],
      },
    ],
  },
  { title: 'กิจกรรมต่าง ๆ', path: paths.activity.root, icon: <RiCalendarLine size={22} /> },
  { title: 'ติดต่อสอบถาม', path: paths.contact, icon: <RiMapPinLine size={22} /> },
];
