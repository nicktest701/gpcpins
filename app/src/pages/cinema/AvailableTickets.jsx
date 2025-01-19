import { Button, CircularProgress, Container, Typography } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategoryByType } from '../../api/categoryAPI';
import AvailableCinemaTicketItem from '../../components/items/AvailableCinemaTicketItem';
import { useState } from 'react';


function AvailableTickets() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();


  const movieInfo = useQuery({
    queryKey: ['movie-category', page],
    queryFn: () => getCategoryByType('cinema', page),
    initialData: queryClient
      .getQueryData(['all-category'])
      ?.filter((voucher) => voucher?.category === 'cinema'),
    keepPreviousData: true,
  });

  const handlePageLoad = () => {
    if (!movieInfo.isPreviousData) {
      setPage(page + 1);
    }
  };

  if (movieInfo.isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff',
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <Container maxWidth='lg' sx={{ py: 8 }}>
      <Typography variant='h6' color='secondary' paragraph pb={2}>
        Available Tickets
      </Typography>

      {movieInfo.isError ? (
        <Typography display='block'>
          An unknown has occurred ! Couldn&apos;t Fetch tickets.Try refreshing your page...
        </Typography>
      ) : movieInfo?.data?.length > 0 ? (
        <Container
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
            gap: 3,
            py: 2,
          }}
        >
          {movieInfo?.data?.map((movie) => {
            return <AvailableCinemaTicketItem key={movie?._id} {...movie} />;
          })}

       
          {movieInfo?.data?.length >= 10 && (
            <Button onClick={handlePageLoad}>Show more...</Button>
          )}
        </Container>
      ) : (
        <Typography textAlign='center'>No Ticket available</Typography>
      )}
    </Container>
  );
}

export default AvailableTickets;
