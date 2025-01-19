import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import AboutSVG from './AboutSVG';
import AnimatedContainer from '../../components/animations/AnimatedContainer';
import AnimatedWrapper from '../../components/animations/AnimatedWrapper';
import AnimatedView from '../../components/animations/AnimatedView';
import WebHostingSVG from './WebHostingSVG';
import { Link } from 'react-router-dom';

function WebHosting() {
  return (
    <AnimatedView>
      <Container
        sx={{
          pt: 10,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'center',
          gap: '8rem',
        }}
      >
        <AnimatedContainer delay={0.6}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h5' className='content-title'  color='primary.main'>
              Want to host your web site?
            </Typography>
            <Typography variant='h2' className='content-subtitle'>
              We Offer space for small business to host their websites...
            </Typography>
            <Typography className='content-text' paragraph sx={{ mb: 6}}>
              We simplify your needs in one user-friendly platform. Trust us to
              deliver reliability, innovation, and a commitment to enhancing
              every aspect of your life.
            </Typography>
            <Link className='primary-btn' to='/hosting'>Talk To Us</Link>
          </Box>
        </AnimatedContainer>
        <AnimatedContainer delay={0.4}>
          <Box sx={{ flex: 1 }}>
            <WebHostingSVG width='500' height='550' />
          </Box>
        </AnimatedContainer>
      </Container>
    </AnimatedView>
  );
}

export default WebHosting;
