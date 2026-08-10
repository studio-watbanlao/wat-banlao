import { useQuery } from "@tanstack/react-query";
import { PRODUCT_KEY } from "./key";
import { ProductItem } from "src/types/product";
import { fetchProduct } from "src/services/product";

export const useGetProduct = (productId: string) =>
  useQuery<ProductItem, Error>({
    queryKey: [PRODUCT_KEY, productId],
    queryFn: () => fetchProduct(productId),
  });
