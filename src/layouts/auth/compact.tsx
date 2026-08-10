import Box from "@mui/material/Box";
import Card from "@mui/material/Card";

import Header from "../common/header-simple";

type AuthLayoutCompactProps = {
  children: React.ReactNode;
};

const AuthLayoutCompact = ({ children }: AuthLayoutCompactProps) => {
  return (
    <>
      <Header />

      <Box
        component="main"
        sx={{
          py: 12,
          display: "flex",
          minHeight: "100vh",
          textAlign: "center",
          px: { xs: 2, md: 0 },
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
          "&:before": {
            width: 1,
            height: 1,
            zIndex: -1,
            content: "''",
            opacity: 0.24,
            position: "absolute",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center center",
            backgroundImage: "url(/assets/images/banner/img-banner-1.jpg)",
          },
        }}
      >
        <Card
          sx={{
            py: 5,
            px: 3,
            maxWidth: 420,
          }}
        >
          {children}
        </Card>
      </Box>
    </>
  );
};
export default AuthLayoutCompact;
