import Paper from "@mui/material/Paper";
import Image from "src/components/image";

type ProductBrandItemProps = {
  item: {
    title: string;
    description: string;
    coverUrl: string;
  };
};

const ProductBrandItem = ({ item }: ProductBrandItemProps) => {
  const { coverUrl, title } = item;
  return (
    <Paper
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Image alt={title} src={coverUrl} sx={{ height: "144px", width: 1 }} />
    </Paper>
  );
};

export default ProductBrandItem;
