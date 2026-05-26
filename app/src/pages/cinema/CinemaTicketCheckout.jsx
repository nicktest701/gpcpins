import { useEffect, useMemo, useState, useCallback } from "react";

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

import { useForm, useWatch } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

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

import { disableWallet, getNonUser } from "@/api/userAPI";

import { globalAlertType } from "@/components/alert/alertType";

import { ticketsValidationSchema } from "../../config/validationSchema";

import Back from "@/components/Back";

import PaymentOption from "@/components/PaymentOption";

import { useCustomContext } from "@/context/providers/CustomProvider";

import { useAuth } from "@/context/providers/AuthProvider";

import AnimatedContainer from "@/components/animations/AnimatedContainer";

import VoucherPlaceHolderItem from "@/components/items/VoucherPlaceHolderItem";

const MAX_PIN_ATTEMPTS = 3;

function CinemaTicketCheckout() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { customState, customDispatch } = useCustomContext();

  const [summaryOpen, setSummaryOpen] = useState(false);

  const [walletAttemptsLeft, setWalletAttemptsLeft] =
    useState(MAX_PIN_ATTEMPTS);

  const [walletError, setWalletError] = useState("");

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

  const { data: walletStatus } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: disableWallet,
    enabled: walletAttemptsLeft <= 0,
    initialData: {
      active: true,
      timeOut: null,
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(ticketsValidationSchema),

    mode: "onChange",

    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      paymentMethod: "momo",
      mobilePartner: "",
      phonenumber: "",
      confirmPhonenumber: "",
      token: "",
    },
  });

  /*
   |--------------------------------------------------------------------------
   | Form Watchers
   |--------------------------------------------------------------------------
   */

  const paymentMethod = useWatch({
    control,
    name: "paymentMethod",
  });

  const formValues = useWatch({
    control,
  });

  /*
   |--------------------------------------------------------------------------
   | Mutations
   |--------------------------------------------------------------------------
   */

  const paymentMutation = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
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

          categoryType: "ticket",

          path: pathname,

          isWallet: paymentMethod === "wallet",
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
    paymentMethod === "wallet" && walletBalance < totalAmount;

  /*
   |--------------------------------------------------------------------------
   | Effects
   |--------------------------------------------------------------------------
   */

  useEffect(() => {
    if (walletStatus?.active === false) {
      setWalletError(
        `Wallet temporarily disabled. Try again after ${walletStatus?.timeOut}`,
      );

      setValue("token", "", {
        shouldValidate: false,
      });
    }
  }, [walletStatus, setValue]);

  /*
   |--------------------------------------------------------------------------
   | Validation
   |--------------------------------------------------------------------------
   */

  const canSubmit = useMemo(() => {
    if (!isValid) return false;

    if (paymentMethod === "wallet") {
      return (
        !isInsufficientBalance &&
        formValues.token?.length === 4 &&
        walletAttemptsLeft > 0
      );
    }

    return true;
  }, [
    formValues.token,
    isInsufficientBalance,
    isValid,
    paymentMethod,
    walletAttemptsLeft,
  ]);

  /*
   |--------------------------------------------------------------------------
   | Dialog
   |--------------------------------------------------------------------------
   */

  const handleOpenSummary = useCallback(() => {
    if (!canSubmit) return;

    setSummaryOpen(true);
  }, [canSubmit]);

  const handleCloseSummary = useCallback(() => {
    setSummaryOpen(false);
  }, []);

  /*
   |--------------------------------------------------------------------------
   | Build Payload
   |--------------------------------------------------------------------------
   */

  const buildPayload = useCallback(
    (values) => {
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
          name: values.fullName,

          email: values.email,

          phonenumber: values.phonenumber,

          provider: values.mobilePartner,
        },

        isWallet: paymentMethod === "wallet",
      };

      if (paymentMethod === "wallet") {
        payload.token = values.token;
      }

      return payload;
    },
    [filteredTickets, movie, paymentMethod, totalAmount, totalQuantity],
  );

  /*
   |--------------------------------------------------------------------------
   | Submit
   |--------------------------------------------------------------------------
   */
  console.log(errors);
  console.log(formValues.phonenumber);
  console.log(formValues.confirmPhonenumber);
  console.log(formValues.paymentMethod);

  const onSubmit = (values) => {
    setWalletError("");

    const payload = buildPayload(values);

    console.log(payload);

    if (!user?.id) {
      guestMutation.mutateAsync(
        {},
        {
          onSuccess: () => {
            paymentMutation.mutateAsync(payload);
          },
        },
      );
    } else {
      paymentMutation.mutateAsync(payload);
    }
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

                {paymentMethod === "wallet" && isInsufficientBalance && (
                  <Alert severity="warning">Insufficient wallet balance.</Alert>
                )}

                {/* Payment */}

                <PaymentOption
                  showWallet={!!user?.id}
                  showMomo
                  value={paymentMethod}
                  setPaymentMethod={(value) =>
                    setValue("paymentMethod", value, {
                      shouldValidate: true,
                    })
                  }
                  error={!!errors.paymentMethod}
                  helperText={errors.paymentMethod?.message}
                  mobileMoneyDetails={{
                    mobilePartner: formValues.mobilePartner,
                    setMobilePartner: (value) =>
                      setValue("mobilePartner", value, {
                        shouldValidate: true,
                      }),

                    mobilePartnerErr: !!errors.mobilePartner,
                    mobilePartnerHelperText: errors.mobilePartner?.message,

                    phonenumber: formValues.phonenumber,
                    setPhonenumber: (value) =>
                      setValue("phonenumber", value, {
                        shouldValidate: true,
                      }),
                    phonenumberErr: !!errors.phonenumber,
                    phonenumberHelperText: errors.phonenumber?.message,

                    confirmPhonenumber: formValues.confirmPhonenumber,
                    setConfirmPhonenumber: (value) =>
                      setValue("confirmPhonenumber", value, {
                        shouldValidate: true,
                      }),
                    confirmPhonenumberErr: !!errors.confirmPhonenumber,
                    confirmPhonenumberHelperText:
                      errors.confirmPhonenumber?.message,
                  }}
                  walletDetails={{
                    token: formValues.token,
                    setToken: (value) =>
                      setValue("token", value, {
                        shouldValidate: true,
                      }),
                    tokenErr: !!errors.token,
                    tokenHelperText: errors.token?.message,
                  }}
                  fullNameDetails={{
                    fullName: formValues.fullName,

                    setFullName: (value) =>
                      setValue("fullName", value, {
                        shouldValidate: true,
                      }),

                    fullNameErr: !!errors.fullName,

                    fullNameHelperText: errors.fullName?.message,
                  }}
                  emailDetails={{
                    email: formValues.email,

                    setEmail: (value) =>
                      setValue("email", value, {
                        shouldValidate: true,
                      }),

                    emailErr: !!errors.email,

                    emailHelperText: errors.email?.message,
                  }}
                />

                <LoadingButton
                  variant="contained"
                  fullWidth
                  size="large"
                  onClick={handleOpenSummary}
                  disabled={!canSubmit}
                >
                  Review Order
                </LoadingButton>
              </Stack>
            </AnimatedContainer>
          </Stack>
        </Paper>
      </Container>

      {/* Summary Dialog */}

      <Dialog
        open={summaryOpen}
        onClose={handleCloseSummary}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Order Summary
          <IconButton
            onClick={handleCloseSummary}
            sx={{
              position: "absolute",

              right: 8,

              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              {movie?.details?.movie}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {moment(movie?.details?.date).format("dddd, Do MMMM YYYY")} at{" "}
              {moment(movie?.details?.time).format("h:mm a")}
            </Typography>

            <Divider />

            {filteredTickets.map((item) => (
              <VoucherPlaceHolderItem
                key={item.type}
                title={`${item.type} x ${item.quantity}`}
                value={currencyFormatter(item.total)}
              />
            ))}

            <Divider />

            <VoucherPlaceHolderItem
              title="Total Amount"
              value={currencyFormatter(totalAmount)}
              bold
            />

            <VoucherPlaceHolderItem
              title="Payment Method"
              value={paymentMethod === "wallet" ? "Wallet" : "Mobile Money"}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <LoadingButton onClick={handleCloseSummary}>Cancel</LoadingButton>

          <LoadingButton
            variant="contained"
            loading={paymentMutation.isPending || guestMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Confirm Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CinemaTicketCheckout;
