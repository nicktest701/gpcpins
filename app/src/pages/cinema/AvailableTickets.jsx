import { useState, useMemo } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Skeleton,
  Alert,
  Stack,
  IconButton,
} from "@mui/material";
import { Search, Clear, CalendarToday } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getCategoryByType } from "../../api/categoryAPI";
import AvailableCinemaTicketItem from "../../components/items/AvailableCinemaTicketItem";
import { format } from "date-fns";

const ITEMS_PER_PAGE = 12;

function AvailableTickets() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);

  // Fetch tickets (cinema category)
  const {
    data: tickets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["movie-category", page],
    queryFn: () => getCategoryByType("cinema", page),
    keepPreviousData: true,
    initialData: () =>
      queryClient
        .getQueryData(["all-category"])
        ?.filter((voucher) => voucher?.category === "cinema") || [],
  });

  // Filter tickets: by search (name) and date range
  const filteredTickets = useMemo(() => {
    let filtered = [...tickets];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((ticket) =>
        ticket.name?.toLowerCase().includes(term),
      );
    }

    // Date range filter (based on createdAt)
    const { startDate, endDate } = dateRange[0];
    if (startDate && endDate) {
      filtered = filtered.filter((ticket) => {
        const ticketDate = new Date(ticket.createdAt);
        return ticketDate >= startDate && ticketDate <= endDate;
      });
    } else if (startDate) {
      filtered = filtered.filter(
        (ticket) => new Date(ticket.createdAt) >= startDate,
      );
    } else if (endDate) {
      filtered = filtered.filter(
        (ticket) => new Date(ticket.createdAt) <= endDate,
      );
    }

    return filtered;
  }, [tickets, searchTerm, dateRange]);

  const handleClearSearch = () => setSearchTerm("");
  const handleClearDateRange = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setShowDatePicker(false);
  };

  const handleLoadMore = () => {
    if (!isLoading) setPage((prev) => prev + 1);
  };

  // Loading skeleton
  if (isLoading && page === 1) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Available Tickets
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

  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {error?.message || "Failed to load tickets. Please try again."}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Available Tickets
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Browse and book tickets for the latest movies
      </Typography>

      {/* Filters Bar */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by ticket name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
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

        {/* Date Range Picker Trigger */}
        <Button
          variant="outlined"
          startIcon={<CalendarToday />}
          onClick={() => setShowDatePicker(!showDatePicker)}
          size="small"
        >
          {dateRange[0].startDate && dateRange[0].endDate
            ? `${format(dateRange[0].startDate, "dd/MM/yy")} - ${format(
                dateRange[0].endDate,
                "dd/MM/yy",
              )}`
            : "Select date range"}
        </Button>

        {dateRange[0].startDate && (
          <Button size="small" onClick={handleClearDateRange}>
            Clear
          </Button>
        )}
      </Paper>

      {/* Date Picker Dropdown */}
      {showDatePicker && (
        <Paper sx={{ p: 2, mb: 4, display: "inline-block" }}>
          <DateRangePicker
            ranges={dateRange}
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            months={2}
            direction="horizontal"
          />
        </Paper>
      )}

      {/* Ticket Grid */}
      {filteredTickets.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tickets found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search or date range.
          </Typography>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr", // 1 column on mobile
                sm: "repeat(2, 1fr)", // 2 columns on tablet
                md: "repeat(3, 1fr)", // 3 columns on desktop
                lg: "repeat(4, 1fr)", // 4 columns on large screens
              },
              gap: 2, // spacing between items
              mt: 2,
            }}
          >
            {filteredTickets.map((ticket) => (
              <AvailableCinemaTicketItem
                key={ticket.id}
                {...ticket}
                isLoading={isLoading}
              />
            ))}
          </Box>

          {/* Load More */}
          {tickets.length >= ITEMS_PER_PAGE && (
            <Stack alignItems="center" sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Show More"}
              </Button>
            </Stack>
          )}
        </>
      )}
    </Container>
  );
}

export default AvailableTickets;

// import { Button, CircularProgress, Container, Typography } from '@mui/material';
// import { useQuery, useQueryClient } from '@tanstack/react-query';
// import { getCategoryByType } from '../../api/categoryAPI';
// import AvailableCinemaTicketItem from '../../components/items/AvailableCinemaTicketItem';
// import { useState } from 'react';

// function AvailableTickets() {
//   const [page, setPage] = useState(1);
//   const queryClient = useQueryClient();

//   const movieInfo = useQuery({
//     queryKey: ['movie-category', page],
//     queryFn: () => getCategoryByType('cinema', page),
//     initialData: queryClient
//       .getQueryData(['all-category'])
//       ?.filter((voucher) => voucher?.category === 'cinema'),
//     keepPreviousData: true,
//   });

//   const handlePageLoad = () => {
//     if (!movieInfo.isPreviousData) {
//       setPage(page + 1);
//     }
//   };

//   if (movieInfo.isLoading) {
//     return (
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           height: '100vh',
//           backgroundColor: '#fff',
//         }}
//       >
//         <CircularProgress />
//       </div>
//     );

//   }

//   return (
//     <Container maxWidth='lg' sx={{ py: 8 }}>
//       <Typography variant='h6' color='secondary' paragraph pb={2}>
//         Available Tickets
//       </Typography>

//       {movieInfo.isError ? (
//         <Typography display='block'>
//           An unknown has occurred ! Couldn&apos;t Fetch tickets.Try refreshing your page...
//         </Typography>
//       ) : movieInfo?.data?.length > 0 ? (
//         <Container
//           sx={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
//             gap: 3,
//             py: 2,
//           }}
//         >
//           {movieInfo?.data?.map((movie) => {
//             return <AvailableCinemaTicketItem key={movie?.id} {...movie} />;
//           })}

//           {movieInfo?.data?.length >= 10 && (
//             <Button onClick={handlePageLoad}>Show more...</Button>
//           )}
//         </Container>
//       ) : (
//         <Typography textAlign='center'>No Ticket available</Typography>
//       )}
//     </Container>
//   );
// }

// export default AvailableTickets;
