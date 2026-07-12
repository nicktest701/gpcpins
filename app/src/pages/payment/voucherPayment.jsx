import { useEffect, useMemo, useState } from "react";
import {
  CircularProgress,
  Box,
  Container,
  Paper,
  Fade,
  useTheme,
  Button,
  Typography,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import PaymentIcon from "@mui/icons-material/Payment";
import CloseIcon from "@mui/icons-material/Close";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";
import { currencyFormatter } from "@/constants";
import { makeMomoTransaction } from "@/api/paymentAPI";
import { getWalletStatus, disableWallet } from "@/api/userAPI";
import { globalAlertType } from "@/components/alert/alertType";
import PaymentOption from "@/components/PaymentOption";
import VoucherPlaceHolderItem from "@/components/items/VoucherPlaceHolderItem";
import { useAuth } from "../../context/providers/AuthProvider";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { useSocket } from "../../context/providers/SocketProvider";
import { useSessionStorage } from "../../hooks/useSessionStorage";

function VoucherPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomContext();
  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const theme = useTheme();
  const [voucherPayload, setVoucherPayload] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [failureCount, setFailCount] = useSessionStorage('fail-count',3);
  const payload = state?.data;

  const { joinPaymentRoom, leavePaymentRoom } = useSocket();

  // Wallet status
  const { data: walletStatus, isLoading: isLoadingWalletStatus} = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && payload?.isWallet,
  });

  const fetchedBallanceStatus = queryClient.getQueryData({
    queryKey: ["wallet-status", user?.id],
  });

  // Payment mutations
  const paymentMutation = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
  });

  useEffect(() => {
    if (user?.id) {
      joinPaymentRoom(user?.id);
      return;
    }

    if (voucherPayload?.phonenumber) {
      joinPaymentRoom(voucherPayload?.phonenumber);
    }

    return () => {
      leavePaymentRoom(user?.id);
      leavePaymentRoom(voucherPayload?.phonenumber);
    };
  }, [
    user?.id,
    voucherPayload?.phonenumber,
    joinPaymentRoom,
    leavePaymentRoom,
  ]);

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
    voucherPayload?.paymentMethod === "wallet" &&
    walletBalance < payload.totalAmount;

  const handleGoBack = () => {
    customDispatch({ type: "getVoucherPaymentDetails", payload: { data: {} } });
    navigate(state?.path || "/evoucher?_pid=1", { replace: true });
  };

  // This function opens the summary dialog; payment is not yet submitted.
  const openSummary = () => {
    setSummaryOpen(true);
  };
  const handleCloseSummary = () => setSummaryOpen(false);

  // This function executes the actual payment after user confirms in the summary dialog.
  const executePayment = async () => {
    const payloadData = {
      category: payload?.category,
      categoryId: payload?.categoryId,
      service: "voucher",
      voucherName: payload?.voucherName,
      price: payload?.price,
      quantity: payload?.quantity,
      totalAmount: payload?.totalAmount,
      user: {
        name: voucherPayload?.fullName || "Customer",
        email: DOMPurify.sanitize(voucherPayload?.email) || "",
        phonenumber: DOMPurify.sanitize(
          voucherPayload?.phonenumber || user?.phonenumber,
        ),
        provider: voucherPayload?.mobilePartner,
      },
      isWallet: voucherPayload?.paymentMethod === "wallet",
    };

    if (voucherPayload?.paymentMethod === "wallet") {
      payloadData.token = voucherPayload?.token;
    }

    Swal.fire({
      title: "Confirm Payment",
      text: "Proceed with payment?",
      icon: "question",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        paymentMutation.mutateAsync(payloadData, {
          onSettled: () => {
            handleCloseSummary();
            paymentMutation.reset();
          },
          onSuccess: (data) => {
            if (data?.transactionId) {
              navigate("/confirm", {
                replace: true,
                state: {
                  id: data.transactionId,
                  transactionReference: data?.reference,
                  phonenumber: voucherPayload?.phonenumber || user?.phonenumber,
                  categoryType: "voucher",
                  path: pathname,
                  isWallet: payloadData.isWallet,
                  mobilePartner: voucherPayload?.mobilePartner,
                },
              });
            }
          },
          onError: async (error) => {
            if (error === "Invalid PIN!") {
              const newCount = failureCount - 1;
              setFailCount(newCount);
              if (newCount === 0) {
                await disableWallet();

                queryClient.invalidateQueries({
                  queryKey: ["wallet-status", user?.id],
                });

                customDispatch(
                  globalAlertType(
                    "error",
                    `Wallet disabled. Please use mobile money or contact support.`,
                  ),
                );
                 setFailCount(newCount);
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
      }
    });
  };

  // Redirect if no payload
  if (!payload?.category) {
    return <Navigate to="/evoucher?_pid=1" />;
  }

  // Loading wallet status
  if (payload?.isWallet && isLoadingWalletStatus) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Wallet disabled view
  if (payload?.isWallet && (failureCount <= 0 || !walletStatus?.active)) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Wallet Disabled
          </Typography>
          <Typography color="text.secondary" paragraph>
            Your wallet has been disabled due to multiple failed attempts.
            {walletStatus?.timeOut &&
              ` Try again after ${walletStatus.timeOut}.`}
          </Typography>
          <Button variant="contained" onClick={handleGoBack}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", py: 4, bgcolor: theme.palette.grey[50] }}>
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Paper
            elevation={1}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              p: { xs: 3, sm: 4 },
            }}
          >
            {/* Payment Form */}
            <Stack>
         

              <PaymentOption
                showMomo
                showWallet={!!user?.id}
                initialValues={{
                  fullName: user?.name || "",
                  email: user?.email || "",
                }}
                onSubmit={async (values) => {
                  if (
                    values?.paymentMethod === "wallet" &&
                    fetchedBallanceStatus.active === false
                  ) {
                    customDispatch(
                      globalAlertType(
                        "error",
                        `Wallet disabled. Please use mobile money or contact support.`,
                      ),
                    );
                    return;
                  }

                  if (isInsufficientBalance) {
                    customDispatch(
                      globalAlertType("error", "Insufficient wallet balance"),
                    );

                    return;
                  }
                  setVoucherPayload(values);
                  openSummary();
                }}
              />
            </Stack>
          </Paper>
        </Fade>
      </Container>

      {/* Order Summary Dialog */}
      <Dialog
        open={summaryOpen}
        onClose={handleCloseSummary}
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
            <Typography variant="h6" textAlign="center" color="primary">
              {payload?.voucherName} VOUCHER
            </Typography>
            <Stack spacing={0.5}>
              <VoucherPlaceHolderItem
                title="Price"
                value={currencyFormatter(payload?.price)}
              />
              <VoucherPlaceHolderItem
                title="Quantity"
                value={payload?.quantity}
              />

              <VoucherPlaceHolderItem
                title="Payment Method"
                value={
                  voucherPayload?.paymentMethod === "wallet"
                    ? "Wallet"
                    : "Mobile Money"
                }
              />
              {voucherPayload?.paymentMethod !== "wallet" && (
                <>
                  <VoucherPlaceHolderItem
                    title="Mobile Number"
                    value={voucherPayload?.phonenumber}
                  />
                </>
              )}
              {payload?.user?.name && (
                <VoucherPlaceHolderItem
                  title="Name"
                  value={payload?.user?.name || "N/A"}
                />
              )}
              {payload?.user?.name && (
                <VoucherPlaceHolderItem title="Email" value={payload?.email} />
              )}

              {/* <Divider /> */}

              <Stack direction="row" spacing={1} alignItems="center">
                <PaymentIcon fontSize="small" color="primary" />
                <VoucherPlaceHolderItem
                  title="Total Amount"
                  value={currencyFormatter(payload?.totalAmount)}
                />
              </Stack>
              <Divider />
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
              >
                By confirming, you agree to our terms and conditions.
              </Typography>
            </Stack>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseSummary}
            disabled={paymentMutation.isPending}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            onClick={executePayment}
            loading={paymentMutation.isPending}
          >
            Confirm Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VoucherPayment;
