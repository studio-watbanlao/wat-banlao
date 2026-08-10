import Button from "@mui/material/Button";
import { Theme, SxProps } from "@mui/material/styles";

import { RouterLink } from "src/routes/components";

type Props = {
  sx?: SxProps<Theme>;
};

const LoginButton = ({ sx }: Props) => {
  return (
    <Button
      component={RouterLink}
      href={"/auth/login"}
      variant="outlined"
      sx={{ mr: 1, ...sx }}
    >
      ลงชื่อเข้าใช้
    </Button>
  );
};

export default LoginButton;
