import type { NavSectionProps } from 'src/components/nav-section';
import { paths } from 'src/routes/paths';
import {
  RiTeamLine,
  RiMailLine,
  RiArticleLine,
  RiImageLine,
  RiCalendarLine,
  RiDashboardLine,
  RiBuildingLine,
  RiShieldStarLine,
} from 'src/components/remix-icon';

export const navData: NavSectionProps['data'] = [
  {
    subheader: 'ภาพรวม',
    items: [
      { title: 'หน้าหลัก', path: paths.dashboard.root, icon: <RiDashboardLine /> },
      { title: 'จัดการกิจกรรม', path: paths.dashboard.activity, icon: <RiCalendarLine /> },
      {
        title: 'จัดการสถาปัตย์และสิ่งสำคัญ',
        path: paths.dashboard.architectures,
        icon: <RiBuildingLine />,
      },
      { title: 'จัดการแบนเนอร์', path: paths.dashboard.banners, icon: <RiImageLine /> },
      { title: 'จัดการงานประเพณี', path: paths.dashboard.festivals, icon: <RiCalendarLine /> },
      { title: 'จัดการบทความ', path: paths.dashboard.blogs, icon: <RiArticleLine /> },
      { title: 'จัดการธรรมะ', path: paths.dashboard.dharmas, icon: <RiArticleLine /> },
      { title: 'จัดการข้อความติดต่อ', path: paths.dashboard.contacts, icon: <RiMailLine /> },
      {
        title: 'จัดการสิ่งศักดิ์สิทธิ์',
        path: paths.dashboard.manageSacred,
        icon: <RiShieldStarLine />,
      },
      {
        title: 'จัดการผู้ใช้งาน',
        path: paths.dashboard.users,
        icon: <RiTeamLine />,
        roles: ['super_admin'],
      },
    ],
  },
];
