import { Box, Container, Typography } from '@mui/material';
import AnimatedContainer from '../../components/animations/AnimatedContainer';
import AnimatedView from '../../components/animations/AnimatedView';
import OrganizationSVG from './OrganizationSVG';
import { Link } from 'react-router-dom';
function Organization() {
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
            <OrganizationSVG width='500' height='550' />
          </Box>
        </AnimatedContainer>
        <AnimatedContainer delay={0.4}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='h5'
              className='content-title'
              color='primary.main'
            >
              WORK WITH US
            </Typography>
            <Typography variant='h2' className='content-subtitle'>
            we offer services to organizations
            </Typography>
            <Typography className='content-text' paragraph sx={{ mb: 6}}>
              As a leading provider of vouchers,tickets and airtime, We provide
              space for cooperate organizations who wish to work with us.
            </Typography>
            <Link className='primary-btn' to='/business'>Connect with us</Link>
          </Box>
        </AnimatedContainer>
      </Container>
    </AnimatedView>
  );
}

export default Organization;
