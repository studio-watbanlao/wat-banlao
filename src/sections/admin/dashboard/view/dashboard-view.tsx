'use client';

import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import BankingCurrentBalance from '../banking-current-balance';
import BookingDetails from '../booking-details';
import BookingWidgetSummary from '../booking-widget-summary';

import { _bookings, _mock } from 'src/_mock';
import BookingIllustration from 'src/assets/illustrations/booking-illustration';

const _carouselsExample = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  title: _mock.postTitle(index),
  coverUrl: `/assets/images/banner/img-banner-${index}.jpg`,
  description: _mock.description(index),
}));

export default function OverviewBankingView() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack>
        <Grid container spacing={3}>
          <Grid size={12}>
            <BankingCurrentBalance list={_carouselsExample} />
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <BookingWidgetSummary title="บทความ" total={714000} icon={<BookingIllustration />} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <BookingWidgetSummary title="กิจกรรม" total={311000} icon={<BookingIllustration />} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <BookingWidgetSummary title="Canceled" total={124000} icon={<BookingIllustration />} />
          </Grid>
        </Grid>
        <Grid container spacing={3} mt={4}>
          <Grid size={12}>
            <BookingDetails
              title="Banner Management"
              tableData={_bookings}
              tableLabels={[
                { id: 'destination', label: 'Destination' },
                { id: 'customer', label: 'Customer' },
                { id: 'checkIn', label: 'Check In' },
                { id: 'checkOut', label: 'Check Out' },
                { id: 'status', label: 'Status' },
                { id: '' },
              ]}
            />
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}
