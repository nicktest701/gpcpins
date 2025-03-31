import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { SearchRounded, SportsFootballRounded } from '@mui/icons-material';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import StadiumTicketItem from './StadiumTicketItem';
import { getCategoryByType } from '../../api/categoryAPI';
import { useEffect, useState } from 'react';
import StadiumSearchList from './StadiumSearchList';
import { IMAGES } from '../../constants';
import AnimatedWrapper from '../../components/animations/AnimatedWrapper';

function StadiaTickets() {
  const [loaded, setLoaded] = useState(false);
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [openMatchSearch, setOpenMatchSearch] = useState(false);

 

  useEffect(() => {
    // Load the low-quality image initially
    const backgroundDiv = document.getElementById('background-div');
    backgroundDiv.style.background = `url(${IMAGES.football_low})`;

    // Create an image object for the original image
    const originalImage = new Image();
    originalImage.src = IMAGES.football;

    // Replace low-quality image with original image on load
    originalImage.onload = () => {
      backgroundDiv.style.backgroundImage = `url(${IMAGES.football})`;
      setLoaded(true);
    };
  }, []);

  const footballTickets = useQuery({
    queryKey: ['stadium', page],
    queryFn: () => getCategoryByType('stadium', page),
    initialData: queryClient
      .getQueryData(['all-category'])
      ?.filter((voucher) => voucher?.category === 'stadium'),
    keepPreviousData: true,
  });

  const openSearchView = () => setOpenMatchSearch(true);

  const handlePageLoad = () => {
    if (!footballTickets.isPreviousData) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', paddingBottom: 5 }}>
      <Box
        id='background-div'
        className={loaded ? 'loaded' : ''}
        sx={{
          width: '100%',
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography textAlign='center' variant='h4' color='#fff'>
          Get Your Football Ticket Now !!!
        </Typography>
        <div className='football-search'>
          <input
            type='text'
            placeholder='Search for match tickets...'
            onChange={openSearchView}
          />

          <Button
            variant='contained'
            sx={{
              width: { xs: '100%' },
            }}
            endIcon={<SearchRounded />}
          >
            Search
          </Button>
        </div>
      </Box>

      <Container sx={{ paddingY: 5 }}>
        <Stack
          width='100%'
          direction='row'
          justifyContent='flex-start'
          alignItems='center'
          spacing={2}
          bgcolor='secondary.main'
          color='secondary.contrastText'
          p={1}
        >
          <SportsFootballRounded />
          <Typography variant='h6'>Latest Football Tickets</Typography>
        </Stack>
        {footballTickets.isLoading ? (
          <Typography>Loading tickets. Please wait.....</Typography>
        ) : footballTickets.isError ? (
          <Typography>
            An error has occurred! Couldn&apos;t fetch football tickets
          </Typography>
        ) : footballTickets.data?.length === 0 ? (
          <Stack
            justifyContent='center'
            alignItems='center'
            width='100%'
            py={5}
            spacing={2}
          >
            <Typography>No football tickets available.</Typography>
          </Stack>
        ) : (
          <Container>
            {footballTickets?.data?.map((ticket) => {
              return (
                <AnimatedWrapper key={ticket?._id}>
                  <StadiumTicketItem {...ticket} />
                </AnimatedWrapper>
              );
            })}

            {footballTickets.isFetching && <Typography>Loading</Typography>}
            {footballTickets?.data?.length > 5 && (
              <Button onClick={handlePageLoad}>Show more...</Button>
            )}
          </Container>
        )}
      </Container>

      <StadiumSearchList open={openMatchSearch} setOpen={setOpenMatchSearch} />
    </div>
  );
}

export default StadiaTickets;
