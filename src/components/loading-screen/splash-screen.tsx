import { m } from "framer-motion";
import { useEffect, useState } from "react";

import { useTheme, alpha } from "@mui/material/styles";
import Box, { BoxProps } from "@mui/material/Box";

import Logo from "../logo";

const SplashScreen = ({ sx, ...other }: BoxProps) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        zIndex: 1300,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bgcolor: theme.palette.background.default,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...sx,
      }}
      {...other}
    >
      {/* วงกลมพื้นหลัง glow effect */}
      <Box
        component={m.div}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        sx={{
          position: "absolute",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: `radial-gradient(${alpha(
            theme.palette.primary.main,
            0.15
          )}, transparent 70%)`,
        }}
      />

      {/* วงกลมชั้นนอกสุด - หมุน */}
      <Box
        component={m.div}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, ease: "linear", repeat: Infinity }}
        sx={{
          position: "absolute",
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: `2px solid ${alpha(theme.palette.primary.light, 0.2)}`,
        }}
      />

      {/* วงกลมกลาง - pulse + spin */}
      <Box
        component={m.div}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, -360],
        }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        sx={{
          position: "absolute",
          width: 160,
          height: 160,
          borderRadius: "50%",
          border: `3px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      />

      {/* วงกลมในสุด - blur และ soft glow */}
      <Box
        component={m.div}
        animate={{
          opacity: [0.2, 0.5, 0.2],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        sx={{
          position: "absolute",
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: `2px solid ${alpha(theme.palette.primary.dark, 0.2)}`,
          backdropFilter: "blur(4px)",
        }}
      />

      {/* โลโก้ตรงกลาง */}
      <m.div
        initial={{ scale: 0.9, opacity: 0.7 }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.7, 1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Logo disabledLink sx={{ width: 64, height: 64 }} />
      </m.div>
    </Box>
  );
};

export default SplashScreen;
