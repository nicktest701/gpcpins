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
  Paper,
  Box,
  alpha,
  useTheme,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from "@mui/material";
import {
  Close as CloseIcon,
  SportsSoccer,
  LocationOn,
  CalendarToday,
  AccessTime,
  Receipt,
  ErrorOutline,
  Refresh,
} from "@mui/icons-material";
import _ from "lodash";
import { Link, useNavigate, useParams } from "react-router-dom";
import MatchTicketItem from "./MatchTicketItem";
import { useQuery } from "@tanstack/react-query";
import { getCategory } from "../../api/categoryAPI";
import { getAllRemainingTickets } from "../../api/voucherAPI";
import moment from "moment";
import { useContext, useMemo, useState } from "react";
import { CustomContext } from "../../context/providers/CustomProvider";
import { IMAGES, currencyFormatter } from "../../constants";
import Swal from "sweetalert2";
import AnimatedWrapper from "@/components/animations/AnimatedWrapper";

function MatchTicket() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    customState: { stadiumTicketTotal },
  } = useContext(CustomContext);
  const { id } = useParams();

  // Preview dialog state
  const [previewOpen, setPreviewOpen] = useState(false);

  // Fetch match details
  const {
    data: matchData,
    isLoading: matchLoading,
    isError: matchError,
    error: matchErrorObj,
    refetch: refetchMatch,
  } = useQuery({
    queryKey: ["match", id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });

  // Fetch remaining tickets
  const {
    data: ticketsData,
    isLoading: ticketsLoading,
    isError: ticketsError,
    error: ticketsErrorObj,
    refetch: refetchTickets,
  } = useQuery({
    queryKey: ["remaining-match-ticket", id],
    queryFn: () => getAllRemainingTickets(id),
    enabled: !!id,
    initialData: {},
  });

  const match = matchData;
  const remainingTickets = ticketsData || {};

  // Compute totals
  const totalItemsSelected = useMemo(
    () => _.sumBy(stadiumTicketTotal, "quantity"),
    [stadiumTicketTotal]
  );
  const totalAmount = useMemo(
    () => _.sumBy(stadiumTicketTotal, "total"),
    [stadiumTicketTotal]
  );

  // Navigate to buy after confirmation
  const handleNavigateToBuy = () => {
    navigate(`buy`);
  };

  // Preview action: show dialog first
  const handlePreview = () => {
    if (totalItemsSelected === 0) {
      Swal.fire({
        icon: "warning",
        title: "No tickets selected",
        text: "Please select at least one ticket to proceed.",
      });
      return;
    }
    setPreviewOpen(true);
  };

  // Confirm payment after preview
  const handleConfirmPayment = async () => {
    setPreviewOpen(false);
    // SweetAlert confirmation
    const result = await Swal.fire({
      title: "Confirm Purchase",
      html: `
        <p>You are about to purchase <strong>${totalItemsSelected}</strong> ticket(s) for <strong>${match?.details?.home} vs ${match?.details?.away}</strong>.</p>
        <p style="font-size: 1.5rem; font-weight: 700; color: ${theme.palette.primary.main};">
          ${currencyFormatter(totalAmount)}
        </p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed to payment",
      cancelButtonText: "Cancel",
      confirmButtonColor: theme.palette.secondary.main,
      cancelButtonColor: theme.palette.grey[500],
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      handleNavigateToBuy();
    }
  };

  const isLoading = matchLoading || ticketsLoading;
  const isError = matchError || ticketsError;

  // Loading state
  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link to="/evoucher/stadia-ticket" style={{ fontSize: "14px" }}>
            TICKETS
          </Link>
          <Skeleton variant="text" width={120} />
        </Breadcrumbs>
        <Skeleton variant="rectangular" height={180} sx={{ borderRadius: 3, mb: 3 }} />
        <Stack spacing={1}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
          ))}
        </Stack>
      </Container>
    );
  }

  // Error state
  if (isError) {
    return (
      <Container sx={{ py: 4 }}>
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
            {matchErrorObj?.message || ticketsErrorObj?.message || "Failed to load match details."}
          </Typography>
          <Button variant="contained" startIcon={<Refresh />} onClick={() => refetchMatch && refetchTickets && Promise.all([refetchMatch(), refetchTickets()])}>
            Retry
          </Button>
        </Paper>
      </Container>
    );
  }

  // No match found
  if (!match) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography variant="h6" color="text.secondary">
            Match not found.
          </Typography>
        </Paper>
      </Container>
    );
  }

  // No tickets available
  const hasTickets = Object.keys(remainingTickets).length > 0;

  return (
    <Container sx={{ minHeight: "100vh", py: 2 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ py: 2 }}>
        <Link to="/evoucher/stadia-ticket" style={{ fontSize: "14px", color: theme.palette.text.secondary }}>
          TICKETS
        </Link>
        <Typography variant="body2" color="primary" fontWeight="bold">
          {match?.details?.home} VS {match?.details?.away}
        </Typography>
      </Breadcrumbs>

      {/* Hero Header */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          position: "relative",
          mb: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.7)} 100%), url(${IMAGES.football_pitch})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "white",
            p: { xs: 3, md: 4 },
            textAlign: "center",
          }}
        >
          <Chip
            label={match?.details?.matchType || "Match"}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.common.white, 0.2),
              color: "white",
              fontWeight: 600,
              mb: 2,
            }}
          />
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={{ xs: 1, sm: 3 }}
            flexWrap="wrap"
          >
            <Stack alignItems="center" spacing={1}>
              <Avatar
                src={match?.details?.homeImage}
                sx={{ width: 64, height: 64, border: `2px solid white` }}
              />
              <Typography variant="h6" fontWeight="bold">
                {match?.details?.home}
              </Typography>
            </Stack>

            <Typography variant="h4" fontWeight="bold" sx={{ px: 2 }}>
              VS
            </Typography>

            <Stack alignItems="center" spacing={1}>
              <Avatar
                src={match?.details?.awayImage}
                sx={{ width: 64, height: 64, border: `2px solid white` }}
              />
              <Typography variant="h6" fontWeight="bold">
                {match?.details?.away}
              </Typography>
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="center"
            alignItems="center"
            spacing={{ xs: 1, sm: 3 }}
            sx={{ mt: 3, flexWrap: "wrap" }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <CalendarToday fontSize="small" />
              <Typography variant="body2">
                {moment(new Date(match?.details?.date)).format("dddd, Do MMMM YYYY")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <AccessTime fontSize="small" />
              <Typography variant="body2">
                {moment(new Date(match?.details?.time)).format("hh:mm a")}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              <LocationOn fontSize="small" />
              <Typography variant="body2">{match?.details?.venue}</Typography>
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* Ticket Pricing Section */}
      <List
        subheader={
          <ListSubheader sx={{ bgcolor: "background.default", fontWeight: 700, fontSize: "1rem" }}>
            Ticket Pricing
          </ListSubheader>
        }
        sx={{ pt: 2, pb: totalItemsSelected > 0 ? 16 : 2 }}
      >
        {!hasTickets ? (
          <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            <Typography color="text.secondary">No tickets available for this match.</Typography>
          </Paper>
        ) : (
          match?.details?.pricing?.map((stand) => (
            <AnimatedWrapper key={stand.id}>
              <MatchTicketItem
                type={stand?.type}
                price={stand?.price}
                remainingQuantity={remainingTickets[stand?.type] || 0}
              />
            </AnimatedWrapper>
          ))
        )}
      </List>

      {/* Sticky Footer */}
      {totalItemsSelected > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            p: { xs: 2, sm: 3 },
            borderRadius: { xs: "12px 12px 0 0", sm: "16px 16px 0 0" },
            bgcolor: "background.paper",
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            boxShadow: `0 -8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                {totalItemsSelected} ticket{totalItemsSelected > 1 ? "s" : ""} selected
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {currencyFormatter(totalAmount)}
              </Typography>
            </Stack>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handlePreview}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.3)}`,
                "&:hover": {
                  boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.4)}`,
                },
              }}
            >
              Proceed to Pay
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          elevation: 8,
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: `0 20px 60px ${alpha(theme.palette.common.black, 0.15)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            p: 3,
            pb: 1.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.06)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "secondary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "common.white",
                }}
              >
                <Receipt fontSize="small" />
              </Box>
              <Typography variant="h6" fontWeight="700" letterSpacing={-0.5}>
                Order Summary
              </Typography>
            </Stack>
            <IconButton
              onClick={() => setPreviewOpen(false)}
              size="small"
              sx={{
                color: "text.secondary",
                bgcolor: alpha(theme.palette.common.black, 0.04),
                "&:hover": { bgcolor: alpha(theme.palette.common.black, 0.08) },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.background.default, 0.6),
              borderColor: alpha(theme.palette.divider, 0.6),
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Match
                </Typography>
                <Typography variant="body2" fontWeight="600">
                  {match?.details?.home} vs {match?.details?.away}
                </Typography>
              </Stack>
              <Divider />
              {stadiumTicketTotal.map(
                (item) =>
                  item.quantity > 0 && (
                    <Stack key={item.type} direction="row" justifyContent="space-between">
                      <Typography variant="body2">
                        {item.type} x {item.quantity}
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {currencyFormatter(item.total)}
                      </Typography>
                    </Stack>
                  )
              )}
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle1" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  {currencyFormatter(totalAmount)}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 0,
            gap: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: alpha(theme.palette.background.default, 0.4),
          }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            onClick={() => setPreviewOpen(false)}
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            onClick={handleConfirmPayment}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: `0 8px 24px ${alpha(theme.palette.secondary.main, 0.25)}`,
              "&:hover": {
                boxShadow: `0 12px 32px ${alpha(theme.palette.secondary.main, 0.35)}`,
              },
            }}
          >
            Confirm & Pay
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MatchTicket;

// import {
//   Avatar,
//   Breadcrumbs,
//   Button,
//   Container,
//   List,
//   ListSubheader,
//   Skeleton,
//   Stack,
//   Typography,
// } from "@mui/material";
// import _ from "lodash";
// import { Link, useNavigate, useParams } from "react-router-dom";
// import MatchTicketItem from "./MatchTicketItem";
// import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getCategory } from "../../api/categoryAPI";
// import moment from "moment";

// import versus from "../../assets/images/versus.svg";
// import { useContext } from "react";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import { IMAGES, currencyFormatter } from "../../constants";
// import PayLoading from "../../components/PayLoading";
// import { getAllRemainingTickets } from "../../api/voucherAPI";

// function MatchTicket() {
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const {
//     customState: { stadiumTicketTotal },
//   } = useContext(CustomContext);
//   const { id } = useParams();

//   const match = useQuery({
//     queryKey: ["match"],
//     queryFn: () => getCategory(id),
//     initialData: queryClient
//       .getQueryData(["match-category"])
//       ?.filter((item) => item?.id === id),
//     enabled: !!id,
//   });

//   const tickets = useQuery({
//     queryKey: ["remaining-match-ticket", id],
//     queryFn: () => getAllRemainingTickets(id),
//     initialData: {},
//     enabled: !!id,
//   });
 

//   // const av=useQueries()

//   const totalItemsSelected = _.sumBy(stadiumTicketTotal, "quantity");

//   const handleNavigate = () => navigate(`buy`);

//   if (match.isLoading) {
//     return <PayLoading />;
//   }

//   return (
//     <Container sx={{ minHeight: "100dvh", paddingY: 2 }}>
//       <Breadcrumbs sx={{ paddingY: 2 }}>
//         {/* <Link to="/evoucher" style={{ fontSize: "14px" }}>
//           HOME
//         </Link> */}
//         <Link to="/evoucher/stadia-ticket" style={{ fontSize: "14px" }}>
//           TICKETS
//         </Link>
//         <Typography
//           variant="body2"
//           color="primary"
//           sx={{ textTransform: "uppercase" }}
//         >
//           {match?.data?.details?.home} VS {match?.data?.details?.away}
//         </Typography>
//       </Breadcrumbs>

//       <Stack
//         sx={{
//           bgcolor: "secondary.main",
//           borderRadius: 2,
//           background: `linear-gradient(to top right,rgba(8, 61, 119, 0.7),rgba(0,0,0,0.5)),url(${IMAGES.football_pitch})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center bottom",
//           color: "secondary.contrastText",
//           py: 3,
//           my: 2,
//         }}
//         spacing={1}
//       >
//         <Typography textAlign="center" variant="caption">
//           {match?.data?.details?.matchType}
//         </Typography>
//         <Stack
//           direction="row"
//           justifyContent="center"
//           alignItems="center"
//           spacing={2}
//         >
//           <Typography>{match?.data?.details?.home}</Typography>
//           <Avatar
//             src={match?.data?.details?.homeImage}
//             sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}
//           />

