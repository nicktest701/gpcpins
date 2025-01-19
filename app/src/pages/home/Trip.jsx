import { Box } from '@mui/material';
import { IMAGES } from '../../constants';
import MainTitle from '../../components/custom/MainTitle';
import AnimatedContainer from '../../components/animations/AnimatedContainer';

function Trip() {
  return (
    <AnimatedContainer delay={0.1}>
      <Box
        sx={{
          py: 10,
          backgroundColor: 'secondary.main',
        }}
      >
        <MainTitle
          title=' Start Planning your Trip now'
          subtitle='  We provide the best tickets to enlighten your travelling experiences'
          subtitleColor='#fff'
          to='/evoucher/bus-ticket'
          btn='Buy Now'
          align='center'
        />
      </Box>
    </AnimatedContainer>
  );
}

export default Trip;
