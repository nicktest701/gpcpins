import React from 'react';
import HostingLandingPageSVG from './HostingLandingPageSVG';
import AnimatedContainer from '../../components/animations/AnimatedContainer';
import { Box, Container, Typography } from '@mui/material';
import AnimatedView from '../../components/animations/AnimatedView';

function HostingLandpage() {
  return (
    <AnimatedView>
      <Container
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'center',
          gap: { xs: '4em', md: '8rem' },
        }}
      >
        <AnimatedContainer delay={0.4}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='h1'
              className='content-title'
              color='primary.main'
            >
              Secure Hosting Hub
            </Typography>
            <Typography variant='h2' className='content-subtitle'>
              Empowering Your Business with Reliable Web Hosting
            </Typography>
            <Typography className='content-text'>
              We are dedicated to providing high-performance web hosting
              solutions tailored to meet the unique needs of businesses and
              individuals.
            </Typography>
          </Box>
        </AnimatedContainer>
        <AnimatedContainer delay={0.2}>
          <Box sx={{ flex: 1 }}>
            <HostingLandingPageSVG width='500' height='550' />
          </Box>
        </AnimatedContainer>
      </Container>
    </AnimatedView>
  );
}

export default HostingLandpage;
