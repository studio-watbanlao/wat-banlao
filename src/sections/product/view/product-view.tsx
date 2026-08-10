import { useState } from "react";
import {
  Stack,
  Grid,
  Container,
  Typography,
  Divider,
  Card,
  Box,
  Collapse,
  useTheme,
  alpha,
  FormControlLabel,
  Checkbox,
  Button,
  MenuItem,
} from "@mui/material";
import ProductItem from "../product-vertical-item";
import Iconify from "src/components/iconify";
import PriceRangeSelector from "../product-price-range-selector";
import { useResponsive } from "src/hooks/use-responsive";
import CustomPopover from "src/components/custom-popover";

type FAQ = {
  id: number;
  heading: string;
  detail: string;
  icon: string;
};

const ProductView = () => {
  const mdUp = useResponsive("up", "md");
  const theme = useTheme();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [openActionPopover, setOpenActionPopover] =
    useState<HTMLElement | null>(null);

  const handleToggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleOpenActionPopoverClick = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setOpenActionPopover(event.currentTarget);
  };

  const handleCloseActionPopover = () => {
    setOpenActionPopover(null);
  };

  return (
    <Stack>
      <Container maxWidth="xl" sx={{ p: 0 }}>
        <Grid container spacing={2}>
          {mdUp && (
            <Grid item xs={12} md={3}>
              <Card>
                <Stack>
                  <Stack sx={{ p: 2 }}>
                    <Typography variant="h5" color="primary">
                      ตัวกรองข้อมูล
                    </Typography>
                  </Stack>
                  <Divider />
                  <Stack>
                    {_faqs.map((item) => {
                      const isExpanded = expandedId === item.id;

                      return (
                        <Box
                          key={item.id}
                          sx={{
                            borderBottom: `1px solid ${alpha(theme.palette.grey[400], 0.4)}`,
                          }}
                        >
                          <Box
                            onClick={() => handleToggle(item.id)}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              cursor: "pointer",
                              py: 1,
                              px: 2,
                            }}
                          >
                            <Typography>{item.heading}</Typography>
                            <Iconify
                              icon={
                                isExpanded
                                  ? "eva:arrow-ios-upward-fill"
                                  : "eva:arrow-ios-downward-fill"
                              }
                            />
                          </Box>
                          <Collapse in={isExpanded} sx={{ p: 0, m: 0 }}>
                            <Stack
                              sx={{ maxHeight: 455, overflowY: "auto", px: 2 }}
                            >
                              {_brand.map((brand) => (
                                <FormControlLabel
                                  key={brand.id}
                                  label={brand.heading}
                                  control={
                                    <Checkbox size="medium" defaultChecked />
                                  }
                                />
                              ))}
                            </Stack>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Stack>
                  <Divider />
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        p: 2,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography variant="body1">ช่วงราคา</Typography>
                      </Box>
                      <PriceRangeSelector />
                      <Button variant="contained" color="primary" fullWidth>
                        ค้นหา
                      </Button>
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          )}

          <Grid item xs={12} md={9}>
            <Stack>
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h5" color="primary">
                  สินค้าที่น่าสนใจ
                </Typography>

                <Button
                  variant="outlined"
                  color="primary"
                  endIcon={
                    <Iconify
                      sx={{ ml: 4 }}
                      icon="eva:arrow-ios-downward-fill"
                    />
                  }
                  sx={{ minWidth: "150px" }}
                  onClick={handleOpenActionPopoverClick}
                >
                  ราคาสูง - ราคาต่ำ
                </Button>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="primary">
                ผลลัพธ์ 20 จาก 500 รายการ
              </Typography>
              <Grid container spacing={2} mt={2}>
                {interestingProducts.map((product) => (
                  <Grid item xs={6} sm={4} md={3} key={product.id}>
                    <ProductItem
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      normalPrice={product.normalPrice}
                      category={product.category}
                      image={product.image}
                    />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      <CustomPopover
        open={openActionPopover}
        onClose={handleCloseActionPopover}
        sx={{
          width: 200,
          bgcolor: "common.white",
          color: "common.black",
          ml: 2,
          mt: 0.8,
        }}
      >
        {OPTIONS_MAXHEIGHT.map((option) => (
          <MenuItem key={option} selected={option === "Pyxis"}>
            {option}
          </MenuItem>
        ))}
      </CustomPopover>
    </Stack>
  );
};

export default ProductView;

const OPTIONS_MAXHEIGHT = [
  "None",
  "Atria",
  "Callisto",
  "Dione",
  "Ganymede",
  "Hangouts Call",
  "Luna",
];

// Mock Data
const interestingProducts = [
  {
    id: 1,
    name: "เครื่องผลิตออกซิเจน",
    price: "฿12,000",
    normalPrice: "฿15,000",
    category: "อุปกรณ์การแพทย์",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 2,
    name: "รถเข็นผู้ป่วย",
    price: "฿7,500",
    normalPrice: "฿8,500",
    category: "อุปกรณ์ผู้ป่วย",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 3,
    name: "เครื่องวัดความดัน",
    price: "฿2,800",
    normalPrice: "฿3,500",
    category: "เครื่องมือวัด",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 4,
    name: "เตียงผู้ป่วยไฟฟ้า",
    price: "฿25,000",
    normalPrice: "฿30,000",
    category: "เฟอร์นิเจอร์การแพทย์",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 5,
    name: "เครื่องตรวจระดับน้ำตาล",
    price: "฿3,500",
    normalPrice: "฿4,000",
    category: "เครื่องมือวัด",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 6,
    name: "เตียงไฟฟ้า",
    price: "฿15,000",
    normalPrice: "฿18,000",
    category: "เฟอร์นิเจอร์การแพทย์",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 7,
    name: "เครื่องดูดเสมหะ",
    price: "฿9,500",
    normalPrice: "฿10,000",
    category: "อุปกรณ์การแพทย์",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 8,
    name: "เครื่องวัดออกซิเจนในเลือด",
    price: "฿3,200",
    normalPrice: "฿4,000",
    category: "เครื่องมือวัด",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 9,
    name: "หมอนรองคอไฟฟ้า",
    price: "฿1,200",
    normalPrice: "฿1,500",
    category: "อุปกรณ์สำหรับผู้ป่วย",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 10,
    name: "ผ้าพันแผลอเนกประสงค์",
    price: "฿500",
    normalPrice: "฿800",
    category: "อุปกรณ์ทำแผล",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 11,
    name: "ชุดเครื่องมือแพทย์",
    price: "฿8,000",
    normalPrice: "฿10,000",
    category: "อุปกรณ์การแพทย์",
    image: "https://via.placeholder.com/300",
  },
  {
    id: 12,
    name: "เครื่องฉายภาพรังสี",
    price: "฿45,000",
    normalPrice: "฿50,000",
    category: "เครื่องมือการแพทย์",
    image: "https://via.placeholder.com/300",
  },
];

const _faqs: FAQ[] = [
  {
    id: 1,
    heading: "หมวดหมู่สินค้า",
    detail: "คำอธิบายเกี่ยวกับหมวดหมู่สินค้า",
    icon: "jam:medical",
  },
  {
    id: 2,
    heading: "แบรนด์สินค้า",
    detail: "คำอธิบายเกี่ยวกับแบรนด์สินค้า",
    icon: "mdi:heart-pulse",
  },
];

const _brand = [
  { id: 1, heading: "3M", icon: "jam:medical" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
  { id: 2, heading: "Abbott", icon: "mdi:heart-pulse" },
  { id: 3, heading: "BD (Becton Dickinson)", icon: "mdi:heart-pulse" },
];
