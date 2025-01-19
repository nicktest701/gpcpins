import Container from '@mui/material/Container';
import ShopCard from '../../components/ShopCard';
import { IMAGES } from '../../constants';
import { Box } from '@mui/material';
import MainTitle from '../../components/custom/MainTitle';
import AnimatedWrapper from '../../components/animations/AnimatedWrapper';

const homeCardArr = [
  {
    id: 1,
    title: 'E-VOUCHERS & TICKETS',
    img: IMAGES.checker,
    low: IMAGES.ges_low,
    content:
      'We offer flexiblity with our e-vouchers and Tickets.Buy WAEC Exams Vouchers,University E-Vouchers,Bus Tickets,etc',
    path: 'evoucher',
    delay: 50,
  },
  {
    id: 2,
    title: 'PREPAID UNITS',
    img: IMAGES.ecg,
    low: IMAGES.ecg_low,
    content:
      'Buy your prepaid units here and stay powered up and have seamless access to electricity whenever you need it! ',
    path: 'electricity',
    delay: 100,
  },
  {
    id: 3,
    title: "AIRTIME & DATA BUNDLE",
    img: IMAGES.airtime,
    low: IMAGES.airtime_low,
    content:
      "Buy airtime and data bundle from us.Stay connected and enjoy seamless communication with our reliable airtime solutions",
    path: 'airtime',
    delay: 150,
  },
];

function Service() {
  return (
    <Container maxWidth='lg' sx={{ pt: 10 }} id='explore-more'>
      <MainTitle
        title='Our Services'
        titleColor='primary.main'
        subtitle=' We provide the best service you can get on the market today!'
        align='center'
      />
      <AnimatedWrapper delay={0.1}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))',
            gap: 4,
            paddingY: 4,
            backgroundColor: '#fff',
          }}
        >
          {homeCardArr.map((home) => (
            <ShopCard {...home} key={home.id} dashboard={true} />
          ))}
        </Box>
      </AnimatedWrapper>
    </Container>
  );
}

export default Service;
