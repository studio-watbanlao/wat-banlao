import React from "react";
import { Grid, Typography, Stack, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Image from "src/components/image";

type ProductHorizontalItemProps = {
  imageUrl: string;
  title: string;
  quantity: number;
  options: string;
  originalPrice: number;
  salePrice: number;
};

const ProductHorizontalItem: React.FC<ProductHorizontalItemProps> = ({
  imageUrl,
  title,
  quantity,
  options,
  originalPrice,
  salePrice,
}) => {
  const theme = useTheme();
  // const navigate = useNavigate();

  const handleClickItem = () => {
    const id = "86876785674545";
    // navigate(paths.product.detail(id));
  };

  return (
    <Stack onClick={handleClickItem}>
      <Grid container spacing={3}>
        <Grid size={2}>
          <Image
            alt={title}
            src={imageUrl}
            style={{ height: "100px", width: "100%", borderRadius: 8 }}
          />
        </Grid>

        <Grid size={10}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
            <Box sx={{ width: "80%" }}>
              <Typography color="primary" noWrap>
                {title}
              </Typography>
            </Box>
            <Typography color="primary">x{quantity}</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            ตัวเลือก: {options}
          </Typography>

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  textDecoration: "line-through",
                  mr: 1,
                }}
              >
                {/* {fCurrencyThai(originalPrice)} */}
              </Typography>

              <Typography
                variant="h6"
                color={theme.palette.primary.main}
                component="span"
                sx={{ fontWeight: 600 }}
              >
                {/* {fCurrencyThai(salePrice)} */}
              </Typography>
            </Box>

            <Typography
              variant="h6"
              color={theme.palette.primary.main}
              component="span"
              sx={{ fontWeight: 600 }}
            >
              {/* {fCurrencyThai(salePrice * quantity)} */}
            </Typography>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default ProductHorizontalItem;
