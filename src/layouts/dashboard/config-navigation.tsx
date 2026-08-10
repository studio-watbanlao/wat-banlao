import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import SvgColor from 'src/components/svg-color';

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const ICONS = {
  job: icon('ic_job'),
  blog: icon('ic_blog'),
  chat: icon('ic_chat'),
  mail: icon('ic_mail'),
  user: icon('ic_user'),
  file: icon('ic_file'),
  lock: icon('ic_lock'),
  tour: icon('ic_tour'),
  order: icon('ic_order'),
  label: icon('ic_label'),
  blank: icon('ic_blank'),
  kanban: icon('ic_kanban'),
  folder: icon('ic_folder'),
  banking: icon('ic_banking'),
  booking: icon('ic_booking'),
  invoice: icon('ic_invoice'),
  product: icon('ic_product'),
  calendar: icon('ic_calendar'),
  disabled: icon('ic_disabled'),
  external: icon('ic_external'),
  menuItem: icon('ic_menu_item'),
  ecommerce: icon('ic_ecommerce'),
  analytics: icon('ic_analytics'),
  dashboard: icon('ic_dashboard'),
};

export const useNavData = () => {
  const data = useMemo(
    () => [
      {
        subheader: 'ภาพรวม',
        items: [
          {
            title: 'หน้าหลัก',
            path: paths.dashboard.root,
            icon: ICONS.dashboard,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการกิจกรรม',
            path: paths.dashboard.activity,
            icon: ICONS.ecommerce,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการสถาปัตย์และสิ่งสำคัญ',
            path: paths.dashboard.architectures,
            icon: ICONS.booking,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการแบนเนอร์',
            path: paths.dashboard.banners,
            icon: ICONS.file,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการงานประเพณี',
            path: paths.dashboard.festivals,
            icon: ICONS.calendar,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการบทความ',
            path: paths.dashboard.blogs,
            icon: ICONS.blog,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการธรรมะ',
            path: paths.dashboard.dharmas,
            icon: ICONS.menuItem,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการข้อความติดต่อ',
            path: paths.dashboard.contacts,
            icon: ICONS.mail,
            roles: ['admin', 'super_admin'],
          },
          // {
          //   title: t("product"),
          //   path: "/",
          //   icon: ICONS.product,
          //   children: [
          //     { title: t("list"), path: "/" },
          //     {
          //       title: t("details"),
          //       path: "/",
          //     },
          //   ],
          // },
          {
            title: 'จัดการสิ่งศักดิ์สิทธิ์',
            path: paths.dashboard.manageSacred,
            icon: ICONS.folder,
            roles: ['admin', 'super_admin'],
          },
          {
            title: 'จัดการผู้ใช้งาน',
            path: paths.dashboard.users,
            icon: ICONS.user,
            roles: ['super_admin'],
          },
          // {
          //   title: t("mail"),
          //   path: "/",
          //   icon: ICONS.mail,
          //   info: <Label color="error">+32</Label>,
          // },
        ],
      },
    ],
    []
  );

  return data;
};
