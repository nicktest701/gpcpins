import Container from '@mui/material/Container';
import ShopCard from './ShopCard';
import { IMAGES } from '../constants';
import { Box } from '@mui/material';
import MainTitle from './custom/MainTitle';
import AnimatedWrapper from './animations/AnimatedWrapper';

const homeCardArr = [
  {
    id: 1,
    title: 'E-VOUCHERS & TICKETS',
    img: IMAGES.ges,
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
    title: "BULK AIRTIMES & EVD's",
    img: IMAGES.airtime,
    low: IMAGES.airtime_low,
    content:
      "Buy airtime and EVD's from us.Stay connected and enjoy seamless communication with our reliable airtime solutions",
    path: 'airtime',
    delay: 150,
  },
];

function HomeCards() {
  return (
    <Container
      maxWidth='lg'
      sx={{ paddingY: 8, paddingX: { xs: 4 }, backgroundColor: '#fff' }}
      id='explore-more'
    >
      <MainTitle
        title='Our Services'
        titleColor='secondary'
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

export default HomeCards;
