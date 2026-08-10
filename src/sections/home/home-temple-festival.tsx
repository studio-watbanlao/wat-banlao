import { m } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Box, Container, Stack, Tab, Tabs, Typography } from '@mui/material';

import { MotionViewport, varFade } from 'src/components/animate';
import { useResponsive } from 'src/hooks/use-responsive';
import { useGetFastival } from 'src/queries/fastival';
import FestivalCard from '../fastival/festival-card';

// ----------------------------------------------------------------------

const HomeTempleFestival = () => {
  const mdUp = useResponsive('up', 'md');
  const { data = [], isLoading } = useGetFastival();

  const [currentTab, setCurrentTab] = useState<string | null>(null);

  const latest3Years = useMemo(() => {
    if (!data?.length) return [];

    return [...data]
      .filter((item) => item?.year)
      .sort((a, b) => Number(b.year) - Number(a.year))
      .slice(0, 3);
  }, [data]);

  useEffect(() => {
    if (latest3Years.length > 0) {
      setCurrentTab((prev) => prev ?? latest3Years[0].year);
    }
  }, [latest3Years]);

  const handleChangeTab = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  // ----------------------------------------------------------------------

  if (isLoading) {
    return (
      <Container sx={{ py: 10 }}>
        <Typography textAlign="center">Loading...</Typography>
      </Container>
    );
  }

  if (!latest3Years.length) {
    return null;
  }

  // ----------------------------------------------------------------------

  return (
    <Container component={MotionViewport} sx={{ py: 10 }}>
      <Stack spacing={5}>
        <Stack spacing={2} textAlign="center">
          <m.div variants={varFade().inUp}>
            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              กิจกรรมประจำปี
            </Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography variant="h3">เทศกาลงานบุญวัดบ้านเหล่า</Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ color: 'text.secondary' }}>
              วัดบ้านเหล่า-สุขธัมมาราม ตำบลเม็กดำ อำเภอพยัคฆภูมิพิสัย จังหวัดมหาสารคาม
            </Typography>
          </m.div>
        </Stack>

        {mdUp ? (
          <Box
            display="grid"
            gridTemplateColumns="repeat(3, 1fr)"
            sx={{
              border: (theme) => `dashed 1px ${theme.palette.divider}`,
            }}
          >
            {latest3Years.map((item) => (
              <FestivalCard key={item.year} item={item} />
            ))}
          </Box>
        ) : (
          <>
            <Stack alignItems="center" mb={2}>
              <Tabs
                value={currentTab ?? false}
                onChange={handleChangeTab}
                variant="scrollable"
                scrollButtons="auto"
              >
                {latest3Years.map((tab) => (
                  <Tab key={tab.year} value={tab.year} label={tab.year} />
                ))}
              </Tabs>
            </Stack>

            <Box
              sx={{
                borderRadius: 2,
                border: (theme) => `dashed 1px ${theme.palette.divider}`,
              }}
            >
              {latest3Years.map((tab) =>
                tab.year === currentTab ? (
                  <FestivalCard
                    key={tab.year}
                    item={tab}
                    sx={{
                      borderLeft: (theme) => `dashed 1px ${theme.palette.divider}`,
                    }}
                  />
                ) : null
              )}
            </Box>
          </>
        )}

        <Stack textAlign="center" spacing={2}>
          <m.div variants={varFade().inDown}>
            <Typography variant="h4">จัดในช่วง เดือนมีนาคม ของทุกปี</Typography>
          </m.div>

          <m.div variants={varFade().inDown}>
            <Typography sx={{ color: 'text.secondary' }}>
              เป็นงานบุญประจำปีที่จัดขึ้นโดยชาวบ้านในชุมชน เพื่อร่วมกันทำบุญ สืบสานวัฒนธรรม
              และแสดงความศรัทธาต่อพระพุทธศาสนา โดยเฉพาะกับ หลวงปู่สาธุ
              ซึ่งเป็นพระเกจิอาจารย์ที่ได้รับความเคารพอย่างสูง
            </Typography>
          </m.div>
        </Stack>
      </Stack>
    </Container>
  );
};

export default HomeTempleFestival;
