import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Divider,
  Fade,
  MenuItem,
  Paper,
  Stack,
  Typography,
  useTheme,
  ListSubheader,
  MenuList,
} from "@mui/material";

import { usePathname } from "src/routes/hooks";
import { useActiveLink } from "src/routes/hooks/use-active-link";
import { paper } from "src/theme/css";
import { HEADER } from "../../../config-layout";
import SvgColor from "src/components/svg-color";
import { NavItem, NavItemDashboard } from "./nav-item";
import { NavListProps, NavSubListProps, SubMenuItemProps } from "../types";
import Link from "next/link";
import { color } from "@mui/system";

const NavList = ({ data, slotProps }: NavListProps) => {
  const theme = useTheme();
  const pathname = usePathname();
  const isActive = useActiveLink(data.path, !!data.children);

  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    if (openMenu) {
      setOpenMenu(false);
    }
  }, [pathname]);

  const handleOpenMenu = useCallback(() => {
    if (data.children) setOpenMenu(true);
  }, [data.children]);

  const handleCloseMenu = useCallback(() => {
    setOpenMenu(false);
  }, []);

  if (data.roles && !data.roles.includes(`${slotProps?.currentRole}`)) {
    return null;
  }

  return (
    <Stack
      sx={{
        position: "relative",
        display: "flex",
        alignSelf: "center",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <NavItem
        open={openMenu}
        onMouseEnter={handleOpenMenu}
        onMouseLeave={handleCloseMenu}
        title={data.title}
        path={data.path}
        hasChild={!!data.children}
        externalLink={data.path.includes("http")}
        roles={data.roles}
        currentRole={slotProps?.currentRole}
        active={isActive}
      />

      {!!data.children && openMenu && (
        <Fade in={openMenu}>
          <Paper
            onMouseEnter={handleOpenMenu}
            onMouseLeave={handleCloseMenu}
            sx={{
              ...paper({ theme }),
              position: "absolute",
              zIndex: theme.zIndex.modal,
              top: 36,
              left: -16,
              width: "fit-content",
              borderRadius: 2,
              boxShadow: theme.customShadows.dropdown,
              overflow: "hidden",
            }}
          >
            {data.children.map((list, index) => {
              // const visibleItems = list.items.filter(
              //   (item) => !item.roles || item.roles.includes('')
              // );

              // if (visibleItems.length === 0) return null;

              return (
                <MenuList key={index} sx={{ p: 2 }}>
                  {list.items.map((item, i) => (
                    <SubMenuItem item={item} />
                  ))}
                </MenuList>
              );
            })}
          </Paper>
        </Fade>
      )}
    </Stack>
  );
};

export default NavList;

const SubMenuItem = ({ item }: { item: SubMenuItemProps }) => {
  const theme = useTheme();

  return (
    <Link
      href={item.path}
      style={{ color: theme.palette.common.black, textDecoration: "none" }}
    >
      <MenuItem
        key={item.title}
        sx={{
          width: "100%",
          minWidth: 320,
          py: 2,
          borderRadius: 2,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <SvgColor src="/assets/icons/navbar/icon_dot.svg" />
          <Typography variant="body2">{item.title}</Typography>
        </Stack>
      </MenuItem>
    </Link>
  );
};

export const NavSubList = ({
  data,
  subheader,
  sx,
  ...other
}: NavSubListProps) => {
  const pathname = usePathname();
  const isDashboard = subheader === "Dashboard";

  return (
    <Stack
      spacing={2}
      flexGrow={1}
      alignItems="flex-start"
      sx={{
        pb: isDashboard ? 0 : 2,
        ...(isDashboard && { maxWidth: { md: 1 / 3, lg: 540 } }),
        ...sx,
      }}
      {...other}
    >
      <ListSubheader
        disableSticky
        sx={{
          p: 0,
          typography: "overline",
          fontSize: 11,
          color: "text.primary",
        }}
      >
        {subheader}
      </ListSubheader>

      {data.map((item) =>
        isDashboard ? (
          <NavItemDashboard key={item.title} path={item.path} />
        ) : (
          <NavItem
            key={item.title}
            title={item.title}
            path={item.path}
            active={pathname === item.path || pathname === `${item.path}/`}
            subItem
          />
        )
      )}
    </Stack>
  );
};
