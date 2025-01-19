import {
  Avatar,
  Breadcrumbs,
  Button,
  Container,
  List,
  ListSubheader,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import _ from "lodash";
import { Link, useNavigate, useParams } from "react-router-dom";
import MatchTicketItem from "./MatchTicketItem";
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategory } from "../../api/categoryAPI";
import moment from "moment";

import versus from "../../assets/images/versus.svg";
import { useContext } from "react";
import { CustomContext } from "../../context/providers/CustomProvider";
import { IMAGES, currencyFormatter } from "../../constants";
import PayLoading from "../../components/PayLoading";
import { getAllRemainingTickets } from "../../api/voucherAPI";

function MatchTicket() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const {
    customState: { stadiumTicketTotal },
  } = useContext(CustomContext);
  const { id } = useParams();

  const match = useQuery({
    queryKey: ["match"],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(["match-category"])
      ?.filter((item) => item?._id === id),
    enabled: !!id,
  });

  const tickets = useQuery({
    queryKey: ["remaining-match-ticket", id],
    queryFn: () => getAllRemainingTickets(id),
    initialData: {},
    enabled: !!id,
  });
 

  // const av=useQueries()

  const totalItemsSelected = _.sumBy(stadiumTicketTotal, "quantity");

  const handleNavigate = () => navigate(`buy`);

  if (match.isLoading) {
    return <PayLoading />;
  }

  return (
    <Container sx={{ minHeight: "100dvh", paddingY: 2 }}>
      <Breadcrumbs sx={{ paddingY: 2 }}>
        {/* <Link to="/evoucher" style={{ fontSize: "14px" }}>
          HOME
        </Link> */}
        <Link to="/evoucher/stadia-ticket" style={{ fontSize: "14px" }}>
          TICKETS
        </Link>
        <Typography
          variant="body2"
          color="primary"
          sx={{ textTransform: "uppercase" }}
        >
          {match?.data?.details?.home} VS {match?.data?.details?.away}
        </Typography>
      </Breadcrumbs>

      <Stack
        sx={{
          bgcolor: "secondary.main",
          borderRadius: 2,
          background: `linear-gradient(to top right,rgba(8, 61, 119, 0.7),rgba(0,0,0,0.5)),url(${IMAGES.football_pitch})`,
          backgroundSize: "cover",
          backgroundPosition: "center bottom",
          color: "secondary.contrastText",
          py: 3,
          my: 2,
        }}
        spacing={1}
      >
        <Typography textAlign="center" variant="caption">
          {match?.data?.details?.matchType}
        </Typography>
        <Stack
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Typography>{match?.data?.details?.home}</Typography>
          <Avatar
            src={match?.data?.details?.homeImage}
            sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}
          />

          <Avatar
            variant="square"
            src={versus}
            sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}
          />
          <Avatar
            src={match?.data?.details?.awayImage}
            sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}
          />
          <Typography>{match?.data?.details?.away}</Typography>
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="center"
          alignItems="center"
          padding={1}
          gap={2}
        >
          <Typography variant="body2">
            {moment(new Date(match?.data?.details?.date)).format(
              "dddd,Do MMMM YYYY"
            )}
          </Typography>
          <Typography variant="body2">
            {moment(new Date(match?.data?.details?.time)).format("hh:mm a")}
          </Typography>
          <Typography variant="body2">{match?.data?.details?.venue}</Typography>
        </Stack>
      </Stack>

      <List
        disablePadding
        subheader={
          <ListSubheader sx={{ bgcolor: "whitesmoke" }}>
            Ticket Pricing
          </ListSubheader>
        }
        sx={{ position: "relative", pt: 4, pb: 16 }}
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
          match?.data?.details?.pricing.map((stand) => (
            <MatchTicketItem
              key={stand.id}
              type={stand?.type}
              price={stand?.price}
              remainingQuantity={tickets?.data[stand?.type]}
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
            bgcolor="hsl(207, 97%, 95%)"
            zIndex={99999999999}
          >
            <Typography variant="h5">Total</Typography>
            <Typography variant="h5">
              {currencyFormatter(_.sumBy(stadiumTicketTotal, "total"))}
            </Typography>
            <Button variant="contained" onClick={handleNavigate}>
              Pay
            </Button>
          </Stack>
        )}
      </List>
    </Container>
  );
}

export default MatchTicket;
