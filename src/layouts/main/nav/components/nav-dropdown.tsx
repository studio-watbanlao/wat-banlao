import type { FadeProps } from '@mui/material/Fade';
import Fade from '@mui/material/Fade';
import { styled } from '@mui/material/styles';

// ----------------------------------------------------------------------

const NavDropdownPaper = styled('div')(({ theme }) => ({
  padding: theme.spacing(1.5, 2),
  color: 'var(--nav-dropdown-color, var(--palette-text-primary))',
  backgroundColor: 'var(--nav-dropdown-bg, var(--palette-background-paper))',
  border: '1px solid var(--nav-dropdown-border-color, var(--palette-divider))',
  borderRadius: Number(theme.shape.borderRadius) * 2,
  boxShadow: 'var(--nav-dropdown-shadow, 0 14px 36px rgba(24, 33, 45, 0.08))',
}));

// ----------------------------------------------------------------------

type NavDropdownProps = React.ComponentProps<'div'> & {
  open: FadeProps['in'];
};

export const NavDropdown = styled(({ open, children, ...other }: NavDropdownProps) => (
  <Fade in={open}>
    <div {...other}>
      <NavDropdownPaper>{children}</NavDropdownPaper>
    </div>
  </Fade>
))(({ theme }) => ({
  top: '100%',
  left: -16,
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
  position: 'absolute',
  paddingTop: theme.spacing(1.25),
  zIndex: theme.zIndex.drawer * 2,
}));
