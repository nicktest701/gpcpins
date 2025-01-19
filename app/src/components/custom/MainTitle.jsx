import { Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

import AnimatedWrapper from '../animations/AnimatedWrapper';

function MainTitle({
  title,
  titleColor,
  subtitle,
  subtitleColor,
  to,
  align,
  btn,
}) {
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
          sx={{ textAlign: { xs: 'center' }, color: titleColor || '#f78e2a' }}
          className='content-title'
        >
          {title}
        </Typography>
        <Typography
          variant='h2'
          className='content-subtitle'
          sx={{
            textAlign: { xs: 'center' },
            color: subtitleColor || 'secondary.main',
          }}
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
