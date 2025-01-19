import { Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import { SwiperSlide } from 'swiper/react';

function SwiperContent({ title, content, bgImage, path, btnText, color }) {
  const {
    palette: { primary },
    typography: { button },
  } = useTheme();

  return (
    <SwiperSlide className='swiper-slide'>
      <div className='swiper-content'>
        <Typography paragraph variant='h2' color={color}>
          {title}
        </Typography>
        <Typography variant='body1' paragraph color={color}>
          {content}
        </Typography>

        <Link
          to={path}
          style={{
            backgroundColor: primary.main,
            color: '#fff',
            padding: '10px 20px',
            borderRadius: 5,
            textDecoration: 'none',
            // fontSize: button.fontSize,
            // fontFamily: button.fontFamily,
            
          }}
        >
          {btnText}
        </Link>
      </div>
      <img src={bgImage} alt='swiper-img' />
    </SwiperSlide>
  );
}
export default SwiperContent;
