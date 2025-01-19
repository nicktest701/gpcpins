import { Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        height: '100svh',
      }}
    >
      <Typography sx={{ fontSize: '120px' }}>404</Typography>
      <Typography>Requested page not found.</Typography>
      <Link to='/'>Go home</Link>
    </Container>
  );
}

export default NotFound;
