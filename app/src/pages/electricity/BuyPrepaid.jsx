import { useState, useMemo, } from "react";
import {
  Container,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Paper,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useNavigate,
  useLocation,
  useParams,
  Navigate,
} from "react-router-dom";
import Swal from "sweetalert2";
import { currencyFormatter } from "@/constants";
import { prepaidPaymentValidationSchema } from "@/config/validationSchema";
import { globalAlertType } from "@/components/alert/alertType";
import { makeElectricityPayment } from "@/api/paymentAPI";
import { isBetween50And99 } from "@/config/validation";
import { useAuth } from "@/context/providers/AuthProvider";
import { useCustomContext } from "@/context/providers/CustomProvider";
import PaymentOption from "@/components/PaymentOption";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import CheckOutItem from "@/components/items/CheckOutItem";

function BuyPrepaid() {
  const { pathname, state } = useLocation();
  const navigate = useNavigate();
  const { meterNo } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { customDispatch } = useCustomContext();
  const [prepaidPayload, setPrepaidPayload] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [failureCount, setFailCount] = useState(3);

  // Meter details from previous page state
  const meterDetails = state?.meterDetails || {
    number: meterNo || "",
    name: "",
    address: "",
    spn: "",
  };

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: makeElectricityPayment,
    retry: false,
  });

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(prepaidPaymentValidationSchema),
    defaultValues: {
      amount: "",
    },
  });


  const amount = watch("amount");

  // Calculate charges and total
  const calculated = useMemo(() => {
    const amt = Number(amount);
    if (!amt || amt < 50) return { topup: 0, charges: 0, total: 0 };
    if (isBetween50And99(amt)) {
      const charges = 2;
      return { topup: amt, charges, total: amt + charges };
    } else {
      const charges = 0.02 * amt;
      return { topup: amt, charges, total: amt + charges };
    }
  }, [amount]);

  // Wallet balance check
  const walletBalance = user?.id
    ? queryClient.getQueryData(["wallet-balance", user?.id])
    : 0;
  const isInsufficientBalance =
    prepaidPayload?.paymentMethod === "wallet" &&
    user?.id &&
    (Number(walletBalance) === 0 || Number(walletBalance) < calculated.total);

  // Form validation for review button

  const handleOpenSummary = () => setSummaryOpen(true);
  const handleCloseSummary = () => setSummaryOpen(false);

  const onSubmit = async () => {
    const payload = {
      meter: meterDetails.number,
      type:'prepaid',
      service:'prepaid',
      info: {
        amount: calculated.total,
        email: prepaidPayload?.email || user?.email,
        phonenumber: prepaidPayload?.phonenumber || user?.phonenumber,
        provider: prepaidPayload?.mobilePartner||'wallet',
      },
      topup: calculated.topup,
      charges: calculated.charges,
      amount: calculated.total,
      isWallet: prepaidPayload?.paymentMethod === "wallet",
    };
    if (prepaidPayload?.paymentMethod === "wallet") {
      payload.token = prepaidPayload?.token;
    }

    Swal.fire({
      title: "Confirm Payment",
      text: "Proceed with payment?",
      icon: "question",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        paymentMutation.mutate(payload, {
          onSettled: () => {
            handleCloseSummary();
          },
          onSuccess: (data) => {
            navigate("/confirm", {
              replace: true,
              state: {
                id: data.id,
                categoryType: "prepaid",
                path: pathname,
                isWallet: payload.isWallet,
              },
            });
          },
          onError: (error) => {
            if (error === "Invalid PIN!") {
              const newCount = failureCount - 1;
              setFailCount(newCount);
              customDispatch(
                globalAlertType(
                  "error",
                  newCount > 0
                    ? `Invalid PIN! ${newCount} attempt(s) left.`
                    : "Wallet disabled due to multiple failed attempts.",
                ),
              );
            } else {
              customDispatch(globalAlertType("error", error));
            }
          },
        });
      }
    });
  };

  if (!meterNo && !meterDetails.number) {
    return <Navigate to="/electricity" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>

        
             <IconButton
              aria-label="back"
              onClick={() => navigate(-1)}
              sx={{ mb: 2, p: 0 }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>

             <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Fee structure:</strong> GHS 2.00 for GHS 50–99, 2% for GHS
              100+. Minimum amount: GHS 50.
            </Alert>
        <Grid container spacing={4}>
          {/* Left column: Meter details */}
          <Grid item xs={12} md={6}>
            <AnimatedContainer>
              <Container
                sx={{
                  borderRadius: 2,
                  padding: 3,
                  display: "flex",
                  flexDirection: "column",
                  rowGap: 1,
                  bgcolor: "secondary.main",
                  color: "secondary.contrastText",
                }}
              >
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    // marginY={1}
                    bgcolor="#fff"
                    color="#333"
                    padding={2}
                  >
                    <Typography variant="body2">Top Up Amount</Typography>
                    <Typography variant="body2">
                      {currencyFormatter(amount || 0)}
                    </Typography>
                  </Stack>
                  <small style={{ color: "var(--primary)" }}>
                    NOTE: Minimum amount you can buy is <b> GHS 50</b>.
                  </small>
                  <CheckOutItem
                    color="secondary.contrastText"
                    title="Meter No."
                    value={meterDetails?.number || meterNo}
                  />
                  <CheckOutItem
                    color="secondary.contrastText"
                    title="Name"
                    value={meterDetails?.name}
                  />
                  <CheckOutItem
                    color="secondary.contrastText"
                    title="Type"
                    value="PREPAID (IMES)"
                  />

                  <CheckOutItem
                    color="secondary.contrastText"
                    title="District"
                    value={
                      meterDetails?.district
                        ? `${meterDetails.district} District`
                        : "N/A"
                    }
                  />

                  <CheckOutItem
                    color="secondary.contrastText"
                    title="Email "
                    value={meterDetails?.email || user?.email || "N/A"}
                  />
                  <CheckOutItem
                    color="secondary.contrastText"
                    title="Mobile No."
                    value={meterDetails?.phonenumber || user?.phonenumber || "N/A"}
                  />
                </>
                {meterDetails.isLoading && (
                  <Typography>Loading Meter Information.....</Typography>
                )}
              </Container>
            </AnimatedContainer>
          </Grid>

          {/* Right column: Payment form */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Payment Details
            </Typography>
       

            <Stack spacing={2}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="number"
                    label="Top-up Amount (GHS)"
                    required
                    placeholder="0.00"
                    fullWidth
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
              {calculated.total > 0 && (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, bgcolor: "action.hover" }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Top-up:</Typography>
                      <Typography variant="body2">
                        {currencyFormatter(calculated.topup)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2">Charges:</Typography>
                      <Typography variant="body2" color="error.main">
                        {currencyFormatter(calculated.charges)}
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
                        color="primary.main"
                      >
                        {currencyFormatter(calculated.total)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
              )}

              <PaymentOption
                showMomo
                showWallet={!!user?.id}
                initialValues={{
                  fullName: user?.name || "",
                  email: user?.email || "",
                }}
                onSubmit={(values) => {
                  // clearErrors("amount");
                  //validate amount before proceeding
                  if (!isValid) {
                    //validate amount here
                    if (amount < 50) {
                      customDispatch(
                        globalAlertType(
                          "error",
                          "Minimum amount you can buy is GHS 50.",
                        ),
                      );
                      setError("amount", {
                        type: "manual",
                        message: "Minimum amount you can buy is GHS 50.",
                      });
                      return;
                    }
                  }

                  if (
                    values.paymentMethod === "wallet" &&
                    isInsufficientBalance
                  ) {
                    customDispatch(
                      globalAlertType("error", "Insufficient wallet balance"),
                    );
                    return;
                  }

                  setPrepaidPayload(values);
                  handleOpenSummary();
                  clearErrors("amount");
                }}
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Order Summary Dialog */}
      <Dialog
        open={summaryOpen}
        onClose={handleCloseSummary}
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
            onClick={handleCloseSummary}
            sx={{ color: "primary.contrastText" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, bgcolor: "background.default" }}>
          <Stack spacing={2}>
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
              <Stack spacing={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Meter Details
                </Typography>
                <CheckOutItem
                  title="Meter Number"
                  value={meterDetails.number || meterNo}
                />
                <CheckOutItem title="Name" value={meterDetails.name || "N/A"} />
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
              <Typography variant="subtitle1" fontWeight="bold" pb={2}>
                Payment Summary
              </Typography>

              <Stack spacing={1}>
                <CheckOutItem
                  title="Payment Method"
                  value={
                    prepaidPayload?.paymentMethod === "wallet"
                      ? "Wallet"
                      : "Mobile Money"
                  }
                />
                
                {prepaidPayload?.paymentMethod !== "wallet" && (
                  <>
                    <CheckOutItem
                      title="Mobile Number"
                      value={prepaidPayload?.phonenumber}
                    />
                    <CheckOutItem
                      title="Provider"
                      value={prepaidPayload?.mobilePartner}
                    />
                  </>
                )}
                <CheckOutItem
                  title="Top-up Amount"
                  value={currencyFormatter(calculated.topup)}
                />
                <CheckOutItem
                  title="Charges"
                  value={currencyFormatter(calculated.charges)}
                />
                <CheckOutItem
                  title="Total"
                  value={currencyFormatter(calculated.total)}
                  bold
                  color="primary.main"
                />

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
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseSummary}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            loading={paymentMutation.isPending}
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

export default BuyPrepaid;
