import { useContext } from "react";
import moment from "moment";
import { DateRangeRounded, LocationCity } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Container,
  Divider,
  List,
  ListItemText,
  ListSubheader,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import Back from "../../components/Back";
import MovieItem from "./MovieItem";
import { CustomContext } from "../../context/providers/CustomProvider";
import { currencyFormatter } from "../../constants";
import { getCategory } from "../../api/categoryAPI";
import { getAllRemainingTickets } from "../../api/voucherAPI";

function Movie() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    customState: { cinemaTicketTotal },
  } = useContext(CustomContext);
  const { id } = useParams();

  const movie = useQuery({
    queryKey: ["movie-category"],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["all-category"])
      ?.find((item) => item?._id === id),
    enabled: !!id,
  });

  const tickets = useQuery({
    queryKey: ["remaining-movie-ticket", id],
    queryFn: () => getAllRemainingTickets(id),
    initialData: {},
    enabled: !!id,
  });

  const totalItemsSelected = _.sumBy(cinemaTicketTotal, "quantity");

  const handleNavigate = () =>
    navigate(`buy`, {
      state: {
        movieInfo: {
          id: movie?.data?._id,
          voucherType: movie?.data?.voucherType,
          movie: movie?.data?.details?.movie,
          cinema: movie?.data?.details?.cinema,
          time: movie?.data?.details?.time,
          date: movie?.data?.details?.date,
        },
      },
    });

  if (movie.isLoading) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "50vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <>
        <div
          style={{
            background: `linear-gradient(to top right,rgba(8, 61, 119, 0.7),rgba(0,0,0,0.5)),url(${movie?.data?.details?.cinema})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "50vh",
            padding: "16px",
          }}
        >
          <Back color="primary" bg="primary.contrastText" />
        </div>

        {movie.isError ? (
          <Typography paragraph p={4}>
            An unknown error has occurred ! Couldnt fetch ticket information.
          </Typography>
        ) : (
          <Container sx={{ position: "relative", pt: 4, pb: 16 }}>
            <Stack spacing={2} py={2}>
              <Typography variant="h3" textAlign="center" paragraph>
                {movie?.data?.details?.movie}
              </Typography>
              <ListItemText
                primary="Description"
                secondary={movie?.data?.details?.description}
                primaryTypographyProps={{
                  fontWeight: "bold",
                  color: "primary",
                }}
                secondaryTypographyProps={{
                  fontStyle: "italic",
                }}
              />

              <Stack direction="row" spacing={4} alignItems="center">
                <LocationCity />
                <Typography variant="body2" fontWeight="bold">
                  {movie?.data?.details?.theatre}-
                  {movie?.data?.details?.location}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={4} alignItems="center">
                <DateRangeRounded />
                <Typography variant="body2" fontWeight="bold">
                  {moment(new Date(movie?.data?.details?.date)).format(
                    "dddd,Do MMMM YYYY"
                  )}
                </Typography>

                <Divider flexItem orientation="vertical" />
                <Typography
                  color="primary"
                  whiteSpace="nowrap"
                  variant="body2"
                  fontWeight="bold"
                >
                  {moment(new Date(movie?.data?.details?.time)).format(
                    "h:mm a"
                  )}
                </Typography>
              </Stack>
            </Stack>
            <List
              subheader={
                <Stack>
                  <ListSubheader
                    color="primary"
                    sx={{ bgcolor: "hsl(207, 80%, 94%)" }}
                  >
                    Ticket Pricing
                  </ListSubheader>
                </Stack>
              }
            >
              {tickets.isLoading ? (
                <Stack spacing={1} py={2}>
                  <Skeleton height={50} width="100%" />
                  <Skeleton height={50} width="100%" />
                  <Skeleton height={50} width="100%" />
                </Stack>
              ) : tickets.isError ? (
                <Typography>Error fetching ticket details</Typography>
              ) : tickets.data === undefined ? (
                <Typography>No Ticket Available</Typography>
              ) : (
                movie?.data?.details?.pricing.map((seat) => (
                  <MovieItem
                    key={seat.id}
                    type={seat?.type}
                    price={seat?.price}
                    remainingQuantity={tickets?.data[seat?.type] ?? 0}
                  />
                ))
              )}

              {totalItemsSelected > 0 && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  p={2}
                  position="fixed"
                  bottom={50}
                  left={0}
                  right={0}
                  // bgcolor="#fff"
                  bgcolor="hsl(207, 80%, 94%)"
                  zIndex={99999999999}
                >
                  <Typography variant="h5">Total</Typography>
                  <Typography variant="h5">
                    {currencyFormatter(_.sumBy(cinemaTicketTotal, "total"))}
                  </Typography>
                  <Button variant="contained" onClick={handleNavigate}>
                    Pay
                  </Button>
                </Stack>
              )}
            </List>
          </Container>
        )}
      </>
    </div>
  );
}

export default Movie;
