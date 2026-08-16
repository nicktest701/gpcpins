import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import moment from "moment";
import DOMPurify from "dompurify";
import CustomSelect from "@/components/dropdowns/CustomSelect";

import {
  Alert,
  Box,
  Chip,
  Divider,
  Paper,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  EventSeat as SeatIcon,
  ConfirmationNumber as TicketIcon,
  Payments as PaymentIcon,
  BusAlert as BusIcon,
  Schedule as TimeIcon,
  CalendarToday as DateIcon,
  Chair,
} from "@mui/icons-material";

// import { ChairRounded } from "@mui/icons-material";

import { LoadingButton } from "@mui/lab";
import { currencyFormatter } from "../../constants";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import { getCategory } from "../../api/categoryAPI";
import { getAvailbleBusSeats } from "../../api/voucherAPI";
import { makeMomoTransaction } from "../../api/paymentAPI";
import {  useAuth } from "../../context/providers/AuthProvider";
import { CustomContext } from "../../context/providers/CustomProvider";
import Back from "../../components/Back";
import PaymentOption from "../../components/PaymentOption";
import { globalAlertType } from "@/components/alert/alertType";
import { useSocket } from "../../context/providers/SocketProvider";
import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";
import Swal from "sweetalert2";

const MAX_WALLET_ATTEMPTS = 3;

function BusTicketCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const { user } =useAuth()
  const { customDispatch } = useContext(CustomContext);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [walletAttemptsLeft, setWalletAttemptsLeft] =
    useState(MAX_WALLET_ATTEMPTS);
  const [walletError, setWalletError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [checkoutPayload, setCheckoutPayload] = useState(null);
  const { joinPaymentRoom, leavePaymentRoom } = useSocket();

  useEffect(() => {
    if (user?.id) {
      joinPaymentRoom(user?.id);
      return;
    }

    if (checkoutPayload?.phonenumber) {
      joinPaymentRoom(checkoutPayload?.phonenumber);
    }

    return () => {
      leavePaymentRoom(user?.id);
      leavePaymentRoom(checkoutPayload?.phonenumber);
    };
  }, [
    user?.id,
    checkoutPayload?.phonenumber,
    joinPaymentRoom,
    leavePaymentRoom,
  ]);

  /*
   |--------------------------------------------------------------------------
   | Queries
   |--------------------------------------------------------------------------
   */

  const { data: bus, isLoading: busLoading } = useQuery({
    queryKey: ["bus-category", id],
    queryFn: () => getCategory(id),
    enabled: !!id,
  });

  const {
    data: seatsData = [],
    isLoading: seatsLoading,
    refetch: refetchSeats,
  } = useQuery({
    queryKey: ["available-seats", id],
    queryFn: () => getAvailbleBusSeats(id),
    enabled: !!id,
    refetchOnWindowFocus: true,
  });


  /*
   |--------------------------------------------------------------------------
   | Memoized Values
   |--------------------------------------------------------------------------
   */

  const quantity = selectedSeats.length;

  const totalAmount = useMemo(() => {
    return quantity * Number(bus?.price || 0);
  }, [quantity, bus?.price]);

  const availableSeatOptions = useMemo(() => {
    return seatsData
      .filter((seat) => seat.active)
      .map((seat) => ({
        value: seat.seatNo,
        label: (
          <Stack direction="row" alignItems="center" gap={1}>
            <Chair />
            Seat {seat.seatNo}
          </Stack>
        ),
      }));
  }, [seatsData]);

  /*
   |--------------------------------------------------------------------------
   | Mutations
   |--------------------------------------------------------------------------
   */

  const paymentMutation = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
    onSettled: () => {
      setPreviewOpen(false);
    },
    onSuccess: (data) => {
      customDispatch({
        type: "sumCinemaTotal",
        payload: [],
      });

      queryClient.invalidateQueries({
        queryKey: ["wallet-balance"],
      });

      navigate("/confirm", {
        replace: true,

        state: {
          id: data.transactionId,
          transactionReference: data?.reference,
          categoryType: "ticket",
          path: pathname,
          isWallet: checkoutPayload?.paymentMethod === "wallet",
          mobilePartner: checkoutPayload?.mobilePartner,
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

  /*
   |--------------------------------------------------------------------------
   | Seat Selection
   |--------------------------------------------------------------------------
   */

  // const handleSeatToggle = useCallback((seatNo) => {
  //   setSelectedSeats((prev) => {
  //     if (prev.includes(seatNo)) {
  //       return prev.filter((seat) => seat !== seatNo);
  //     }
  //     return [...prev, seatNo];
  //   });
  // }, []);

  const buildPayload = useCallback(() => {
    const payload = {
      category: "bus",
      categoryId: bus?.id,
      service: "ticket",
      voucherName: bus?.name,
      paymentDetails: {
        tickets: selectedSeats,
        quantity,
        totalAmount,
      },

      totalAmount,
      user: {
        name: user?.name,
        email: DOMPurify.sanitize(checkoutPayload?.email),
        phonenumber:
          checkoutPayload?.paymentMethod === "momo"
            ? DOMPurify.sanitize(checkoutPayload?.phonenumber)
            : user?.phonenumber,

        provider:
          checkoutPayload?.paymentMethod === "momo"
            ? checkoutPayload?.mobilePartner
            : undefined,
      },

      isWallet: checkoutPayload?.paymentMethod === "wallet",
    };

    if (checkoutPayload?.paymentMethod === "wallet") {
      payload.token = checkoutPayload?.token;
    }

    return payload;
  }, [bus, quantity, selectedSeats, totalAmount, user, checkoutPayload]);

  const processPayment = async (values) => {
    setWalletError("");

    const payload = buildPayload(values);

    if (payload.isWallet) {
      const walletBalance = queryClient.getQueryData([
        "wallet-balance",
        user?.id,
      ]);

      if (Number(walletBalance || 0) < Number(payload.totalAmount)) {
        customDispatch(globalAlertType("error", "Insufficient wallet balance"));

        return;
      }

      if (walletAttemptsLeft <= 0) {
        customDispatch(globalAlertType("error", "Wallet temporarily locked"));

        return;
      }
    }

      const result = await Swal.fire({
      title: "Confirm Payment",
      text: `Pay ${currencyFormatter(totalAmount)} for ticket(s)?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, pay",
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Processing payment",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {

      await paymentMutation.mutateAsync(payload);
      Swal.close();
   } catch (e) {
      // error handling is done in mutation onError
    } finally {
      Swal.close();
    }
  };

  if (busLoading || seatsLoading) {
    return (
      <Container sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  return (
    <Container
      maxWidth="md"
      sx={{
        pb: 4,
        pt: 2,
      }}
    >
      <Paper
        elevation={2}
        sx={{
          borderTopRightRadius: 3,
          // overflow: "hidden",
        }}
      >
        <Stack
          width="100%"
          direction="row"
          alignItems="center"
          sx={{
            bgcolor: "primary.lighter",
            borderTopRightRadius: 3,
            borderTopLeftRadius: 3,
            overflow: "hidden",
          }}
        >
          <Back color="#fff" />

          <Typography
            width="100%"
            textAlign="right"
            variant="h6"
            sx={{
              color: "white",

              p: 2,
            }}
          >
            Bus Ticket Checkout
          </Typography>
        </Stack>

        <Stack
          sx={{
            p: 2,

            display: "grid",

            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },

            gap: 3,
          }}
        >
          {/* Bus Details */}
          <AnimatedContainer delay={0.2}>
            <Stack mb={3}>
              <Box flex={1}>
                <img
                  src={bus?.details?.logo}
                  alt={bus?.voucherType}
                  style={{
                    width: "100%",
                    maxHeight: 150,
                    objectFit: "contain",
                  }}
                />
              </Box>
              <Stack direction="row" alignItems="center">
                <Stack flex={1} spacing={1}>
                  <Typography variant="h6">{bus?.name}</Typography>
                  <Typography>
                    {moment(bus?.details?.date).format("dddd, Do MMM YYYY")}
                  </Typography>
                  <Typography>
                    {moment(bus?.details?.time, "HH:mm").format("hh:mm A")}
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    bgcolor: "black",
                    color: "white",
                    p: 2,
                    border: "4px solid transparent",
                    borderImage:
                      "repeating-linear-gradient(90deg, #fff 0, #fff 8px, transparent 6px, transparent 12px) 1",
                  }}
                >
                  <Typography variant="body2" fontWeight={700}>
                    {currencyFormatter(bus?.price)}
                  </Typography>
                </Box>
              </Stack>
            </Stack>

            {/* Seats */}
            <Stack spacing={2} pt={2}>
              <Typography variant="h6">Select Seats</Typography>

              {/* Mobile Select */}
              <CustomSelect
                isMulti
                options={availableSeatOptions}
                value={availableSeatOptions.filter((item) =>
                  selectedSeats.includes(item.value),
                )}
                onChange={(value) => {
                  setSelectedSeats(value.map((item) => item.value));
                }}
                placeholder="Select seats..."
                classNamePrefix="select" // important to use the prefix for class names
              />
              {/* 
              {isMobile ? (
                <Select
                  isMulti
                  options={availableSeatOptions}
                  value={availableSeatOptions.filter((item) =>
                    selectedSeats.includes(item.value),
                  )}
                  onChange={(value) => {
                    setSelectedSeats(value.map((item) => item.value));
                  }}
                  placeholder="Select seats..."
                  className=""
                />
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {seatsData.map(({ seatNo, active }) => (
                    <Tooltip
                      key={seatNo}
                      title={active ? `Seat ${seatNo}` : "Booked"}
                    >
                      <IconButton
                        disabled={!active}
                        onClick={() => handleSeatToggle(seatNo)}
                        sx={{
                          width: 55,
                          height: 55,
                          borderRadius: 2,

                          bgcolor: selectedSeats.includes(seatNo)
                            ? "success.main"
                            : active
                              ? "grey.200"
                              : "grey.400",

                          color: "#fff",
                        }}
                      >
                        <ChairRounded />
                      </IconButton>
                    </Tooltip>
                  ))}
                </Box>
              )} */}
            </Stack>
          </AnimatedContainer>

          {/* Summary */}
          <AnimatedContainer delay={0.2}>
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "background.paper",
                boxShadow: 1,
              }}
            >
              <List>
                <ListItem>
                  <ListItemText primary="Seats" />

                  <ListItemSecondaryAction>{quantity}</ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemText primary="Total" />

                  <ListItemSecondaryAction>
                    <strong>{currencyFormatter(totalAmount)}</strong>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              {walletError && <Alert severity="error">{walletError}</Alert>}

              {/* Payment */}

              <PaymentOption
                showMomo
                showWallet={!!user?.id}
                initialValues={{
                  fullName: user?.name || "",
                  email: user?.email || "",
                }}
                onSubmit={async (values) => {
                  if (!selectedSeats.length) {
                    customDispatch(
                      globalAlertType(
                        "error",
                        "Please select at least one seat",
                      ),
                    );

                    return;
                  }

                  if (values.paymentMethod === "wallet") {
                    const walletBalance = queryClient.getQueryData([
                      "wallet-balance",
                      user?.id,
                    ]);

                    if (Number(walletBalance || 0) < Number(totalAmount)) {
                      customDispatch(
                        globalAlertType("error", "Insufficient wallet balance"),
                      );

                      return;
                    }
                  }

                  setCheckoutPayload(values);
                  setPreviewOpen(true);
                }}
              />
            </Box>
          </AnimatedContainer>
        </Stack>
      </Paper>

      {/* Checkout Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth="xs"
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
            onClick={() => setPreviewOpen(false)}
            sx={{ color: "primary.contrastText" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: "background.default" }}>
          <Stack spacing={2}>
            {/* Bus Summary Card */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
              }}
            >
              <Stack spacing={2}>
                <Stack
                  flex={1}
                  direction="row"
                  justifyContent="space-between"
                  useFlexGap
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {bus?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Bus ticket
                      </Typography>
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      bgcolor: "black",
                      color: "white",
                      p: 2,
                      border: "4px solid transparent",
                      borderImage:
                        "repeating-linear-gradient(90deg, #fff 0, #fff 8px, transparent 6px, transparent 12px) 1",
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {currencyFormatter(bus?.price)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {bus?.details?.vehicleNo || "Bus operator"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <DateIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {moment(bus?.details?.date).format("DD MMM YYYY")}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TimeIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {moment(bus?.details?.time, "HH:mm").format("hh:mm A")}
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
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
                    <SeatIcon fontSize="small" color="secondary" />
                    <Typography variant="body2">Selected Seats</Typography>
                  </Stack>
                  <Chip
                    label={selectedSeats.join(", ")}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                </Stack>

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
                    {quantity} {quantity === 1 ? "ticket" : "tickets"}
                  </Typography>
                </Stack>
                <VoucherPlaceHolderItem
                  title="Payment Method"
                  value={
                    checkoutPayload?.paymentMethod === "wallet"
                      ? "Wallet"
                      : "Mobile Money"
                  }
                />

                <Divider />

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
              By confirming, you agree to our terms and conditions. No refunds
              within 2 hours of departure.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setPreviewOpen(false)}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <LoadingButton
            loading={paymentMutation.isPending}
            variant="contained"
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
    </Container>
  );
}

export default BusTicketCheckout;
