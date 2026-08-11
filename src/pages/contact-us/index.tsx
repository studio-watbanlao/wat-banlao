import { Container } from '@mui/material';
import { CONFIG } from 'src/config-global';
import { MainLayout } from 'src/layouts/main';
import { ContactView } from 'src/sections/contact/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: 'ติดต่อเรา',
};

const ContactPage = () => {
  return (
    <MainLayout>
      <Container
        sx={{
          py: { xs: CONFIG.layout.HEIGHT_LAYOUT_XS, md: CONFIG.layout.HEIGHT_LAYOUT },
        }}
      >
        <ContactView />
      </Container>
    </MainLayout>
  );
};

export default ContactPage;
