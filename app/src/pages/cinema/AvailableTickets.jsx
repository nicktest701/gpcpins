import { useState, useMemo, useRef } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Paper,
  Button,
  Skeleton,
  Alert,
  Stack,
  IconButton,
  Popper,
  Fade,
  ClickAwayListener,
  useTheme,
  alpha,
  CircularProgress,
  Grid,
} from "@mui/material";
import {
  Search,
  Clear,
  CalendarToday,
  Movie,
  ErrorOutline,
  Refresh,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { getCategoryByType } from "../../api/categoryAPI";
import AvailableCinemaTicketItem from "../../components/items/AvailableCinemaTicketItem";
import { format } from "date-fns";

const CHUNK_SIZE = 12; // items per "load more" step

function AvailableTickets() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [visibleCount, setVisibleCount] = useState(CHUNK_SIZE);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState([
    {
      startDate: null,
      endDate: null,
      key: "selection",
    },
  ]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const anchorRef = useRef(null);

  // Fetch all tickets (no pagination, high limit)
  const {
    data: allTickets = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["movie-category-all"],
    queryFn: () => getCategoryByType("cinema", 1, 9999), // fetch all
    keepPreviousData: false,
    initialData: () =>
      queryClient
        .getQueryData(["all-category"])
        ?.filter((voucher) => voucher?.category === "cinema") || [],
  });

  // Filter all tickets by search and date
  const filteredTickets = useMemo(() => {
    let filtered = [...allTickets];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      filtered = filtered.filter((ticket) =>
        ticket.name?.toLowerCase().includes(term),
      );
    }

    // Date range filter
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
  }, [allTickets, searchTerm, dateRange]);

  // Client-side pagination: slice the filtered list
  const displayedTickets = useMemo(() => {
    return filteredTickets.slice(0, visibleCount);
  }, [filteredTickets, visibleCount]);

  const hasMore = visibleCount < filteredTickets.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + CHUNK_SIZE);
  };

  const handleClearSearch = () => setSearchTerm("");
  const handleClearDateRange = () => {
    setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
    setDatePickerOpen(false);
  };

  // Reset visible count when filters change (so we start from the top)
  const resetFilters = () => {
    setVisibleCount(CHUNK_SIZE);
  };

  // When search or date changes, reset visible count
  useMemo(() => {
    resetFilters();
  }, [searchTerm, dateRange]);

  // ---------- RENDER ----------
  // Initial loading
  if (isLoading) {
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

  // Error state with icon
  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            textAlign: "center",

          }}
        >
          <ErrorOutline sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Oops! Something went wrong.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {error?.message || "Failed to load tickets. Please try again."}
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

  // Empty state (no tickets at all)
  if (allTickets.length === 0 && !isFetching) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Movie sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h5" color="text.secondary">
            No tickets available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Check back later for new movie listings.
          </Typography>
        </Box>
      </Container>
    );
  }

  // No results after filtering
  const showEmptyFilter =
    filteredTickets.length === 0 && allTickets.length > 0;

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
                "dd/MM/yy",
              )}`
            : "Select date range"}
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
          Showing {displayedTickets.length} of {filteredTickets.length} tickets
        </Typography>
      </Stack>

      {/* Ticket Grid */}
      {showEmptyFilter ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Movie sx={{ fontSize: 48, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No tickets match your filters
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(4, 1fr)",
              },
              gap: 3,
              mt: 2,
            }}
          >
            {displayedTickets.map((ticket) => (
              <AvailableCinemaTicketItem
                key={ticket.id}
                {...ticket}
                isLoading={isLoading}
              />
            ))}
          </Box>

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
  );
}

export default AvailableTickets;

// import { useState, useMemo } from "react";
// import {
//   Container,
//   Typography,
//   Grid,
//   Box,
//   TextField,
//   InputAdornment,
//   Paper,
//   Button,
//   Skeleton,
//   Alert,
//   Stack,
//   IconButton,
// } from "@mui/material";
// import { Search, Clear, CalendarToday } from "@mui/icons-material";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { DateRangePicker } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";
// import { getCategoryByType } from "../../api/categoryAPI";
// import AvailableCinemaTicketItem from "../../components/items/AvailableCinemaTicketItem";
// import { format } from "date-fns";

// const ITEMS_PER_PAGE = 12;

// function AvailableTickets() {
//   const queryClient = useQueryClient();
//   const [page, setPage] = useState(1);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showDatePicker, setShowDatePicker] = useState(false);
//   const [dateRange, setDateRange] = useState([
//     {
//       startDate: null,
//       endDate: null,
//       key: "selection",
//     },
//   ]);

//   // Fetch tickets (cinema category)
//   const {
//     data: tickets = [],
//     isLoading,
//     isError,
//     error,
//     refetch,
//   } = useQuery({
//     queryKey: ["movie-category", page],
//     queryFn: () => getCategoryByType("cinema", page),
//     keepPreviousData: true,
//     initialData: () =>
//       queryClient
//         .getQueryData(["all-category"])
//         ?.filter((voucher) => voucher?.category === "cinema") || [],
//   });

//   // Filter tickets: by search (name) and date range
//   const filteredTickets = useMemo(() => {
//     let filtered = [...tickets];

//     // Search filter
//     if (searchTerm.trim()) {
//       const term = searchTerm.trim().toLowerCase();
//       filtered = filtered.filter((ticket) =>
//         ticket.name?.toLowerCase().includes(term),
//       );
//     }

//     // Date range filter (based on createdAt)
//     const { startDate, endDate } = dateRange[0];
//     if (startDate && endDate) {
//       filtered = filtered.filter((ticket) => {
//         const ticketDate = new Date(ticket.createdAt);
//         return ticketDate >= startDate && ticketDate <= endDate;
//       });
//     } else if (startDate) {
//       filtered = filtered.filter(
//         (ticket) => new Date(ticket.createdAt) >= startDate,
//       );
//     } else if (endDate) {
//       filtered = filtered.filter(
//         (ticket) => new Date(ticket.createdAt) <= endDate,
//       );
//     }

//     return filtered;
//   }, [tickets, searchTerm, dateRange]);

//   const handleClearSearch = () => setSearchTerm("");
//   const handleClearDateRange = () => {
//     setDateRange([{ startDate: null, endDate: null, key: "selection" }]);
//     setShowDatePicker(false);
//   };

//   const handleLoadMore = () => {
//     if (!isLoading) setPage((prev) => prev + 1);
//   };

//   // Loading skeleton
//   if (isLoading && page === 1) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Typography variant="h4" fontWeight="bold" gutterBottom>
//           Available Tickets
//         </Typography>
//         <Grid container spacing={3}>
//           {[...Array(6)].map((_, i) => (
//             <Grid item xs={12} sm={6} md={4} key={i}>
//               <Skeleton
//                 variant="rectangular"
//                 height={200}
//                 sx={{ borderRadius: 2 }}
//               />
//               <Skeleton variant="text" sx={{ mt: 1 }} />
//               <Skeleton variant="text" width="60%" />
//             </Grid>
//           ))}
//         </Grid>
//       </Container>
//     );
//   }

//   if (isError) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 4 }}>
//         <Alert
//           severity="error"
//           action={
//             <Button color="inherit" size="small" onClick={() => refetch()}>
//               Retry
//             </Button>
//           }
//         >
//           {error?.message || "Failed to load tickets. Please try again."}
//         </Alert>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       {/* Header */}
//       <Typography variant="h4" fontWeight="bold" gutterBottom>
//         Available Tickets
//       </Typography>
//       <Typography variant="body2" color="text.secondary" paragraph>
//         Browse and book tickets for the latest movies
//       </Typography>

//       {/* Filters Bar */}
//       <Paper
//         elevation={2}
//         sx={{
//           p: 2,
//           mb: 4,
//           display: "flex",
//           flexDirection: { xs: "column", sm: "row" },
//           alignItems: "center",
//           gap: 2,
//         }}
//       >
//         {/* Search */}
//         <TextField
//           size="small"
//           placeholder="Search by ticket name..."
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           InputProps={{
//             startAdornment: (
//               <InputAdornment position="start">
//                 <Search fontSize="small" />
//               </InputAdornment>
//             ),
//             endAdornment: searchTerm && (
//               <InputAdornment position="end">
//                 <IconButton size="small" onClick={handleClearSearch}>
//                   <Clear fontSize="small" />
//                 </IconButton>
//               </InputAdornment>
//             ),
//           }}
//           sx={{ flex: 2 }}
//         />

//         {/* Date Range Picker Trigger */}
//         <Button
//           variant="outlined"
//           startIcon={<CalendarToday />}
//           onClick={() => setShowDatePicker(!showDatePicker)}
//           size="small"
//         >
//           {dateRange[0].startDate && dateRange[0].endDate
//             ? `${format(dateRange[0].startDate, "dd/MM/yy")} - ${format(
//                 dateRange[0].endDate,
//                 "dd/MM/yy",
//               )}`
//             : "Select date range"}
//         </Button>

//         {dateRange[0].startDate && (
//           <Button size="small" onClick={handleClearDateRange}>
//             Clear
//           </Button>
//         )}
//       </Paper>

//       {/* Date Picker Dropdown */}
//       {showDatePicker && (
//         <Paper sx={{ p: 2, mb: 4, display: "inline-block" }}>
//           <DateRangePicker
//             ranges={dateRange}
//             onChange={(item) => setDateRange([item.selection])}
//             moveRangeOnFirstSelection={false}
//             months={2}
//             direction="horizontal"
//           />
//         </Paper>
//       )}

//       {/* Ticket Grid */}
//       {filteredTickets.length === 0 ? (
//         <Box sx={{ textAlign: "center", py: 8 }}>
//           <Typography variant="h6" color="text.secondary">
//             No tickets found
//           </Typography>
//           <Typography variant="body2" color="text.secondary">
//             Try adjusting your search or date range.
//           </Typography>
//         </Box>
//       ) : (
//         <>
//           <Box
//             sx={{
//               display: "grid",
//               gridTemplateColumns: {
//                 xs: "1fr", // 1 column on mobile
//                 sm: "repeat(2, 1fr)", // 2 columns on tablet
//                 md: "repeat(3, 1fr)", // 3 columns on desktop
//                 lg: "repeat(4, 1fr)", // 4 columns on large screens
//               },
//               gap: 2, // spacing between items
//               mt: 2,
//             }}
//           >
//             {filteredTickets.map((ticket) => (
//               <AvailableCinemaTicketItem
//                 key={ticket.id}
//                 {...ticket}
//                 isLoading={isLoading}
//               />
//             ))}
//           </Box>

//           {/* Load More */}
//           {tickets.length >= ITEMS_PER_PAGE && (
//             <Stack alignItems="center" sx={{ mt: 4 }}>
//               <Button
//                 variant="contained"
//                 onClick={handleLoadMore}
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Loading..." : "Show More"}
//               </Button>
//             </Stack>
//           )}
//         </>
//       )}
//     </Container>
//   );
// }

// export default AvailableTickets;

// // import { Button, CircularProgress, Container, Typography } from '@mui/material';
// // import { useQuery, useQueryClient } from '@tanstack/react-query';
// // import { getCategoryByType } from '../../api/categoryAPI';
// // import AvailableCinemaTicketItem from '../../components/items/AvailableCinemaTicketItem';
// // import { useState } from 'react';

// // function AvailableTickets() {
// //   const [page, setPage] = useState(1);
// //   const queryClient = useQueryClient();

// //   const movieInfo = useQuery({
// //     queryKey: ['movie-category', page],
// //     queryFn: () => getCategoryByType('cinema', page),
// //     initialData: queryClient
// //       .getQueryData(['all-category'])
// //       ?.filter((voucher) => voucher?.category === 'cinema'),
// //     keepPreviousData: true,
// //   });

// //   const handlePageLoad = () => {
// //     if (!movieInfo.isPreviousData) {
// //       setPage(page + 1);
// //     }
// //   };

// //   if (movieInfo.isLoading) {
// //     return (
// //       <div
// //         style={{
// //           display: 'flex',
// //           justifyContent: 'center',
// //           alignItems: 'center',
// //           height: '100vh',
// //           backgroundColor: '#fff',
// //         }}
// //       >
// //         <CircularProgress />
// //       </div>
// //     );

// //   }

// //   return (
// //     <Container maxWidth='lg' sx={{ py: 8 }}>
// //       <Typography variant='h6' color='secondary' paragraph pb={2}>
// //         Available Tickets
// //       </Typography>

// //       {movieInfo.isError ? (
// //         <Typography display='block'>
// //           An unknown has occurred ! Couldn&apos;t Fetch tickets.Try refreshing your page...
// //         </Typography>
// //       ) : movieInfo?.data?.length > 0 ? (
// //         <Container
// //           sx={{
// //             display: 'grid',
// //             gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))',
// //             gap: 3,
// //             py: 2,
// //           }}
// //         >
// //           {movieInfo?.data?.map((movie) => {
// //             return <AvailableCinemaTicketItem key={movie?.id} {...movie} />;
// //           })}

// //           {movieInfo?.data?.length >= 10 && (
// //             <Button onClick={handlePageLoad}>Show more...</Button>
// //           )}
// //         </Container>
// //       ) : (
// //         <Typography textAlign='center'>No Ticket available</Typography>
// //       )}
// //     </Container>
// //   );
// // }

// // export default AvailableTickets;
