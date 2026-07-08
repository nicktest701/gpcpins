import { useContext, useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Stack,
  Typography,
  Paper,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Alert,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete, CreditCard, Close } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { LoadingButton } from "@mui/lab";
import { globalAlertType } from "@/components/alert/alertType";
import { disableWallet } from "@/api/userAPI";
import { makeElectricityPayment } from "@/api/paymentAPI";
import { deleteMeter, getMeterById } from "@/api/meterAPI";
import { currencyFormatter } from "@/constants";
import PaymentOption from "@/components/PaymentOption";
import { isBetween50And99 } from "@/config/validation";
import { prepaidValidationSchema } from "../../../config/validationSchema";
import { useAuth } from "../../../context/providers/AuthProvider";
import { useCustomContext } from "../../../context/providers/CustomProvider";

const ViewMeter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();

  // Modal state
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [failureCount, setFailCount] = useState(3);

  // Fetch meter data
  const {
    data: meter,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["meter", id],
    queryFn: () => getMeterById(id),
    enabled: !!id,
  });

  // Wallet status for disabled wallet
  const { data: walletStatus } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: () => disableWallet(),
    enabled: failureCount === 0,
    initialData: { active: true, timeOut: null },
  });

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: makeElectricityPayment,
    onSuccess: (data) => {
      navigate("/confirm", {
        replace: true,
        state: {
          id: data?.id,
          categoryType: "prepaid",
          path: pathname,
          isWallet: paymentMethod === "wallet",
        },
      });
    },
    onError: (error) => {
      if (error === "Invalid PIN!") {
        const newCount = failureCount - 1;
        setFailCount(newCount);
        if (newCount === 0) {
          customDispatch(
            globalAlertType(
              "error",
              `Wallet disabled due to multiple failed attempts. Try again after ${walletStatus?.timeOut}`,
            ),
          );
        } else {
          customDispatch(
            globalAlertType(
              "error",
              `Invalid PIN! ${newCount} attempt(s) left.`,
            ),
          );
        }
      } else {
        customDispatch(globalAlertType("error", error));
      }
    },
  });

  // Delete meter mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMeter,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data));
      navigate("/electricity/meters");
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  // React Hook Form for payment
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(prepaidValidationSchema()),
    defaultValues: {
      email: user?.email || "",
      amount: "",
      paymentMethod: user?.id ? "wallet" : "momo",
      mobilePartner: "",
      phonenumber: user?.phonenumber || "",
      confirmPhonenumber: "",
      token: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const amount = watch("amount");
  const token = watch("token");
  const mobilePartner = watch("mobilePartner");
  const phonenumber = watch("phonenumber");

  // Wallet balance check
  const walletBalance = user?.id
    ? queryClient.getQueryData(["wallet-balance", user?.id])
    : 0;

  // Calculate charges and total
  const calculatedAmounts = useMemo(() => {
    const amt = Number(amount);
    if (!amt || amt <= 0) return { topup: 0, charges: 0, total: 0 };
    if (isBetween50And99(amt)) {
      const charges = 2;
      return { topup: amt, charges, total: amt + charges };
    } else {
      const charges = 0.02 * amt;
      return { topup: amt, charges, total: amt + charges };
    }
  }, [amount]);

  const isInsufficientBalance =
    paymentMethod === "wallet" &&
    user?.id &&
    (Number(walletBalance) === 0 ||
      Number(walletBalance) < calculatedAmounts.total);

  const handleBuyClick = () => {
    if (!meter) return;
    setBuyModalOpen(true);
  };

  const handleCloseModal = () => {
    setBuyModalOpen(false);
    reset();
  };

  const onSubmit = (values) => {
    // Check wallet balance
    if (paymentMethod === "wallet" && isInsufficientBalance) {
      customDispatch(
        globalAlertType(
          "error",
          "Insufficient wallet balance. Please top up your wallet.",
        ),
      );
      return;
    }

    const payload = {
      user: user?.id,
      meter: meter.id,
      info: {
        amount: calculatedAmounts.total,
        email: DOMPurify.sanitize(values.email),
        phonenumber: values.phonenumber || user?.phonenumber,
        provider: values.mobilePartner,
      },
      amount: calculatedAmounts.total,
      topup: calculatedAmounts.topup,
      charges: calculatedAmounts.charges,
      isWallet: paymentMethod === "wallet",
    };

    if (paymentMethod === "wallet") {
      payload.token = values.token;
    }

    Swal.fire({
      title: "Confirm Transaction",
      html: `
        <div style="text-align: left;">
          <p><strong>Meter:</strong> ${meter.number} (${meter.name})</p>
          <p><strong>Top-up:</strong> ${currencyFormatter(calculatedAmounts.topup)}</p>
          <p><strong>Charges:</strong> ${currencyFormatter(calculatedAmounts.charges)}</p>
          <p><strong>Total:</strong> ${currencyFormatter(calculatedAmounts.total)}</p>
          <p><strong>Payment:</strong> ${paymentMethod === "wallet" ? "Wallet" : "Mobile Money"}</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Proceed",
    }).then((result) => {
      if (result.isConfirmed) {
        paymentMutation.mutate(payload);
      }
    });
  };

  const handleDeleteMeter = () => {
    Swal.fire({
      title: "Remove Meter",
      text: "Are you sure you want to remove this meter?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(meter.id);
      }
    });
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="40%" />
          <Divider sx={{ my: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} />
        </Paper>
      </Container>
    );
  }

  if (isError || !meter) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Meter not found or failed to load.</Alert>
        <Button
          variant="contained"
          onClick={() => navigate("/electricity/meters")}
          sx={{ mt: 2 }}
        >
          Back to Meters
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Typography variant="h4" fontWeight="bold">
            Meter Details
          </Typography>
          <Tooltip title="Remove Meter">
            <IconButton color="error" onClick={handleDeleteMeter}>
              <Delete />
            </IconButton>
          </Tooltip>
        </Stack>

        {/* Meter Info Card */}
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Meter Number
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {meter.number}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Meter Name
              </Typography>
              <Typography variant="body1">{meter.name || "—"}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Type
              </Typography>
              <Chip
                label={`${meter.type} (IMES)`}
                size="small"
                color="primary"
              />
            </Stack>
            {meter.spn && (
              <>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    SPN Number
                  </Typography>
                  <Typography variant="body1">{meter.spn}</Typography>
                </Stack>
              </>
            )}
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1">
                {meter.createdAt
                  ? new Date(meter.createdAt).toLocaleDateString()
                  : "—"}
              </Typography>
            </Stack>
          </Stack>
        </Paper>

        {/* Buy Button */}
        <Button
          variant="contained"
          size="large"
          fullWidth
          startIcon={<CreditCard />}
          onClick={handleBuyClick}
          sx={{ py: 1.5, fontSize: "1rem" }}
        >
          Buy Prepaid Units
        </Button>
      </Container>

      {/* Buy Prepaid Modal */}
      <Dialog
        open={buyModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Buy Prepaid Units
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {/* <Alert severity="info">
              <strong>Fee Structure:</strong> GHS 2.00 for GHS 50–99, or 2% for GHS 100+
            </Alert> */}

            {/* Meter summary */}
            {/* <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
              <Typography variant="subtitle2">Meter: {meter.number}</Typography>
              <Typography variant="caption" color="text.secondary">
                {meter.name}
              </Typography>
            </Paper> */}

            <form
              id="prepaid-payment-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <Stack spacing={2}>
                {/* Amount */}
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      type="number"
                      label="Top-up Amount (GHS)"
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">GH¢</InputAdornment>
                        ),
                      }}
                      error={!!errors.amount}
                      helperText={errors.amount?.message}
                    />
                  )}
                />

                {/* Calculated breakdown */}
                {calculatedAmounts.total > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Top-up:</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {currencyFormatter(calculatedAmounts.topup)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2">Charges:</Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="error"
                        >
                          {currencyFormatter(calculatedAmounts.charges)}
                        </Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight="bold">
                          Total:
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="primary"
                        >
                          {currencyFormatter(calculatedAmounts.total)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Paper>
                )}

                {/* Email */}
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="email"
                      label="Email (optional)"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      size="small"
                      fullWidth
                    />
                  )}
                />

                {/* Payment Options */}
                <PaymentOption
                  showWallet={!!user?.id}
                  showMomo
                  setPaymentMethod={(val) => setValue("paymentMethod", val)}
                  value={paymentMethod}
                  error={!!errors.paymentMethod}
                  helperText={errors.paymentMethod?.message}
                  mobileMoneyDetails={{
                    mobilePartner,
                    setMobilePartner: (val) => setValue("mobilePartner", val),
                    mobilePartnerErr: !!errors.mobilePartner,
                    mobilePartnerHelperText: errors.mobilePartner?.message,
                    phonenumber,
                    setPhonenumber: (val) => setValue("phonenumber", val),
                    phonenumberErr: !!errors.phonenumber,
                    phonenumberHelperText: errors.phonenumber?.message,
                    confirmPhonenumber: watch("confirmPhonenumber"),
                    setConfirmPhonenumber: (val) =>
                      setValue("confirmPhonenumber", val),
                    confirmPhonenumberErr: !!errors.confirmPhonenumber,
                    confirmPhonenumberHelperText:
                      errors.confirmPhonenumber?.message,
                  }}
                  walletDetails={{
                    token,
                    setToken: (val) => setValue("token", val),
                    tokenErr: !!errors.token,
                    tokenHelperText: errors.token?.message,
                  }}
                />
              </Stack>
            </form>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <LoadingButton
            type="submit"
            form="prepaid-payment-form"
            variant="contained"
            loading={paymentMutation.isPending || isSubmitting}
            disabled={
              !amount || calculatedAmounts.total === 0 || isInsufficientBalance
            }
          >
            Pay{" "}
            {calculatedAmounts.total > 0 &&
              currencyFormatter(calculatedAmounts.total)}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewMeter;
