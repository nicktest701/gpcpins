import { Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import AnimatedWrapper from '../animations/AnimatedWrapper';

function MainTitle({ title, titleColor, subtitle, to, align, btn }) {
  return (
    <AnimatedWrapper>
      <Container
        maxWidth='md'
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: { xs: 'center', md: align || 'flex-end' },
          gap: 1,
          mb: 4,
        }}
      >
        <Typography
          variant='h3'
          color={titleColor || '#fff'}
          sx={{ textAlign: { xs: 'center' } }}
        >
          {title}
        </Typography>
        <Typography
          variant='body1'
          color='#f78e2a'
          sx={{ textAlign: { xs: 'center' } }}
        >
          {subtitle}
        </Typography>

        {to && (
          <Link to={to} className='home-btn'>
            {btn}
          </Link>
        )}
      </Container>
    </AnimatedWrapper>
  );
}

export default MainTitle;
