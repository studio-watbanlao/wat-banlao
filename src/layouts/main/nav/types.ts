import { StackProps } from "@mui/material/Stack";
import { ListItemButtonProps } from "@mui/material/ListItemButton";
import { SxProps, Theme } from "@mui/material";

// ----------------------------------------------------------------------
export type SlotProps = {
  gap?: number;
  rootItem?: SxProps<Theme>;
  subItem?: SxProps<Theme>;
  subheader?: SxProps<Theme>;
  currentRole?: string;
};

export type NavItemStateProps = {
  open?: boolean;
  active?: boolean;
  subItem?: boolean;
  hasChild?: boolean;
  externalLink?: boolean;
  currentRole?: string;
};

export type SubMenuItemProps = {
  roles: string[];
  title: string;
  path: string;
};

export type NavItemBaseProps = {
  title: string;
  path: string;
  icon?: React.ReactElement;
  roles?: string[];
  children?: {
    subheader: string;
    items: SubMenuItemProps[];
  }[];
};

export type NavItemProps = ListItemButtonProps &
  NavItemStateProps &
  NavItemBaseProps & {
    slotProps?: SlotProps;
  };

export type NavListProps = {
  data: NavItemBaseProps;
  slotProps?: SlotProps;
};

export type NavSubListProps = StackProps & {
  data: NavItemBaseProps[];
  subheader: string;
};

export type NavProps = {
  data: NavItemBaseProps[];
  slotProps?: SlotProps;
};
