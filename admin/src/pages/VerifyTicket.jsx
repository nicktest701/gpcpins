import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyTransaction } from '../api/transactionAPI';
import {
  Chip,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const VerifyTicket = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get('XwnA') || !searchParams.get('bwhT')) {
      navigate('/');
      return;
    }
  }, [searchParams, navigate]);

  const ticket = useQuery({
    queryKey: ['ticket'],
    retry: 1,
    queryFn: () =>
      verifyTransaction(searchParams?.get('XwnA'), searchParams?.get('bwhT')),
    enabled: !!searchParams.get('XwnA') && !!searchParams.get('bwhT'),
  });

  return (
    <Container
      maxWidth='sm'
      sx={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* <Back/> */}
      {ticket.isLoading && (
        <Stack spacing={3}>
          <CircularProgress />
          <Typography>Verifying</Typography>
        </Stack>
      )}
      {ticket.isError && (
        <Stack spacing={3}>
          <Typography>{ticket?.error}</Typography>
          {/* <Button variant='contained' onClick={ticket.refetch}>
            Try again
          </Button> */}
        </Stack>
      )}

      {ticket.data && (
        <Stack
          spacing={1}
          justifyContent='center'
          alignItems='center'
          sx={{ border: '1px solid lightgray', p: 6, borderRadius: 2 }}
        >
          <img
            alt='movie album'
            src={`${BASE_URL}/images/cinema/${ticket?.data?.movieAlbum}`}
            style={{ width: '100px', height: '100px' }}
          />
          <Typography
            variant='caption'
            textTransform='uppercase'
            color='primary.main'
            fontWeight='bold'
          >
            {ticket?.data?.movie}
          </Typography>
          <Typography variant='caption'>
            {ticket?.data?.type} | {ticket?.data?.price}
          </Typography>
          <Chip label={ticket?.data?.status} color='info' />
          <Typography variant='caption'>{ticket?.data?.mobileNo}</Typography>
          <Typography variant='caption'>{ticket?.data?.email}</Typography>
        </Stack>
      )}
    </Container>
  );
};

export default VerifyTicket;
