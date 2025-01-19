import { Box, Typography } from '@mui/material';

import ContactMessage from './ContactMessage';


function ContactForm() {
  return (
    <Box sx={{ flex: { xs: 1, md: 0.4 } }}>
      {/* <MainTitle
        title=' Send Us A Message'
        subtitle='Talk to Us.Our support service will reply to you in less than 24hours.'
        align='flex-start'
      /> */}
      <Typography className='content-text' paragraph>
        Talk to Us.Our support service will reply to you in less than 24hours.
      </Typography>
      <ContactMessage />
    </Box>
  );
}

export default ContactForm;
