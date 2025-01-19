import { Container, Stack, Typography } from '@mui/material';
import { Link, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PayLoading from '../components/PayLoading';
import { IMAGES } from '../constants';
import { verifyAgent } from '../api/agentAPI';

function VerifyAgent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isLoading, isError } = useQuery({
    queryKey: [
      'employee-verify',
      searchParams.get('id'),
      searchParams.get('token'),
    ],
    queryFn: () =>
      verifyAgent({
        id: searchParams.get('id'),
        token: searchParams.get('token'),
      }),
    enabled: !!searchParams.get('id') && !!searchParams.get('token'),
    onSuccess: (data) => {
      navigate('/auth/confirm', {
        state: {
          id: data?.user?.id,
          success:"Email Address Verified!"
        },
      });
    },
  });

  if (!searchParams.get('id') || !searchParams.get('token'))
    return <Navigate to='/auth/login' />;

  return (
    <Container
      maxWidth='xs'
      sx={{ height: '80svh', display: 'grid', placeItems: 'center' }}
    >
      <Stack spacing={4} justifyContent='center' alignItems='center' p={2}>
        {isLoading ? (
          <PayLoading />
        ) : isError ? (
          <Typography>
            Registration was not successful.An error has occurred.
          </Typography>
        ) : (
          <>
            <img
              src={IMAGES.success}
              alt='success'
              style={{
                width: 100,
                height: 100,
                objectFit: 'contain',
              }}
            />
            <Typography textAlign='center' variant='body2'>
              Registration Complete.Your account has been verified!
            </Typography>
            <Link
              to='/'
              style={{
                backgroundColor: 'green',
                color: '#fff',
                textDecoration: 'none',
                padding: '10px 15px',
                borderRadius: '4px',
              }}
            >
              Done
            </Link>
            {/* <Navigate to='/auth/confirm' />; */}
          </>
        )}
      </Stack>
    </Container>
  );
}

export default VerifyAgent;
