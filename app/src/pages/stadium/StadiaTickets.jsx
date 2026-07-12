import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Skeleton,
  Alert,
  useTheme,
  alpha,
  CircularProgress,
  Popper,
  Fade,
  ClickAwayListener,
} from "@mui/material";
import {
  SearchRounded,
  SportsFootballRounded,
  Clear,
  CalendarToday,
  Refresh,
  ErrorOutline,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";
import { useState, useMemo, useRef } from "react";
import StadiumTicketCard from "./StadiumTicketCard";
import { getCategoryByType } from "@/api/categoryAPI";
import AnimatedWrapper from "@/components/animations/AnimatedWrapper";
import { IMAGES } from "@/constants";

const CHUNK_SIZE = 12;

function StadiaTickets() {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([
    { startDate: null, endDate: null, key: "selection" },
  ]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const anchorRef = useRef(null);

  // Pagination (client‑side)
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);

  // Fetch all stadium tickets
  const {
    data: allTickets = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["stadium-all"],
    queryFn: () => getCategoryByType("stadium", 1, 9999),
    keepPreviousData: false,
    initialData: () =>
      queryClient
        .getQueryData(["all-category"])
        ?.filter((voucher) => voucher?.category === "stadium") || [],
  });

  // Filter tickets by search and date
  const filteredTickets = useMemo(() => {
    let filtered = [...allTickets];

    // Search: match against home/away team names, venue, match type
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((ticket) => {
        const details = ticket.details || {};
        return (
          details.home?.toLowerCase().includes(term) ||
          details.away?.toLowerCase().includes(term) ||
          details.venue?.toLowerCase().includes(term) ||
          details.matchType?.toLowerCase().includes(term)
        );
      });
    }

    // Date range filter (using the match date field)
    const { startDate, endDate } = dateRange[0];
    if (startDate && endDate) {
      filtered = filtered.filter((ticket) => {
        const matchDate = new Date(ticket.details?.date);
        return matchDate >= startDate && matchDate <= endDate;
      });
    } else if (startDate) {
      filtered = filtered.filter(
        (ticket) => new Date(ticket.details?.date) >= startDate
      );
    } else if (endDate) {
      filtered = filtered.filter(
        (ticket) => new Date(ticket.details?.date) <= endDate
      );
    }

    return filtered;
  }, [allTickets, searchTerm, dateRange]);

  // Paginate the filtered list
  const displayedTickets = useMemo(
    () => filteredTickets.slice(0, visibleCount),
    [filteredTickets, visibleCount]
  );

  const hasMore = visibleCount < filteredTickets.length;

  // Reset visible count when filters change
  useMemo(() => {
    setVisibleCount(CHUNK_SIZE);
  }, [searchTerm, dateRange]);

  // Handlers
  const handleLoadMore = () => setVisibleCount((prev) => prev + CHUNK_SIZE);
  const handleClearSearch = () => setSearchTerm("");
  const handleClearDateRange = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setDatePickerOpen(false);
  };

  // ----- Render: Loading -----
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Football Tickets
        </Typography>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Skeleton
                variant="rectangular"
                height={200}
                sx={{ borderRadius: 2 }}
              />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  // ----- Render: Error -----
  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            border: `1px solid ${theme.palette.error.main}`,
          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {error?.message || "Failed to load football tickets. Please try again."}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // ----- Render: Empty state (no tickets at all) -----
  if (allTickets.length === 0 && !isFetching) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <SportsFootballRounded
            sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
          />
          <Typography variant="h5" color="text.secondary">
            No football matches available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for upcoming fixtures.
          </Typography>
        </Box>
      </Container>
    );
  }

  // ----- Main Render -----
  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          width: "100%",
          background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${IMAGES.football})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: { xs: "30vh", md: "40vh" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          color: "white",
          textAlign: "center",
          px: 2,
        }}
      >
        <SportsFootballRounded sx={{ fontSize: 48 }} />
        <Typography variant="h3" fontWeight="bold">
          Get Your Football Ticket Now!
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 600 }}>
          Browse and book tickets for the latest matches at your favourite stadiums.
        </Typography>
      </Box>

      {/* Tickets Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Filters Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 4,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: 2,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          }}
        >
          <TextField
            size="small"
            placeholder="Search by team, venue or match type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <Clear fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 2 }}
          />

          <Button
            ref={anchorRef}
            variant="outlined"
            startIcon={<CalendarToday />}
            onClick={() => setDatePickerOpen((prev) => !prev)}
            size="small"
            sx={{
              borderRadius: 2,
              borderColor: dateRange[0].startDate
                ? theme.palette.primary.main
                : undefined,
            }}
          >
            {dateRange[0].startDate && dateRange[0].endDate
              ? `${format(dateRange[0].startDate, "dd/MM/yy")} - ${format(
                  dateRange[0].endDate,
                  "dd/MM/yy"
                )}`
              : "Match date range"}
          </Button>

          {(searchTerm || dateRange[0].startDate) && (
            <Button size="small" onClick={handleClearDateRange} sx={{ ml: "auto" }}>
              Clear filters
            </Button>
          )}
        </Paper>

        {/* Date Picker Popper */}
        <Popper
          open={datePickerOpen}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <ClickAwayListener onClickAway={() => setDatePickerOpen(false)}>
              <Fade {...TransitionProps} timeout={200}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 2,
                    mt: 1,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
                    boxShadow: theme.shadows[8],
                  }}
                >
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    direction="horizontal"
                    showDateDisplay={false}
                  />
                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button size="small" onClick={() => setDatePickerOpen(false)}>
                      Close
                    </Button>
                  </Box>
                </Paper>
              </Fade>
            </ClickAwayListener>
          )}
        </Popper>

        {/* Results count */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {displayedTickets.length} of {filteredTickets.length} matches
          </Typography>
        </Stack>

        {/* No results after filtering */}
        {filteredTickets.length === 0 && allTickets.length > 0 ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <SportsFootballRounded
              sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No matches match your filters
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your search or date range.
            </Typography>
            <Button variant="text" onClick={handleClearDateRange} sx={{ mt: 2 }}>
              Clear all filters
            </Button>
          </Box>
        ) : (
          <>
            {/* Ticket Grid */}
            <Grid container spacing={3}>
              {displayedTickets.map((ticket) => (
                <Grid item xs={12} sm={6} md={4} key={ticket.id}>
                  <AnimatedWrapper>
                    <StadiumTicketCard {...ticket} />
                  </AnimatedWrapper>
                </Grid>
              ))}
            </Grid>

            {/* Load More */}
            {hasMore && (
              <Stack alignItems="center" sx={{ mt: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleLoadMore}
                  disabled={isFetching}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                >
                  {isFetching ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading...
                    </>
                  ) : (
                    `Show More (${filteredTickets.length - visibleCount} left)`
                  )}
                </Button>
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default StadiaTickets;

// import { Box, Button, Container, Stack, Typography } from '@mui/material';
// import { SearchRounded, SportsFootballRounded } from '@mui/icons-material';
// import { useQuery, useQueryClient } from '@tanstack/react-query';

// import StadiumTicketItem from './StadiumTicketItem';
// import { getCategoryByType } from '@/api/categoryAPI';
// import { useEffect, useState } from 'react';
// import StadiumSearchList from './StadiumSearchList';
// import { IMAGES } from '@/constants';
// import AnimatedWrapper from '@/components/animations/AnimatedWrapper';

// function StadiaTickets() {
//   const [loaded, setLoaded] = useState(false);
//   const queryClient = useQueryClient();
//   const [page, setPage] = useState(1);
//   const [openMatchSearch, setOpenMatchSearch] = useState(false);

 

//   useEffect(() => {
//     // Load the low-quality image initially
//     const backgroundDiv = document.getElementById('background-div');
//     backgroundDiv.style.background = `url(${IMAGES.football_low})`;

//     // Create an image object for the original image
//     const originalImage = new Image();
//     originalImage.src = IMAGES.football;

//     // Replace low-quality image with original image on load
//     originalImage.onload = () => {
//       backgroundDiv.style.backgroundImage = `url(${IMAGES.football})`;
//       setLoaded(true);
//     };
//   }, []);

//   const footballTickets = useQuery({
//     queryKey: ['stadium', page],
//     queryFn: () => getCategoryByType('stadium', page),
//     initialData: queryClient
//       .getQueryData(['all-category'])
//       ?.filter((voucher) => voucher?.category === 'stadium'),
//     keepPreviousData: true,
//   });

//   const openSearchView = () => setOpenMatchSearch(true);

//   const handlePageLoad = () => {
//     if (!footballTickets.isPreviousData) {
//       setPage((prev) => prev + 1);
//     }
//   };


//   return (
//     <div style={{ minHeight: '100vh', width: '100vw', paddingBottom: 5 }}>
//       <Box
//         id='background-div'
//         className={loaded ? 'loaded' : ''}
//         sx={{
//           width: '100%',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center right',
//           minHeight: '60vh',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           alignItems: 'center',
//           gap: 2,
//         }}
//       >
//         <Typography textAlign='center' variant='h4' color='#fff'>
//           Get Your Football Ticket Now !!!
//         </Typography>
  
//       </Box>

//       <Container sx={{ paddingY: 5 }}>
//       <Box className='football-search'>
//           <input
//             type='text'
//             placeholder='Search for match tickets...'
//             onChange={openSearchView}
//           />

//           <Button
//             variant='contained'
//             sx={{
//               width: { xs: '100%' },
//             }}
//             endIcon={<SearchRounded />}
//           >
//             Search
//           </Button>
//         </Box>


//         <Stack
//           width='100%'
//           direction='row'
//           justifyContent='flex-start'
//           alignItems='center'
//           spacing={2}
//           bgcolor='secondary.main'
//           color='secondary.contrastText'
//           p={1}
//         >
//           <SportsFootballRounded />
//           <Typography variant='h6'>Latest Football Tickets</Typography>
//         </Stack>
//         {footballTickets.isLoading ? (
//           <Typography>Loading tickets. Please wait.....</Typography>
//         ) : footballTickets.isError ? (
//           <Typography>
//             An error has occurred! Couldn&apos;t fetch football tickets
//           </Typography>
//         ) : footballTickets.data?.length === 0 ? (
//           <Stack
//             justifyContent='center'
//             alignItems='center'
//             width='100%'
//             py={5}
//             spacing={2}
//           >
//             <Typography>No football tickets available.</Typography>
//           </Stack>
//         ) : (
//           <Container>
//             {footballTickets?.data?.map((ticket) => {
//               return (
//                 <AnimatedWrapper key={ticket?.id}>
//                   <StadiumTicketItem {...ticket} />
//                 </AnimatedWrapper>
//               );
//             })}

//             {footballTickets.isFetching && <Typography>Loading</Typography>}
//             {footballTickets?.data?.length > 5 && (
//               <Button onClick={handlePageLoad}>Show more...</Button>
//             )}
//           </Container>
//         )}
//       </Container>

//       {/* <StadiumSearchList open={openMatchSearch} setOpen={setOpenMatchSearch} /> */}
//     </div>
//   );
// }

// export default StadiaTickets;
