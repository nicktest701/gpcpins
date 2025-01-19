import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import AboutSVG from './AboutSVG';
import AnimatedContainer from '../../components/animations/AnimatedContainer';
import AnimatedWrapper from '../../components/animations/AnimatedWrapper';
import AnimatedView from '../../components/animations/AnimatedView';

function About() {
  return (
    <AnimatedView>
      <Container
        sx={{
          pt: 10,
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'center',
          gap: { xs: '4em', md: '8rem' },
        }}
      >
        <AnimatedContainer delay={0.2}>
          <Box sx={{ flex: 1 }}>
            <AboutSVG width='500' height='550' />
          </Box>
        </AnimatedContainer>
        <AnimatedContainer delay={0.4}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='h5'
              className='content-title'
              color='primary.main'
            >
              WHY GPC
            </Typography>
            <Typography variant='h2' className='content-subtitle'>
              From diverse vouchers for personalized gifting to seamless
              ticketing!
            </Typography>
            <Typography className='content-text'>
              We simplify your needs in one user-friendly platform. Trust us to
              deliver reliability, innovation, and a commitment to enhancing
              every aspect of your life.
            </Typography>
          </Box>
        </AnimatedContainer>
      </Container>
    </AnimatedView>
  );
}

export default About;
