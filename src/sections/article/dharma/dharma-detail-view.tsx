import { Divider, Grid, Stack, Typography, useTheme } from '@mui/material';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import Iconify from 'src/components/iconify';
import { useGetBlogById } from 'src/queries/article/blog';
import { usePostBlog } from 'src/queries/article/blog/mutation';
import { fShortenNumber } from 'src/utils/format-number';

const DharmaDetailsView = () => {
  const theme = useTheme();
  const params = useParams();
  const id = params?.id as string;

  const { data, isLoading } = useGetBlogById(id);
  const { mutate } = usePostBlog();

  useEffect(() => {
    mutate(id);
  }, [id]);

  return (
    <Stack my={4}>
      <CustomBreadcrumbs
        links={[
          {
            name: 'บทความ/ธรรมะ',
            href: '/',
          },
          { name: 'ธรรมะ' },
        ]}
        sx={{
          mb: 3,
        }}
      />
      <Stack>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Typography variant="h4" color="primary">
                งานบุญประจำปี 2566 วัดบ้านเหล่า พิธียกช่อฟ้าอุโบสถ ฉลองใบตราตั้งเจ้าอาวาส
                และงานนมัสการหลวงปู่สาธุ์ สุขธมฺโม
              </Typography>

              <Typography variant="body1">
                งานบุญประจำปี 2566 วัดบ้านเหล่า พิธียกช่อฟ้าอุโบสถ ฉลองใบตราตั้งเจ้าอาวาส
                และงานนมัสการหลวงปู่สาธุ์ สุขธมฺโม
              </Typography>

              <Stack
                spacing={1.5}
                direction="row"
                justifyContent="space-between"
                sx={{
                  typography: 'caption',
                  opacity: 0.64,
                  color: 'common.white',
                }}
              >
                <Typography variant="body1" color="primary">
                  March 9, 2023
                </Typography>
                <Stack spacing={2} direction="row" alignItems="center">
                  <Stack direction="row" alignItems="center">
                    <Iconify
                      icon="solar:eye-bold"
                      width={24}
                      sx={{ mr: 0.5, color: theme.palette.primary.main }}
                    />
                    <Typography variant="body1" color="primary">
                      {data?.view && fShortenNumber(data?.view)}
                    </Typography>
                  </Stack>

                  {/* <Stack direction="row" alignItems="center">
                    <Iconify
                      icon="solar:share-bold"
                      width={24}
                      sx={{ mr: 0.5, color: theme.palette.primary.main }}
                    />
                    <Typography variant="body1" color="primary">
                      {fShortenNumber(20000)}
                    </Typography>
                  </Stack> */}
                </Stack>
              </Stack>

              {/* {data && <ActivityImageCarousel product={data} />} */}

              <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

              <Typography variant="body1">
                Where does it come from? Contrary to popular belief, Lorem Ipsum is not simply
                random text. It has roots in a piece of classical Latin literature from 45 BC,
                making it over 2000 years old. Richard McClintock, a Latin professor at
                Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words,
                consectetur, from a Lorem Ipsum passage, and going through the cites of the word in
                classical literature, discovered the undoubtable source. Lorem Ipsum comes from
                sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of
                Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of
                ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem
                ipsum dolor sit amet..", comes from a line in section 1.10.32. The standard chunk of
                Lorem Ipsum used since the 1500s is reproduced below for those interested. Sections
                1.10.32 and 1.10.33 from "de Finibus Bonorum et Malorum" by Cicero are also
                reproduced in their exact original form, accompanied by English versions from the
                1914 translation by H. Rackham.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};

export default DharmaDetailsView;
