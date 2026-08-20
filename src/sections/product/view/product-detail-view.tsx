import { Container, Grid, Stack } from '@mui/material';
import { useGetProduct } from 'src/queries/product';
import ProductDetailsCarousel from '../product-details-carousel';
import ProductDetailsSummary from '../product-details-summary';

const ActivityDetailsView = () => {
  const { data: product } = useGetProduct(`eefe8fyeuhfjkek`);

  return (
    <Container maxWidth={false}>
      {product && (
        <Stack>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <ProductDetailsCarousel product={product} />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 5 }}>
              <ProductDetailsSummary product={product} />
            </Grid>
          </Grid>
        </Stack>
      )}
    </Container>
  );
};

export default ActivityDetailsView;
