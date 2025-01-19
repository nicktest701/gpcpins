import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y, Scrollbar } from 'swiper';
import { EffectFade } from 'swiper';

// Styles must use direct files imports
import 'swiper/css/bundle';
import 'swiper/css'; // core Swiper
import 'swiper/css/navigation';
import 'swiper/css/scrollbar';
import 'swiper/css/pagination';
import { Container, Typography, useTheme } from '@mui/material';

const HOME_CONTENT = [
  {
    id: 1,
    title: 'Gab Powerful Consult',
    content:
      'We provide you the best voucher and electricty services you can get across the globe!',
    bgImage: null,
    btnText: 'Explore More',
    color: 'primary.contrastText',
  },
  {
    id: 2,
    title: 'Prepaid Units',
    content: 'Buy your prepaid units at a faster rate',
    bgImage: null,
    path: '/electricity',
    btnText: 'Buy Now',
    color: 'primary.contrastText',
  },
  {
    id: 3,
    title: 'Evoucher & Tickets',
    content:
      'All sorts of application vouchers and tickets ranginging from waec exams vouchers,shs placement,bus tickets,etc',
    bgImage: null,
    path: '/evoucher',
    btnText: 'Buy Now',
    color: 'primary.contrastText',
  },
];

function TestimonialSwiper() {
  const { palette } = useTheme();
  return (
    <Swiper
      effect='fade'
      modules={[Autoplay, Pagination, Navigation, A11y, Scrollbar, EffectFade]}
      speed={2000}
      spaceBetween={30}
      centeredSlides={true}
      loop
      autoplay={{
        delay: 5000,
      }}
      pagination={{
        clickable: true,
      }}
      // navigation={true}
      style={{ height: '300px', paddingTop: '24px' }}
    >
      {HOME_CONTENT.map(({ id, title, content, color, bgImage }) => (
        <SwiperSlide
          key={id}
          style={{ backgroundColor: palette.secondary.main, height: '100%' }}
        >
          <Container
            maxWidth='md'
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              paddingTop: '20px',
            }}
          >
            {/* <img
              src={bgImage}
              style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              alt='swiper-img'
            /> */}
            <Typography paragraph color={color}>
              <span style={{ fontSize: '2rem' }}> &lsquo;</span>
              <span> {content}</span>
              <span style={{ fontSize: '2rem' }}>&rsquo;</span>
            </Typography>
            <Typography
              width='inherit'
              paragraph
              color='#f78e2a'
              textAlign={{xs:'center',md:'right'}}
            >
              {title}
            </Typography>
          </Container>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default TestimonialSwiper;
