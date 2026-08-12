import type { NavMainProps } from './main/nav/types';

import {
  RiArticleLine,
  RiBuildingLine,
  RiCalendarLine,
  RiHome5Line,
  RiUserStarLine,
} from 'src/components/remix-icon';
import { paths } from 'src/routes/paths';

export const navData: NavMainProps['data'] = [
  { title: 'หน้าหลัก', path: '/', icon: <RiHome5Line size={22} /> },
  {
    title: 'เทศกาลงานบุญวัดบ้านเหล่า',
    path: paths.fastival.root,
    icon: <RiCalendarLine size={22} />,
    deepMatch: true,
  },
  {
    title: 'รู้จักวัดบ้านเหล่า',
    path: paths.banlao.root,
    icon: <RiBuildingLine size={22} />,
    deepMatch: true,
    children: [
      {
        subheader: '',
        items: [
          { title: 'ประวัติวัดบ้านเหล่า', path: paths.banlao.history },
          { title: 'สถาปัตย์และสิ่งสำคัญ', path: paths.banlao.architecture.root },
          { title: 'เจ้าอาวาสวัดบ้านเหล่า', path: paths.banlao.abbot },
          { title: 'ทำเนียบพระสงฆ์', path: paths.banlao.monks },
        ],
      },
    ],
  },
  {
    title: 'ชีวประวัติบูรพาจารย์',
    path: paths.parents.root,
    icon: <RiUserStarLine size={22} />,
    deepMatch: true,
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
    deepMatch: true,
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
  {
    title: 'กิจกรรม และข่าวสาร',
    path: paths.activity.root,
    icon: <RiCalendarLine size={22} />,
    deepMatch: true,
  },
  {
    title: 'ชุมชนบ้านเหล่า',
    path: paths.community.root,
    icon: <RiBuildingLine size={22} />,
    deepMatch: true,
    children: [
      {
        subheader: '',
        items: [
          { title: 'ประวัติบ้านเหล่า', path: paths.community.communityHistory },
          { title: 'ผู้นำชุมชน', path: paths.community.communityLeaders },
          { title: 'โรงเรียนบ้านเหล่า', path: paths.community.school },
        ],
      },
    ],
  },
  // {
  //   title: 'ติดต่อสอบถาม',
  //   path: paths.contact,
  //   icon: <RiMapPinLine size={22} />,
  //   deepMatch: true,
  // },
];
