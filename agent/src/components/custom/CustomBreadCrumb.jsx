import { Box, Breadcrumbs, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function CustomBreadCrumb({ title, item }) {
  return (
    <Box bgcolor='secondary.main'>
      <Container
        maxWidth='lg'
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 1,
          gap: 1,
          color: 'secondary.contrastText',
        }}
      >
        <Typography variant='caption'>{title}</Typography>

        <Breadcrumbs sx={{ color: '#fff' }}>
          <Link className='breadcrumbs-links' to='/'>
            Home
          </Link>
          <Link className='breadcrumbs-links' to='/evoucher'>
            Vouchers & Tickets
          </Link>
          <Typography variant='caption' sx={{ color: '#fff' }}>
            {item}
          </Typography>
        </Breadcrumbs>
      </Container>
    </Box>
  );
}

export default CustomBreadCrumb;
