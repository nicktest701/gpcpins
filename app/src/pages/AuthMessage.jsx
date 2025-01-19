import { useQuery, useQueryClient } from '@tanstack/react-query';
import {  useSearchParams, Navigate, Link } from 'react-router-dom';
import { verifyUserRegister } from '../api/userAPI';
import { Avatar, Container, Stack, Typography } from '@mui/material';
import { IMAGES } from '../constants';

function AuthMessage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const user = useQuery({
    queryKey: ['token'],
    queryFn: () =>
      verifyUserRegister({
        id: searchParams.get('id'),
        token: searchParams.get('token'),
      }),
    enabled: !!searchParams.get('id') && !!searchParams.get('token'),
    onSuccess:()=>{
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });

  if (!searchParams.get('id') && !searchParams.get('token')) {
    return <Navigate to='/' />;
  }

  return (
    <Container
      sx={{
        height: '100dvh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {user.isLoading && <Typography>Loading</Typography>}
      {user.isError && <Navigate to='/' />}

      {user.data && (
        <Stack
          sx={{
            minWidth: 300,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <Avatar
            src={IMAGES.success}
            sx={{
              width: 80,
              height: 80,
            }}
          />

          <Typography variant='h5' textAlign='center'>
            You have successfully completed registration !
          </Typography>

          <Link
            to='/'
            style={{
              backgroundColor: ' #083d77',
              color: '#fff',
              padding: '12px 15px',
              borderRadius: 5,
              textDecoration: 'none',
            }}
          >
            Go to Dashboard
          </Link>
        </Stack>
      )}
    </Container>
  );
}

export default AuthMessage;
