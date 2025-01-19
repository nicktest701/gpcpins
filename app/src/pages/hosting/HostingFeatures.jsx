import AnimatedContainer from '../../components/animations/AnimatedContainer';
import { Box, Container, Typography } from '@mui/material';
import AnimatedView from '../../components/animations/AnimatedView';

function HostingFeatures() {
  return (
    <AnimatedView>
   
      <Container
        sx={{
          py: 10,
          display: 'flex',
          flexDirection: { xs: 'column-reverse', md: 'row' },
          justifyContent: { xs: 'center', md: 'flex-start' },
          alignItems: 'center',
          gap: { xs: '4em', md: '8rem' },
        }}
      >
        {/* <div
          className='div'
          style={{
            width: 0,
            height: 0,
            borderStyle: ' solid',
            borderWidth: ' 100px 100px 0 0',
            borderColor:
              ' var(--secondary) transparent transparent transparent',
          }}
        ></div> */}

        <AnimatedContainer delay={0.2}>
          <Box sx={{ flex: 1 }}>
            {/* <HostingFeaturesSVG width='500' height='550' /> */}
          </Box>
        </AnimatedContainer>
        <AnimatedContainer delay={0.4}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='h5'
              className='content-title'
              color='primary.main'
            >
              hosting
            </Typography>
            <Typography variant='h2' className='content-subtitle'>
              Fast, secure and always online.
            </Typography>
            <Typography className='content-text' paragraph>
              Already have a website? Enjoy a reliable hosting experience with a
              guarantee of 99.9% uptime for your website.
            </Typography>
            <ul className='hosting-feature-list'>
              <li>Blazing Fast Speed</li>
              <li>Robust Security Measures</li>
              <li>Automatic Backups</li>
            </ul>
          </Box>
        </AnimatedContainer>
        {/* <div
          className='div'
          style={{
            width: 0,
            height: 0,
            borderStyle: ' solid',
            borderWidth: ' 100px 100px 0 0',
            borderColor: ' var(--primary) transparent transparent transparent',
          }}
        ></div> */}
      </Container>
    </AnimatedView>
  );
}

export default HostingFeatures;
