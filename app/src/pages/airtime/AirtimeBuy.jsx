import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,

} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";
import PaymentIcon from "@mui/icons-material/Payment";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";

import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { yupResolver } from "@hookform/resolvers/yup";

import DOMPurify from "dompurify";

import { number, object } from "yup";

import Swal from "sweetalert2";

import Back from "../../components/Back";

import PaymentOption from "../../components/PaymentOption";

import BundleList from "./BundleList";

import { useAuth } from "../../context/providers/AuthProvider";

import { useCustomContext } from "../../context/providers/CustomProvider";

import { globalAlertType } from "../../components/alert/alertType";

import { makeAirtimeTransaction } from "../../api/paymentAPI";

import { currencyFormatter, getCode } from "../../constants";
import { useSocket } from "../../context/providers/SocketProvider";
/**
 * VALIDATION
 */

const airtimeSchema = object({
  amount: number()
    .typeError("Amount is required")
    .required("Amount is required")
    .min(1, "Minimum amount is GHS 1")
    .max(100, "Maximum amount is GHS 100"),
});

function AirtimeBuy() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { joinPaymentRoom, leavePaymentRoom } = useSocket();
  const { customDispatch } = useCustomContext();
  const [searchParams] = useSearchParams();

  /**
   * QUERY PARAMS
   */

  const type = searchParams.get("type");
  const recipient = searchParams.get("recipient");

  /**
   * LOCAL STATE
   */

  const [failureCount, setFailureCount] = useState(3);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState({
    plan_id: searchParams.get("plan_id"),
    plan_name: searchParams.get("plan_name"),
    volume: searchParams.get("plan_volume"),
    price: searchParams.get("plan_price"),
  });

  /**
   * PROVIDER INFO
   */

  const serviceProviderInfo = useMemo(() => {
    return getCode(recipient);
  }, [recipient]);

  /**
   * BUNDLE VALIDATION
   */

  const isBundleSelected = type !== "Bundle" || !!selectedBundle?.plan_id;

  useEffect(() => {
    if (user?.id) {
      joinPaymentRoom(user?.id);
      return;
    }

    if (paymentData?.phonenumber) {
      joinPaymentRoom(paymentData?.phonenumber);
    }

    return () => {
      leavePaymentRoom(user?.id);
      leavePaymentRoom(paymentData?.phonenumber);
    };
  }, [user?.id, paymentData?.phonenumber, joinPaymentRoom, leavePaymentRoom]);

  /**
   * FORM
   */

  const {
    register,
    watch,
    setValue,
    setError,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(airtimeSchema),

    defaultValues: {
      amount: type === "Bundle" ? Number(selectedBundle?.price) || "" : "",
    },

    mode: "onChange",
  });

  const amount = watch("amount");

  /**
   * SYNC BUNDLE PRICE
   */

  useEffect(() => {
    if (type === "Bundle" && selectedBundle?.price) {
      setValue("amount", Number(selectedBundle.price));
    }
  }, [selectedBundle, type, setValue]);

  /**
   * WALLET BALANCE
   */

  const walletBalance = useMemo(() => {
    if (!user?.id) return 0;

    return Number(queryClient.getQueryData(["wallet-balance", user?.id]) || 0);
  }, [queryClient, user?.id]);

  const isInsufficientBalance =
    paymentData?.paymentMethod === "wallet" &&
    walletBalance < paymentData.totalAmount;

  /**
   * TOTAL AMOUNT
   */

  const totalAmount =
    type === "Bundle"
      ? Number(selectedBundle?.price) || 0
      : Number(amount || 0);

  /**
   * PAYMENT MUTATION
   */

  const paymentMutation = useMutation({
    mutationFn: makeAirtimeTransaction,

    retry: false,

    onSuccess: (data) => {
      navigate("/confirm", {
        replace: true,
        state: {
          id: data?.transactionId,
          categoryType: type === "Bundle" ? "bundle" : "airtime",
          isWallet: paymentData.paymentMethod === "wallet",
          path: pathname,
        },
      });
    },

    onError: (error) => {
      if (error === "Invalid PIN!") {
        const attemptsLeft = failureCount - 1;

        setFailureCount(attemptsLeft);

        if (attemptsLeft <= 0) {
          customDispatch(
            globalAlertType(
              "error",
              "Wallet disabled due to multiple failed attempts.",
            ),
          );

          return;
        }

        customDispatch(
          globalAlertType(
            "error",
            `Invalid PIN. ${attemptsLeft} attempt(s) left.`,
          ),
        );

        return;
      }

      customDispatch(globalAlertType("error", error || "Transaction failed."));
    },
  });

  /**
   * OPEN CHECKOUT PREVIEW
   */

  const handleReviewCheckout = async (values) => {
    /**
     * VALIDATE BUNDLE
     */

    if (type === "Bundle" && !isBundleSelected) {
      customDispatch(globalAlertType("error", "Please select a bundle."));

      return;
    }

    /**
     * VALIDATE AIRTIME
     */

    if (type === "Airtime") {
      const isValid = await airtimeSchema
        .validate({
          amount,
        })
        .then(() => true)
        .catch(() => false);

      if (!isValid) {
        setError("amount", {
          message: "Required*",
        });
        return;
      }
    }

    /**
     * VALIDATE WALLET
     */

    if (isInsufficientBalance) {
      customDispatch(globalAlertType("error", "Insufficient wallet balance."));

      return;
    }

    setPaymentData({
      ...values,

      amount: totalAmount,
      recipient,
      provider: serviceProviderInfo?.providerName,

      type,
    });

    setCheckoutOpen(true);
  };

  /**
   * SUBMIT PAYMENT
   */

  const executePayment = async () => {
    if (!paymentData) {
      return;
    }

    const payload = {
      type,
      service: type?.toLowerCase(),
      amount: paymentData.amount,
      recipient: paymentData.recipient,
      phonenumber: DOMPurify.sanitize(
        paymentData.phonenumber || user?.phonenumber,
      ),
      provider: paymentData.provider,
      email: DOMPurify.sanitize(paymentData.email || user?.email || ""),
      isWallet: paymentData.paymentMethod === "wallet",
    };

    /**
     * BUNDLE INFO
     */

    if (type === "Bundle") {
      payload.plan = {
        id: selectedBundle.plan_id,
        name: selectedBundle.plan_name,
        volume: selectedBundle.volume,
      };
    }

    /**
     * WALLET TOKEN
     */

    if (paymentData.paymentMethod === "wallet") {
      payload.token = paymentData.token;
    }

    /**
     * CONFIRMATION
     */

    // console.log(payload);
    // return;

    const result = await Swal.fire({
      title: "Confirm Transaction",

      text: "Proceed with payment?",

      icon: "question",

      showCancelButton: true,

      confirmButtonText: "Confirm",
    });

    if (!result.isConfirmed) {
      return;
    }

    await paymentMutation.mutateAsync(payload);
  };

  /**
   * INVALID ROUTE
   */

  if (!recipient || !["Airtime", "Bundle"].includes(type)) {
    return (
      <Navigate to="/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5" />
    );
  }

  return (
    <>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Back />

        <Fade in timeout={400}>
          <Paper
            elevation={1}
            sx={{
              p: {
                xs: 3,
                sm: 4,
              },

              borderRadius: 2,

              overflow: "hidden",
            }}
          >
            <Stack spacing={3}>
              {/* HEADER */}

              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={700}>
                  Complete Top-Up
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Review recipient details and complete payment securely.
                </Typography>
              </Stack>

              {/* AIRTIME NOTICE */}

              {type === "Airtime" && (
                <Alert severity="info">
                  Minimum airtime:
                  <strong> GHS 1</strong> | Maximum:
                  <strong> GHS 100</strong>
                </Alert>
              )}

              {/* BUNDLE WARNING */}

              {type === "Bundle" && !isBundleSelected && (
                <Alert severity="warning">
                  Please select a bundle to continue.
                </Alert>
              )}

              {/* RECIPIENT */}

              <Paper
                elevation={0}
                sx={{
                  p: 2,

                  bgcolor: "secondary.main",

                  color: "primary.contrastText",
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      variant="rounded"
                      src={serviceProviderInfo?.image}
                      sx={{
                        width: 60,
                        height: 45,
                        bgcolor: "white",
                      }}
                    />

                    <Stack>
                      <Typography fontWeight={700}>
                        {serviceProviderInfo?.providerName}
                      </Typography>

                      <Typography variant="body2">{recipient}</Typography>
                    </Stack>
                  </Stack>

                  <PhoneAndroidIcon />
                </Stack>

                {type === "Bundle" && selectedBundle?.plan_name && (
                  <Box mt={2}>
                    <Typography variant="body2" color="primary.main">
                      {selectedBundle.plan_name} ({selectedBundle.volume})
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* AMOUNT */}

              <Stack spacing={2}>
                {type === "Bundle" ? (
                  <TextField
                    fullWidth
                    size="small"
                    label="Bundle Price"
                    value={totalAmount}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">GH¢</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">.00</InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
                     size="small"
                    type="number"
                    label="Top-Up Amount"
                    placeholder="0.00"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    {...register("amount")}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">GH¢</InputAdornment>
                      ),
                    }}
                  />
                )}
              </Stack>

              {/* PAYMENT */}

              <PaymentOption
                showMomo={false}
                showWallet={!!user?.id}
                initialValues={{
                  fullName: user?.name || "",
                  email: user?.email || "",
                  paymentMethod: "wallet",
                }}
                onSubmit={handleReviewCheckout}
              />
            </Stack>
          </Paper>
        </Fade>

        {/* BUNDLES */}

        {type === "Bundle" && (
          <Box mt={3}>
            <BundleList
              selectedBundle={selectedBundle}
              setSelectedBundle={setSelectedBundle}
            />
          </Box>
        )}
      </Container>

      {/* CHECKOUT PREVIEW */}

      <Dialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",

            bgcolor: "primary.lighter",

            color: "primary.contrastText",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptIcon />

            <Typography variant="h6" fontWeight={700}>
              Checkout Preview
            </Typography>
          </Stack>

          <IconButton
            size="small"
            onClick={() => setCheckoutOpen(false)}
            sx={{
              color: "primary.contrastText",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,

              borderRadius: 3,

              border: "1px solid",

              borderColor: "divider",
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Service
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {type}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Recipient
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {recipient}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Network
                </Typography>
                <Stack
                  direction="row"
                  gap={0.5}
                  useFlexGap
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Avatar
                    variant="rounded"
                    src={serviceProviderInfo?.image}
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "white",
                    }}
                  />
                  <Typography variant="body2" fontWeight={600}>
                    {serviceProviderInfo?.providerName}
                  </Typography>
                </Stack>
              </Stack>

              {type === "Bundle" && (
                <>
                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Bundle
                    </Typography>

                    <Typography variant="body2" fontWeight={600}>
                      {selectedBundle.plan_name}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      Volume
                    </Typography>

                    <Typography variant="body2" fontWeight={600}>
                      {selectedBundle.volume}
                    </Typography>
                  </Stack>
                </>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Payment Method
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {paymentData?.paymentMethod === "wallet"
                    ? "Wallet"
                    : "Mobile Money"}
                </Typography>
              </Stack>

              {paymentData?.paymentMethod !== "wallet" && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Payment Number
                  </Typography>

                  <Typography fontWeight={600}>
                    {paymentData?.phonenumber}
                  </Typography>
                </Stack>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Stack direction="row" spacing={1} alignItems="center">
                  <PaymentIcon fontSize="small" color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Total Amount
                  </Typography>
                </Stack>

                <Typography variant="h6" fontWeight={700} color="primary">
                  {currencyFormatter(totalAmount)}
                </Typography>
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                By confirming, you agree to proceed with this transaction.
              </Typography>
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2,
          }}
        >
          <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>

          <LoadingButton
            variant="contained"
            onClick={executePayment}
            loading={paymentMutation.isPending}
          >
            Confirm Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AirtimeBuy;