//           <Avatar
//             variant="square"
//             src={versus}
//             sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}
//           />
//           <Avatar
//             src={match?.data?.details?.awayImage}
//             sx={{ width: { xs: 35, md: 45 }, height: { xs: 35, md: 45 } }}
//           />
//           <Typography>{match?.data?.details?.away}</Typography>
//         </Stack>

//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           justifyContent="center"
//           alignItems="center"
//           padding={1}
//           gap={2}
//         >
//           <Typography variant="body2">
//             {moment(new Date(match?.data?.details?.date)).format(
//               "dddd,Do MMMM YYYY"
//             )}
//           </Typography>
//           <Typography variant="body2">
//             {moment(new Date(match?.data?.details?.time)).format("hh:mm a")}
//           </Typography>
//           <Typography variant="body2">{match?.data?.details?.venue}</Typography>
//         </Stack>
//       </Stack>

//       <List
//         disablePadding
//         subheader={
//           <ListSubheader sx={{ bgcolor: "whitesmoke" }}>
//             Ticket Pricing
//           </ListSubheader>
//         }
//         sx={{ position: "relative", pt: 4, pb: 16 }}
//       >
//         {tickets.isLoading ? (
//           <Stack spacing={1} py={2}>
//             <Skeleton height={50} width="100%" />
//             <Skeleton height={50} width="100%" />
//             <Skeleton height={50} width="100%" />
//           </Stack>
//         ) : tickets.isError ? (
//           <Typography>Error fetching ticket details</Typography>
//         ) : tickets.data === undefined ? (
//           <Typography>No Ticket Available</Typography>
//         ) : (
//           match?.data?.details?.pricing.map((stand) => (
//             <MatchTicketItem
//               key={stand.id}
//               type={stand?.type}
//               price={stand?.price}
//               remainingQuantity={tickets?.data[stand?.type]}
//             />
//           ))
//         )}

//         {totalItemsSelected > 0 && (
//           <Stack
//             direction="row"
//             justifyContent="space-between"
//             alignItems="center"
//             p={2}
//             position="fixed"
//             bottom={50}
//             left={0}
//             right={0}
//             bgcolor="hsl(207, 97%, 95%)"
//             zIndex={99999999999}
//           >
//             <Typography variant="h5">Total</Typography>
//             <Typography variant="h5">
//               {currencyFormatter(_.sumBy(stadiumTicketTotal, "total"))}
//             </Typography>
//             <Button variant="contained" onClick={handleNavigate}>
//               Pay
//             </Button>
//           </Stack>
//         )}
//       </List>
//     </Container>
//   );
// }

// export default MatchTicket;
