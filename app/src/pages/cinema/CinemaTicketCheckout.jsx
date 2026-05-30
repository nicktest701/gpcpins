import { useMemo, useState, useCallback, useEffect } from "react";

import {
  Container,
  Paper,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  IconButton,
  Alert,
  Skeleton,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { LoadingButton } from "@mui/lab";
import {
  Receipt as ReceiptIcon,
  ConfirmationNumber as TicketIcon,
  Payments as PaymentIcon,
} from "@mui/icons-material";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  useParams,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import moment from "moment";
import _ from "lodash";

import { currencyFormatter } from "@/constants";

import { getCategory } from "@/api/categoryAPI";

import { makeMomoTransaction } from "@/api/paymentAPI";

import { getNonUser } from "@/api/userAPI";

import { globalAlertType } from "@/components/alert/alertType";

import Back from "@/components/Back";

import PaymentOption from "@/components/PaymentOption";

import { useCustomContext } from "@/context/providers/CustomProvider";

import { useAuth } from "@/context/providers/AuthProvider";

import AnimatedContainer from "@/components/animations/AnimatedContainer";

import VoucherPlaceHolderItem from "@/components/items/VoucherPlaceHolderItem";
import { useSocket } from "../../context/providers/SocketProvider";

const MAX_PIN_ATTEMPTS = 3;

function CinemaTicketCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { joinPaymentRoom, leavePaymentRoom } = useSocket();

  const { customState, customDispatch } = useCustomContext();
  const [ticketPayload, setTicketPayload] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const [walletAttemptsLeft, setWalletAttemptsLeft] =
    useState(MAX_PIN_ATTEMPTS);

  const [walletError, setWalletError] = useState("");

  useEffect(() => {
    if (user?.id) {
      joinPaymentRoom(user?.id);
      return;
    }

    if (ticketPayload?.phonenumber) {
      joinPaymentRoom(ticketPayload?.phonenumber);
    }

    return () => {
      leavePaymentRoom(user?.id);
      leavePaymentRoom(ticketPayload?.phonenumber);
    };
  }, [user?.id, ticketPayload?.phonenumber, joinPaymentRoom, leavePaymentRoom]);

  /*
   |--------------------------------------------------------------------------
   | Queries
   |--------------------------------------------------------------------------
   */

  const {
    data: movie,
    isLoading: movieLoading,
    isError: movieError,
  } = useQuery({
    queryKey: ["movie-category", id],
    queryFn: () => getCategory(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  const paymentMutation = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
    onSettled: () => {
      handleCloseSummary();
    },
    onSuccess: (data) => {
      customDispatch({
        type: "sumCinemaTotal",
        payload: [],
      });

      queryClient.invalidateQueries({
        queryKey: ["wallet-balance"],
      });

      /*
       |--------------------------------------------------------------------------
       | Navigate
       |--------------------------------------------------------------------------
       */

      navigate("/confirm", {
        replace: true,
        state: {
          id: data.transactionId,
          transactionReference: data?.reference,
          categoryType: "ticket",
          path: pathname,
          isWallet: ticketPayload?.paymentMethod === "wallet",
          mobilePartner: ticketPayload?.mobilePartner,
        },
      });
    },
    onError: (error) => {
      if (typeof error === "string" && error.includes("Invalid PIN")) {
        setWalletAttemptsLeft((prev) => {
          const next = prev - 1;

          if (next <= 0) {
            setWalletError(
              "Wallet disabled due to multiple failed PIN attempts.",
            );

            return 0;
          }

          setWalletError(`Invalid PIN. ${next} attempt(s) left.`);

          return next;
        });

        return;
      }

      customDispatch(globalAlertType("error", error || "Payment failed"));
    },
  });

  const guestMutation = useMutation({
    mutationFn: getNonUser,
    retry: false,
  });

  /*
   |--------------------------------------------------------------------------
   | Totals
   |--------------------------------------------------------------------------
   */
  const cinemaTicketTotal = useMemo(() => {
    return customState.cinemaTicketTotal || [];
  }, [customState.cinemaTicketTotal]);

  const totalAmount = useMemo(() => {
    return _.sumBy(cinemaTicketTotal, "total");
  }, [cinemaTicketTotal]);

  const totalQuantity = useMemo(() => {
    return _.sumBy(cinemaTicketTotal, "quantity");
  }, [cinemaTicketTotal]);

  const filteredTickets = useMemo(() => {
    return cinemaTicketTotal.filter((item) => item.quantity > 0);
  }, [cinemaTicketTotal]);

  /*
   |--------------------------------------------------------------------------
   | Wallet Balance
   |--------------------------------------------------------------------------
   */

  const walletBalance = useMemo(() => {
    if (!user?.id) return 0;

    return Number(queryClient.getQueryData(["wallet-balance", user?.id]) || 0);
  }, [queryClient, user?.id]);

  const isInsufficientBalance =
    ticketPayload?.paymentMethod === "wallet" && walletBalance < totalAmount;

  const handleOpenSummary = useCallback(() => {
    setSummaryOpen(true);
  }, []);

  const handleCloseSummary = useCallback(() => {
    setSummaryOpen(false);
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Build Payload
   |--------------------------------------------------------------------------
   */

  const buildPayload = useCallback(() => {
    const payload = {
      categoryId: movie?.id,
      service: "ticket",
      category: movie?.type,
      voucherName: movie?.name,
      paymentDetails: {
        tickets: filteredTickets,
        quantity: totalQuantity,
        totalAmount,
      },

      totalAmount,

      user: {
        name: ticketPayload?.fullName || user?.name,
        email: ticketPayload?.email || user?.email,
        phonenumber: ticketPayload?.phonenumber || user?.phonenumber,
        provider: ticketPayload?.mobilePartner,
      },

      isWallet: ticketPayload?.paymentMethod === "wallet",
    };

    if (ticketPayload?.paymentMethod === "wallet") {
      payload.token = ticketPayload?.token;
    }

    return payload;
  }, [filteredTickets, movie, totalAmount, totalQuantity, ticketPayload, user]);

  /*
   |--------------------------------------------------------------------------
   | Submit
   |--------------------------------------------------------------------------
   */

  const processPayment = (values) => {
    setWalletError("");

    const payload = buildPayload(values);

    // if (!user?.id) {
    //   guestMutation.mutateAsync(
    //     {},
    //     {
    //       onSuccess: () => {
    //         paymentMutation.mutateAsync(payload);
    //       },
    //     },
    //   );
    // } else {
    paymentMutation.mutateAsync(payload);
    // }
  };

  if (cinemaTicketTotal.length === 0 || totalQuantity === 0) {
    return <Navigate to={`/evoucher/cinema-ticket/movie/${id}`} replace />;
  }

  /*
   |--------------------------------------------------------------------------
   | Loading
   |--------------------------------------------------------------------------
   */

  if (movieLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | Error
   |--------------------------------------------------------------------------
   */

  if (movieError || !movie) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Failed to load movie details.</Alert>
      </Container>
    );
  }

  return (
    <>
      <Back to={`/evoucher/cinema-ticket/movie/${id}`} />

      <Container
        maxWidth="md"
        sx={{
          pb: 4,
          pt: {
            xs: 0,
            md: 2,
          },
        }}
      >
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}

          <Typography
            variant="h6"
            sx={{
              bgcolor: "primary.main",

              color: "white",

              p: 2,
            }}
          >
            Event Ticket Checkout
          </Typography>

          <Stack
            sx={{
              p: 3,

              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },

              gap: 3,
            }}
          >
            {/* Left */}

            <AnimatedContainer delay={0.2}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  textAlign: "center",
                }}
              >
                <img
                  src={movie?.details?.cinema}
                  alt="movie"
                  style={{
                    width: "100%",

                    maxHeight: 240,

                    objectFit: "contain",

                    borderRadius: 10,
                  }}
                />

                <Typography variant="h6" fontWeight={700} mt={2}>
                  {movie?.details?.movie}
                </Typography>

                <Typography variant="body2">
                  {moment(movie?.details?.date).format("dddd, Do MMMM YYYY")}
                </Typography>

                <Typography variant="body2">
                  {moment(movie?.details?.time).format("h:mm a")}
                </Typography>
              </Paper>
            </AnimatedContainer>

            {/* Right */}

            <AnimatedContainer delay={0.4}>
              <Stack spacing={2}>
                {/* Ticket Summary */}

                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Tickets
                  </Typography>

                  <List dense>
                    {filteredTickets.map((item) => (
                      <ListItem key={item.type} divider>
                        <ListItemText
                          primary={`${item.type} x ${item.quantity}`}
                        />

                        <ListItemSecondaryAction>
                          {currencyFormatter(item.total)}
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}

                    <ListItem>
                      <ListItemText
                        primary="Total"
                        primaryTypographyProps={{
                          fontWeight: 700,
                        }}
                      />

                      <ListItemSecondaryAction>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color="primary"
                        >
                          {currencyFormatter(totalAmount)}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Paper>

                {/* Wallet Errors */}

                {walletError && <Alert severity="error">{walletError}</Alert>}

                {/* Balance */}

                {ticketPayload?.paymentMethod === "wallet" &&
                  isInsufficientBalance && (
                    <Alert severity="warning">
                      Insufficient wallet balance.
                    </Alert>
                  )}

                {/* Payment */}

                <PaymentOption
                  showMomo
                  showWallet={!!user?.id}
                  initialValues={{
                    fullName: user?.name || "",
                    email: user?.email || "",
                  }}
                  onSubmit={async (values) => {
                    if (isInsufficientBalance) {
                      customDispatch(
                        globalAlertType("error", "Insufficient wallet balance"),
                      );
                      return;
                    }
                    setTicketPayload(values);
                    handleOpenSummary();
                  }}
                />
              </Stack>
            </AnimatedContainer>
          </Stack>
        </Paper>
      </Container>

      {/* Summary Dialog */}

      <Dialog
        open={summaryOpen}
        onClose={handleCloseSummary}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "primary.lighter",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptIcon />
            <Typography variant="h6" component="span" fontWeight={600}>
              Confirm Checkout
            </Typography>
          </Stack>
          <IconButton
            size="small"
            onClick={handleCloseSummary}
            sx={{ color: "primary.contrastText" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: "background.default" }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700} textAlign="center">
              {movie?.details?.movie}
            </Typography>

            <Divider />

            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Tickets
              </Typography>
              {filteredTickets.map((item) => (
                <VoucherPlaceHolderItem
                  key={item.type}
                  title={`${item.type} x ${item.quantity}`}
                  value={currencyFormatter(item.total)}
                />
              ))}
            </Paper>

            {/* Ticket Summary */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} mb={2}>
                Ticket Summary
              </Typography>

              <Stack spacing={1}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TicketIcon fontSize="small" color="action" />
                    <Typography variant="body2">Quantity</Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={500}>
                    {_.sumBy(filteredTickets, "quantity")}{" "}
                    {filteredTickets.length === 1 ? "Ticket" : "Tickets"}
                  </Typography>
                </Stack>

                <VoucherPlaceHolderItem
                  title="Payment Method"
                  value={
                    ticketPayload?.paymentMethod === "wallet"
                      ? "Wallet"
                      : "Mobile Money"
                  }
                />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PaymentIcon fontSize="small" color="primary" />
                    <Typography variant="body1" fontWeight={600}>
                      Total Amount
                    </Typography>
                  </Stack>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color="primary.main"
                  >
                    {currencyFormatter(totalAmount)}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Additional info / disclaimer */}
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
            >
              By confirming, you agree to our terms and conditions.
            
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <LoadingButton
            variant="outlined"
            color="inherit"
            onClick={handleCloseSummary}
          >
            Cancel
          </LoadingButton>

          <LoadingButton
            variant="contained"
            loading={paymentMutation.isLoading || guestMutation.isLoading}
            onClick={processPayment}
            sx={{
              px: 3,
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Confirm Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CinemaTicketCheckout;
