'use client';

import type { IconButtonProps } from '@mui/material/IconButton';
import { useBoolean } from 'minimal-shared/hooks';
import { varAlpha } from 'minimal-shared/utils';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Typography from '@mui/material/Typography';

import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';

import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useTranslate } from 'src/locales';
import { Label } from 'src/components/label';
import {
  RiArrowRightSLine,
  RiBuildingLine,
  RiCloseLine,
  RiHome5Line,
  RiMenuLine,
  RiSettings3Line,
  RiShieldCheckLine,
  RiTeamLine,
  RiUser3Line,
} from 'src/components/remix-icon';
import { Scrollbar } from 'src/components/scrollbar';
import { useAuthContext } from 'src/auth/hooks';
import { useCurrentTempleAccess } from 'src/hooks/use-current-temple-access';


// ----------------------------------------------------------------------

export type AccountDrawerProps = IconButtonProps & {
  data?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
    info?: React.ReactNode;
  }[];
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'ผู้ดูแลระบบสูงสุด',
  temple_admin: 'ผู้ดูแลวัด',
  temple_editor: 'บรรณาธิการ',
  temple_contributor: 'ผู้เขียนเนื้อหา',
};

const ROOT_PATHS = [paths.dashboard.root];

export function AccountDrawer({ data = [], sx, ...other }: AccountDrawerProps) {
  const pathname = usePathname();
  const { t } = useTranslate('navbar');
  const { user } = useAuthContext();
  const templeAccess = useCurrentTempleAccess();
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const isSuperAdmin = user?.role === 'super_admin' || templeAccess?.role === 'super_admin';
  const isTempleAccount = Boolean(templeAccess) || isSuperAdmin;
  const isAdmin = isTempleAccount;
  const avatarUrl = user?.avatar_url ?? user?.photoURL;
  const displayName = user?.displayName || user?.username || t('ผู้ใช้งาน');
  const accountRole = isSuperAdmin ? 'super_admin' : templeAccess?.role || user?.role;
  const rawRoleLabel = ROLE_LABEL[accountRole] ?? 'ผู้ใช้งาน';
  const roleLabel = t(rawRoleLabel, { defaultValue: rawRoleLabel });

  const canReadTempleModule = (module: 'members' | 'pages' | 'branding') =>
    isSuperAdmin ||
    templeAccess?.role === 'temple_admin' ||
    templeAccess?.permissions[module]?.includes('read');

  const templeMenu: NonNullable<AccountDrawerProps['data']> = [
    {
      label: 'ภาพรวม',
      href: paths.dashboard.root,
      icon: <RiHome5Line />,
    },
    {
      label: 'โปรไฟล์ของฉัน',
      href: paths.dashboard.profile,
      icon: <RiUser3Line />,
    },
    ...(isSuperAdmin
      ? [
          {
            label: 'จัดการวัดและสิทธิ์',
            href: paths.dashboard.temples,
            icon: <RiBuildingLine />,
          },
          {
            label: 'จัดการผู้ใช้งาน',
            href: paths.dashboard.users,
            icon: <RiTeamLine />,
          },
        ]
      : []),
    ...(!isSuperAdmin && templeAccess?.temple && canReadTempleModule('branding')
      ? [
          {
            label: 'ข้อมูลและ Branding วัด',
            href: paths.dashboard.templeEdit(templeAccess.temple.id),
            icon: <RiSettings3Line />,
          },
        ]
      : []),
    ...(!isSuperAdmin && canReadTempleModule('members')
      ? [
          {
            label: 'สมาชิกวัด',
            href: paths.dashboard.members,
            icon: <RiTeamLine />,
          },
        ]
      : []),
    ...(!isSuperAdmin && canReadTempleModule('pages')
      ? [
          {
            label: 'จัดการเมนูเว็บ',
            href: paths.dashboard.menus,
            icon: <RiMenuLine />,
          },
        ]
      : []),
  ];

  const menuData = isTempleAccount ? templeMenu : data;

  return (
    <>
      <AccountButton
        onClick={onOpen}
        photoURL={avatarUrl}
        displayName={displayName}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        sx={(theme) => ({ zIndex: theme.zIndex.drawer + 2 })}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: (theme) => varAlpha(theme.vars.palette.grey['900Channel'], 0.32),
              backdropFilter: 'blur(2px)',
            },
          },
          paper: {
            sx: {
              width: { xs: 'calc(100% - 24px)', sm: 360 },
              maxWidth: 360,
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <Scrollbar>
          <Box
            sx={{
              p: 3,
              pt: 5.5,
              color: isAdmin ? 'primary.contrastText' : 'text.primary',
              position: 'relative',
              background: isAdmin
                ? (theme) =>
                    `linear-gradient(145deg, ${theme.vars.palette.primary.darker}, ${theme.vars.palette.primary.main})`
                : 'background.neutral',
            }}
          >
            <IconButton
              onClick={onClose}
              aria-label={t('ปิดเมนูบัญชี', { defaultValue: 'ปิดเมนูบัญชี' })}
              sx={{
                top: 10,
                right: 10,
                position: 'absolute',
                color: isAdmin ? 'inherit' : 'text.secondary',
                bgcolor: (theme) =>
                  isAdmin ? varAlpha(theme.vars.palette.common.whiteChannel, 0.08) : 'transparent',
                '&:hover': {
                  bgcolor: (theme) =>
                    isAdmin
                      ? varAlpha(theme.vars.palette.common.whiteChannel, 0.16)
                      : 'action.hover',
                },
              }}
            >
              <RiCloseLine />
            </IconButton>

            <Box sx={{ gap: 2, display: 'flex', alignItems: 'center' }}>
              <Avatar
                src={avatarUrl}
                alt={displayName}
                sx={{
                  width: 68,
                  height: 68,
                  flexShrink: 0,
                  typography: 'h5',
                  color: 'primary.main',
                  bgcolor: 'common.white',
                  border: (theme) =>
                    `3px solid ${varAlpha(theme.vars.palette.common.whiteChannel, 0.4)}`,
                }}
              >
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h6" noWrap>
                  {displayName}
                </Typography>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{
                    mt: 0.25,
                    color: isAdmin
                      ? (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.72)
                      : 'text.secondary',
                  }}
                >
                  {user?.email || `@${user?.username ?? '-'}`}
                </Typography>
                <Label
                  sx={{
                    mt: 1,
                    color: isAdmin ? 'common.white' : 'primary.darker',
                    bgcolor: (theme) =>
                      isAdmin
                        ? varAlpha(theme.vars.palette.common.whiteChannel, 0.14)
                        : theme.vars.palette.primary.lighter,
                  }}
                >
                  {roleLabel}
                </Label>
              </Box>
            </Box>

            {isAdmin && (
              <Box
                sx={{
                  p: 1.5,
                  gap: 1,
                  mt: 2.5,
                  display: 'flex',
                  borderRadius: 1.5,
                  alignItems: 'center',
                  bgcolor: (theme) => varAlpha(theme.vars.palette.common.whiteChannel, 0.08),
                }}
              >
                {isTempleAccount ? <RiBuildingLine size={20} /> : <RiShieldCheckLine size={20} />}
                <Typography variant="caption" sx={{ opacity: 0.84 }}>
                  {isTempleAccount
                    ? `กำลังจัดการ ${templeAccess?.temple.name || 'ระบบวัด'}`
                    : t('คุณกำลังใช้งานพื้นที่จัดการระบบของโรงเรียน')}
                </Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ px: 2, py: 2.5 }}>
            <Typography
              variant="overline"
              sx={{ px: 1.5, mb: 1, display: 'block', color: 'text.disabled' }}
            >
              {isTempleAccount ? 'เมนูบัญชีและวัด' : isAdmin ? t('เมนูผู้ดูแล') : t('เมนูบัญชี')}
            </Typography>
            <MenuList
              disablePadding
              sx={{
                gap: 0.5,
                display: 'grid',
              }}
            >
              {menuData.map((option) => {
                const isRootPath = ROOT_PATHS.includes(option.href);
                const selected =
                  pathname === option.href ||
                  (!isRootPath && option.href !== '#' && pathname.startsWith(`${option.href}/`));

                return (
                  <MenuItem
                    key={`${option.label}-${option.href}`}
                    disableGutters
                    sx={{
                      '&:hover': {
                        color: 'text.primary',
                        bgcolor: 'transparent',
                      },
                    }}
                  >
                    <Link
                      component={RouterLink}
                      href={option.href}
                      color="inherit"
                      underline="none"
                      onClick={onClose}
                      aria-current={selected ? 'page' : undefined}
                      sx={{
                        p: 1.25,
                        gap: 1.5,
                        width: 1,
                        minHeight: 48,
                        display: 'flex',
                        borderRadius: 1.25,
                        typography: 'subtitle2',
                        alignItems: 'center',
                        color: selected ? 'primary.main' : 'text.secondary',
                        bgcolor: selected ? 'transparent' : 'transparent',
                        '& svg': { width: 23, height: 23, flexShrink: 0 },
                        '&:hover': {
                          color: 'text.primary',
                          bgcolor: 'transparent',
                        },
                      }}
                    >
                      {option.icon}
                      <Box component="span" sx={{ minWidth: 0, flexGrow: 1 }}>
                        {t(option.label, { defaultValue: option.label })}
                      </Box>
                      {option.info && <Label color="error">{option.info}</Label>}
                      <RiArrowRightSLine
                        size={18}
                        style={{ color: 'var(--palette-text-disabled)' }}
                      />
                    </Link>
                  </MenuItem>
                );
              })}
            </MenuList>
          </Box>
        </Scrollbar>

        <Box
          sx={{
            p: 2.5,
            bgcolor: 'transparent',
          }}
        >
          <SignOutButton onClose={onClose} />
        </Box>
      </Drawer>
    </>
  );
}
