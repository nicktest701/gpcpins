import { Mail } from '@mui/icons-material';
import { Container, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

function RegisterMessage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state.email) {
      navigate('/');
    }
  }, [state, navigate]);

  return (
    <Container
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100dvh',
        gap: 3,
      }}
    >
      <Mail color='primary' sx={{ width: 60, height: 60 }} />
      <Typography variant='h4' color='green'>
        Email sent!
      </Typography>
      <Typography textAlign='center'>
        Registration email sent to{' '}
        <Typography component='span' fontWeight='bold'>
          {state?.email ?? ''}
        </Typography>{' '}
        Check your email inbox for instructions from us on how to complete your
        registration.
      </Typography>

      <Link to='/'>Go Back</Link>
    </Container>
  );
}

export default RegisterMessage;
