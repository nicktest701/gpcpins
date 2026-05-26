import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import moment from "moment";
import DOMPurify from "dompurify";
import Select from "react-select";

import {
  Alert,
  Box,
  Avatar,
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
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  EventSeat as SeatIcon,
  ConfirmationNumber as TicketIcon,
  Payments as PaymentIcon,
  BusinessCenter as BusIcon,
  Schedule as TimeIcon,
  CalendarToday as DateIcon,
} from "@mui/icons-material";

import { ChairRounded } from "@mui/icons-material";

import { LoadingButton } from "@mui/lab";

import { currencyFormatter } from "../../constants";

import { getCategory } from "../../api/categoryAPI";
import { getAvailbleBusSeats } from "../../api/voucherAPI";
import { makeMomoTransaction } from "../../api/paymentAPI";
import { getNonUser } from "@/api/userAPI";

import { AuthContext } from "../../context/providers/AuthProvider";
import { CustomContext } from "../../context/providers/CustomProvider";

import Back from "../../components/Back";
import PaymentOption from "../../components/PaymentOption";

import { globalAlertType } from "@/components/alert/alertType";

import { busTicketValidationSchema } from "@/config/validationSchema";

const MAX_WALLET_ATTEMPTS = 3;

function BusTicketCheckout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const { user } = useContext(AuthContext);

  const { customDispatch } = useContext(CustomContext);

  const [selectedSeats, setSelectedSeats] = useState([]);

  const [walletAttemptsLeft, setWalletAttemptsLeft] =
    useState(MAX_WALLET_ATTEMPTS);

  const [walletError, setWalletError] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);

  const [checkoutPayload, setCheckoutPayload] = useState(null);

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
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });

  /*
   |--------------------------------------------------------------------------
   | Form
   |--------------------------------------------------------------------------
   */

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(busTicketValidationSchema()),
    defaultValues: {
      email: user?.email || "",
      paymentMethod: "",
      mobilePartner: "",
      phoneNumber: user?.phonenumber || "",
      confirmPhoneNumber: "",
      token: "",
    },
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
        label: `Seat ${seat.seatNo}`,
      }));
  }, [seatsData]);

  /*
   |--------------------------------------------------------------------------
   | Mutations
   |--------------------------------------------------------------------------
   */

  const paymentMutation = useMutation({
    mutationFn: makeMomoTransaction,
  });

  const guestMutation = useMutation({
    mutationFn: getNonUser,
  });

  /*
   |--------------------------------------------------------------------------
   | Seat Selection
   |--------------------------------------------------------------------------
   */

  const handleSeatToggle = useCallback((seatNo) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatNo)) {
        return prev.filter((seat) => seat !== seatNo);
      }

      return [...prev, seatNo];
    });
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Build Payload
   |--------------------------------------------------------------------------
   */

  const buildPayload = useCallback(
    (values) => {
      return {
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
          email: DOMPurify.sanitize(values.email),
         phoneNumber:
            values.paymentMethod === "momo"
              ? DOMPurify.sanitize(values.phoneNumber)
              : user?.phonenumber,

          provider:
            values.paymentMethod === "momo" ? values.mobilePartner : undefined,
        },

        token: values.token,

        isWallet: values.paymentMethod === "wallet",
      };
    },
    [bus, quantity, selectedSeats, totalAmount, user],
  );

  /*
   |--------------------------------------------------------------------------
   | Payment Submit
   |--------------------------------------------------------------------------
   */

  const processPayment = async () => {
    try {
      const payload = checkoutPayload;

      if (!payload) return;

      const response = await paymentMutation.mutateAsync(payload);

      navigate("/confirm", {
        replace: true,
        state: {
          id: response?.transactionId,
          categoryType: "ticket",
          path: pathname,
          isWallet: payload?.isWallet,
        },
      });

      setPreviewOpen(false);
    } catch (error) {
      if (typeof error === "string" && error.includes("Invalid PIN")) {
        setWalletAttemptsLeft((prev) => {
          const next = prev - 1;

          if (next <= 0) {
            setWalletError(
              "Wallet temporarily disabled due to multiple failed PIN attempts.",
            );

            return 0;
          }

          setWalletError(`Invalid PIN. ${next} attempt(s) left.`);

          return next;
        });

        return;
      }

      customDispatch(globalAlertType("error", error || "Payment failed"));
    }
  };

  /*
   |--------------------------------------------------------------------------
   | Form Submit
   |--------------------------------------------------------------------------
   */

  const onSubmit = async (values) => {
    setWalletError("");

    if (!selectedSeats.length) {
      customDispatch(
        globalAlertType("error", "Please select at least one seat"),
      );

      return;
    }

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

    if (!user?.id) {
      await guestMutation.mutateAsync({});
    }

    setCheckoutPayload(payload);

    setPreviewOpen(true);
  };

  /*
   |--------------------------------------------------------------------------
   | Loading
   |--------------------------------------------------------------------------
   */

  if (busLoading || seatsLoading) {
    return (
      <Container sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={200} />
      </Container>
    );
  }

  /*
   |--------------------------------------------------------------------------
   | UI
   |--------------------------------------------------------------------------
   */

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 3,
      }}
    >
      <Back />

      <Stack spacing={3}>
        <Typography variant="h5" fontWeight={700}>
          Bus Ticket Checkout
        </Typography>

        {/* Bus Details */}

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={3}
        >
          <Box flex={1}>
            <img
              src={bus?.details?.logo}
              alt={bus?.voucherType}
              style={{
                width: "100%",
                maxHeight: 220,
                objectFit: "contain",
              }}
            />
          </Box>

          <Stack flex={1} spacing={1}>
            <Typography variant="h6">{bus?.voucherType}</Typography>

            <Typography>
              {moment(bus?.details?.date).format("dddd, Do MMM YYYY")}
            </Typography>

            <Typography>
              {moment(bus?.details?.time, "HH:mm").format("hh:mm A")}
            </Typography>

            <Chip color="primary" label={currencyFormatter(bus?.price)} />
          </Stack>
        </Stack>

        {/* Seats */}

        <Stack spacing={2}>
          <Typography variant="h6">Select Seats</Typography>

          {/* Mobile Select */}

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
          )}
        </Stack>

        {/* Summary */}

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

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth />
                )}
              />

              <Controller
                name="paymentMethod"
                control={control}
                render={({ field }) => (
                  <PaymentOption
                    showWallet={!!user?.id}
                    showMomo
                    paymentMethod={field.value}
                    setPaymentMethod={field.onChange}
                    error={!!errors.paymentMethod}
                    helperText={errors.paymentMethod?.message}
                    mobileMoneyDetails={{
                      mobilePartner: getValues("mobilePartner"),
                      setMobilePartner: (val) =>
                        setValue("mobilePartner", val, {
                          shouldValidate: true,
                        }),
                      mobilePartnerErr: !!errors.mobilePartner,
                      mobilePartnerHelperText: errors.mobilePartner?.message,
                      phonenumber: getValues("phoneNumber"),
                      setPhonenumber: (val) =>
                        setValue("phoneNumber", val, { shouldValidate: true }),
                      phonenumberErr: !!errors.phoneNumber,
                      phonenumberHelperText: errors.phoneNumber?.message,
                      confirmPhonenumber: getValues("confirmPhoneNumber"),
                      setConfirmPhonenumber: (val) =>
                        setValue("confirmPhoneNumber", val, {
                          shouldValidate: true,
                        }),
                      confirmPhonenumberErr: !!errors.confirmPhoneNumber,
                      confirmPhonenumberHelperText:
                        errors.confirmPhoneNumber?.message,
                    }}
                    walletDetails={{
                      token: getValues("token"),
                      setToken: (val) =>
                        setValue("token", val, { shouldValidate: true }),

                      tokenErr: !!errors.token,
                      tokenHelperText: errors.token?.message,
                    }}
                  />
                )}
              />
              <LoadingButton
                loading={isSubmitting}
                type="submit"
                variant="contained"
                size="large"
                disabled={!quantity}
              >
                Continue
              </LoadingButton>
            </Stack>
          </form>
        </Box>
      </Stack>

      {/* Checkout Preview Modal */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
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
            bgcolor: "primary.main",
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
          <Stack spacing={3}>
            {/* Bus Summary Card */}
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
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {bus?.details?.logo && (
                    <Avatar
                      src={bus.details.logo}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    />
                  )}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {bus?.voucherType}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bus ticket
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <BusIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {bus?.operator || "Bus operator"}
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

              <Stack spacing={1.5}>
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
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <LoadingButton
            loading={paymentMutation.isPending}
            variant="contained"
            onClick={processPayment}
            sx={{
              borderRadius: 2,
              px: 3,
              bgcolor: "primary.main",
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
