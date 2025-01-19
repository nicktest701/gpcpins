import { Box } from '@mui/material';
import TestimonialSwiper from './TestimonialSwiper';
import MainTitle from '../../components/custom/MainTitle';

function Testtimonials() {
  return (
    <Box
      sx={{
        bgcolor: 'secondary.main',
        py: 4,
      }}
    >
      <MainTitle
        title='Testimonials'
        subtitle=' What people says about us!'
        align='flex-start'
      />

      <TestimonialSwiper />
    </Box>
  );
}

export default Testtimonials;
