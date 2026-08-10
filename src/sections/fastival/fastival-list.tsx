import { Box, Stack, Tab, Tabs } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import EmptyContent from 'src/components/empty-content';
import { useResponsive } from 'src/hooks/use-responsive';
import { default as FestivalCard } from './festival-card';

type Props = {
  data: any[];
};

const FastivalList = ({ data }: Props) => {
  const mdUp = useResponsive('up', 'md');
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    if (data.length > 0) {
      setCurrentTab((prev) => prev ?? data[0].year);
    }
  }, [data]);

  const handleChangeTab = useCallback((_: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  }, []);

  if (data?.length === 0) {
    return (
      <Stack sx={{ my: 5 }}>
        <EmptyContent title="ไม่พบข้อมูล" />
      </Stack>
    );
  }

  return (
    <>
      {mdUp ? (
        <Box
          display="grid"
          gridTemplateColumns="repeat(3, 1fr)"
          sx={{
            border: (theme) => `dashed 1px ${theme.palette.divider}`,
          }}
        >
          {data.map((item: any) => (
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
              {data.map((tab) => (
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
            {data.map((tab) =>
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
    </>
  );
};

export default FastivalList;
