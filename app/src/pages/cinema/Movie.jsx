import { useContext, useMemo } from "react";
import moment from "moment";
import {

  Event,
  AccessTime,
  Theaters,
} from "@mui/icons-material";
import {
  Container,
  Box,
  Typography,
  Stack,
  Divider,
  Skeleton,
  Alert,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import _ from "lodash";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Back from "../../components/Back";
import MovieItem from "./MovieItem";
import { CustomContext } from "../../context/providers/CustomProvider";
import { currencyFormatter } from "../../constants";
import { getCategory } from "../../api/categoryAPI";
import { getAllRemainingTickets } from "../../api/voucherAPI";

function Movie() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const {
    customState: { cinemaTicketTotal },
  } = useContext(CustomContext);

  // Fetch movie details
  const {
    data: movie,
    isLoading: movieLoading,
    isError: movieError,
  } = useQuery({
    queryKey: ["movie-category", id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?._id === id),
    enabled: !!id,
  });

  // Fetch remaining tickets (quantities)
  const {
    data: remainingTickets,
    isLoading: ticketsLoading,
    isError: ticketsError,
  } = useQuery({
    queryKey: ["remaining-movie-ticket", id],
    queryFn: () => getAllRemainingTickets(id),
    enabled: !!id,
  });

  const totalItemsSelected = useMemo(
    () => _.sumBy(cinemaTicketTotal, "quantity"),
    [cinemaTicketTotal],
  );
  const totalPrice = useMemo(
    () => _.sumBy(cinemaTicketTotal, "total"),
    [cinemaTicketTotal],
  );

  const handleCheckout = () => {
    navigate("buy", {
      state: {
        movieInfo: {
          id: movie?._id,
          voucherType: movie?.voucherType,
          movie: movie?.details?.movie,
          cinema: movie?.details?.cinema,
          time: movie?.details?.time,
          date: movie?.details?.date,
        },
      },
    });
  };

  // Loading state
  if (movieLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton
            variant="rectangular"
            height={300}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="text"
            width="60%"
            height={40}
            sx={{ mx: "auto" }}
          />
          <Skeleton
            variant="text"
            width="80%"
            height={80}
            sx={{ mx: "auto" }}
          />
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 2 }}
          />
        </Stack>
      </Container>
    );
  }

  // Error state
  if (movieError || !movie) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Could not load movie details. Please try again later.
        </Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const { details } = movie;
  const pricing = details?.pricing || [];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "40vh", sm: "50vh", md: "60vh" },
          backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.3) 100%), url(${details?.cinema})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          p: 2,
        }}
      >
        <Back color="primary" bg="rgba(255,255,255,0.2)" />
        {/* Optionally add a gradient overlay text here */}
      </Box>

      <Container maxWidth="lg" sx={{ position: "relative", mt: -6, pb: 12 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            p: { xs: 2, sm: 4 },
          }}
        >
          <Stack spacing={3}>
            {/* Title */}
            <Typography
              variant="h3"
              component="h1"
              fontWeight="bold"
              textAlign="center"
              sx={{ fontSize: { xs: "1.75rem", sm: "2.5rem" } }}
            >
              {details?.movie}
            </Typography>

            {/* Movie details row */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="center"
              spacing={{ xs: 2, sm: 4 }}
              divider={<Divider orientation="vertical" flexItem />}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Theaters color="primary" />
                <Typography variant="body2">
                  {details?.theatre} – {details?.location}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Event color="primary" />
                <Typography variant="body2">
                  {moment(details?.date).format("dddd, Do MMMM YYYY")}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1}>
                <AccessTime color="primary" />
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {moment(details?.time).format("h:mm a")}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            {/* Description */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                color="primary"
                gutterBottom
              >
                Synopsis
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.6 }}
              >
                {details?.description || "No description available."}
              </Typography>
            </Box>

            <Divider />

            {totalItemsSelected > 0 && (
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  alignItems="center"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Button
                    variant="contained"
                    color="secondary"
                    size={isMobile ? "small" : "medium"}
                    onClick={handleCheckout}
                    sx={{ minWidth: 120 }}
                  >
                    Checkout
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Ticket Pricing Section */}
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Select Tickets
            </Typography>

            {ticketsLoading ? (
              <Stack spacing={2}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton
                    key={i}
                    variant="rectangular"
                    height={80}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
              </Stack>
            ) : ticketsError ? (
              <Alert severity="error">
                Failed to load ticket availability.
              </Alert>
            ) : pricing.length === 0 ? (
              <Alert severity="info">
                No ticket types available for this movie.
              </Alert>
            ) : (
              <Stack spacing={2}>
                {pricing.map((seat) => (
                  <MovieItem
                    key={seat.id}
                    type={seat.type}
                    price={seat.price}
                    remainingQuantity={remainingTickets?.[seat.type] ?? 0}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      </Container>

      {/* Floating Cart Bar (mobile & desktop) */}
      {totalItemsSelected > 0 && (
        <Paper
          elevation={6}
          sx={{
            position: "fixed",
            bottom: isMobile ? 60 : 0,
            left: 0,
            right: 0,
            p: 2,
            bgcolor: "primary.dark",
            color: "white",
            zIndex: 1100,
            borderRadius: 0,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <Typography variant="body2" sx={{ color: "white" }}>
              {totalItemsSelected} ticket{totalItemsSelected !== 1 ? "s" : ""}{" "}
              selected
            </Typography>
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{ color: "common.white" }}
            >
              {currencyFormatter(totalPrice)}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size={isMobile ? "small" : "medium"}
              onClick={handleCheckout}
              sx={{ minWidth: 120 }}
            >
              Checkout
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

export default Movie;
