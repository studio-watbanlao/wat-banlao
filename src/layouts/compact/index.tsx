import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";

import Header from "../common/header-simple";

type CompactLayoutProps = {
  children: React.ReactNode;
};

const CompactLayout = ({ children }: CompactLayoutProps) => {
  return (
    <>
      <Header />

      <Container component="main">
        <Stack
          sx={{
            py: 12,
            m: "auto",
            maxWidth: 400,
            minHeight: "100vh",
            textAlign: "center",
            justifyContent: "center",
          }}
        >
          {children}
        </Stack>
      </Container>
    </>
  );
};
export default CompactLayout;
