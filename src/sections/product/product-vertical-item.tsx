import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  useTheme,
  Box,
  Stack,
} from "@mui/material";

type ProductItemProps = {
  id: number;
  name: string;
  price: string;
  normalPrice: string;
  category: string;
  image: string;
  alt?: string;
};

const ProductVerticalItem: React.FC<ProductItemProps> = ({
  name,
  price,
  normalPrice,
  category,
  image,
}) => {
  const theme = useTheme();
  // const navigate = useNavigate();

  const handleClickItem = () => {
    const id = "86876785674545";
    // navigate(paths.product.detail(id));
  };

  return (
    <Stack onClick={handleClickItem}>
      <Card
        sx={{
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: 6,
          },
        }}
      >
        <Box sx={{ position: "relative", paddingTop: "100%" }}>
          <CardMedia
            component="img"
            image={image}
            alt={name}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>

        <CardContent>
          <Typography
            variant="subtitle2"
            color={theme.palette.secondary.main}
            sx={{
              fontWeight: 500,
              mb: 0.5,
            }}
          >
            {category}
          </Typography>

          <Typography
            variant="subtitle1"
            gutterBottom
            sx={{
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>

          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textDecoration: "line-through",
                mr: 1,
              }}
            >
              {normalPrice}
            </Typography>
            <Typography
              variant="h6"
              color={theme.palette.primary.main}
              component="span"
              sx={{ fontWeight: 600 }}
            >
              {price}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            // startIcon={<ShoppingCartIcon />}
          >
            เพิ่มลงในตะกร้า
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
};

export default ProductVerticalItem;
