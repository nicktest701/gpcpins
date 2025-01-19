import HomeMap from '../HomeMap';
import ContactForm from '../ContactForm';
import MainTitle from '../../components/custom/MainTitle';
import { Box, Container } from '@mui/material';

function Contact() {
  return (
    <Box sx={{ pt: 10 }}>
      <div style={{ backgroundColor: 'whitesmoke', paddingBlock: '16px' }}>
        <MainTitle
          title='Send us a message'
          titleColor='primary.main'
          subtitle='Have any question? We would love to hear from you.'
          align='center'
        />
      </div>
      <Container
        sx={{
          py: 10,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'center',
          gap: '8rem',
        }}
      >
        <HomeMap />
        <ContactForm />
      </Container>
    </Box>
  );
}

export default Contact;
