import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Stack,
  Paper,
  Box,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Alert,
  Fade,
  CircularProgress,
  Chip,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  CloseRounded,
  ReceiptLongRounded,
  GroupsRounded,
} from "@mui/icons-material";
import {
  useSearchParams,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";

import { useAuth } from "../../context/providers/AuthProvider";
import { useCustomContext } from "../../context/providers/CustomProvider";

import { makeAirtimeTransaction } from "../../api/paymentAPI";

import { globalAlertType } from "../../components/alert/alertType";
import Back from "../../components/Back";
import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";

import { currencyFormatter } from "../../constants";
import PaymentOption from "../../components/PaymentOption";
import { getMobilePartner } from "../../constants/PhoneCode";

function BulkAirtimeBuy() {
  const queryClient = useQueryClient();

  const navigate = useNavigate();
  const { pathname, state } = useLocation();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();

  const { customDispatch } = useCustomContext();

  const [failureCount, setFailureCount] = useState(3);

  const [previewOpen, setPreviewOpen] = useState(false);

  const [paymentData, setPaymentData] = useState(null);

  const pricingList = useMemo(
    () => state?.recipientPayload || [],
    [state?.recipientPayload],
  );

  useEffect(() => {
    if (!pricingList?.length) {
      navigate(
        "/airtime?link=c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a",
        {
          replace: true,
        },
      );
    }
  }, [pricingList, navigate]);

  const totalAmount = useMemo(() => {
    return pricingList.reduce((sum, item) => sum + Number(item?.price || 0), 0);
  }, [pricingList]);

  const walletBalance = user?.id
    ? Number(
        queryClient.getQueryData({ queryKey: ["wallet-balance", user?.id] }) ||
          0,
      )
    : 0;

  const paymentMutation = useMutation({
    mutationFn: makeAirtimeTransaction,
    retry: false,

    onSuccess: (data) => {
      setPreviewOpen(false);

      navigate("/confirm", {
        replace: true,
        state: {
          id: data?.transactionId,
          categoryType: data?.categoryType,
          path: pathname,
          isWallet: paymentData?.paymentMethod === "wallet",
        },
      });
    },

    onError: (error) => {
      if (error === "Invalid PIN!") {
        const remaining = failureCount - 1;

        setFailureCount(remaining);

        if (remaining <= 0) {
          customDispatch(
            globalAlertType(
              "error",
              "Wallet disabled. Please use mobile money or contact support.",
            ),
          );
        } else {
          customDispatch(
            globalAlertType(
              "error",
              `Invalid PIN! ${remaining} attempt(s) left.`,
            ),
          );
        }

        return;
      }

      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClosePreview = () => {
    if (paymentMutation.isPending) {
      return;
    }

    setPreviewOpen(false);
  };

  const handleSubmitPayment = async (values) => {
    // console.log(values)
    // return

    const isWallet = values?.paymentMethod === "wallet";

    if (
      isWallet &&
      user?.id &&
      (walletBalance <= 0 || walletBalance < totalAmount)
    ) {
      customDispatch(
        globalAlertType(
          "error",
          "Insufficient wallet balance. Please fund your wallet or use mobile money.",
        ),
      );

      return;
    }
    const phoneNo = DOMPurify.sanitize(
      values?.phonenumber || user?.phonenumber,
    );
    const payload = {
      type: "Bulk",
      service: "airtime",
      amount: totalAmount,
      recipient: "",
      phonenumber: phoneNo,
      provider: getMobilePartner(phoneNo),
      email: DOMPurify.sanitize(values?.email || user?.email || ""),
      isWallet,
      bulk: true,
      pricing: pricingList,
    };
    // console.log(payload)
    // return

    if (isWallet) {
      payload.token = values?.token;
    }

    setPaymentData({
      ...values,
      payload,
    });

    setPreviewOpen(true);
  };

  const executePayment = async () => {
    if (!paymentData?.payload) {
      return;
    }

    const proceed = await Swal.fire({
      title: "Confirm Transaction",
      text: "Proceed with bulk airtime payment?",
      icon: "question",
      confirmButtonText: "Yes, Continue",
      showCancelButton: true,
    });

    if (!proceed.isConfirmed) {
      return;
    }

    try {
      paymentMutation.mutate(paymentData.payload);
    } catch (error) {
      customDispatch(globalAlertType("error", "Unable to complete request."));
    }
  };

  // if (!pricingList?.length) {
  //   return <Navigate to="/" replace />;
  // }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        bgcolor: (theme) => theme.palette.grey[50],
      }}
    >
      <Container maxWidth="sm">
        <Back />

        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={3}>
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <GroupsRounded color="primary" />

                    <Typography variant="h5" fontWeight={700}>
                      Bulk Airtime Payment
                    </Typography>
                  </Stack>

                  <Chip
                    color="primary"
                    label={`${pricingList.length} Recipient(s)`}
                  />
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Review your bulk airtime transaction and complete payment
                  securely.
                </Typography>
              </Stack>

              <Alert severity="info">
                Payments are processed instantly after successful confirmation.
              </Alert>

              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={600}>
                    Transaction Summary
                  </Typography>
                </Box>

                <Stack
                  spacing={1}
                  sx={{
                    p: 2,
                    maxHeight: 350,
                    overflowY: "auto",
                  }}
                >
                  {pricingList.map((item, index) => (
                    <VoucherPlaceHolderItem
                      key={`${item?.recipient}-${index}`}
                      title={`${item?.type || "Airtime"} (${item?.recipient})`}
                      value={currencyFormatter(item?.price || 0)}
                    />
                  ))}

                  <VoucherPlaceHolderItem
                    title="Total Amount"
                    value={currencyFormatter(totalAmount)}
                    titleProps={{
                      fontWeight: 700,
                    }}
                    valueProps={{
                      fontWeight: 700,
                      color: "primary.main",
                    }}
                  />
                </Stack>
              </Paper>

              {user?.id && walletBalance < totalAmount && (
                <Alert severity="warning">
                  Your wallet balance is lower than the required payment amount.
                </Alert>
              )}

              <PaymentOption
                showMomo={false}
                showWallet={!!user?.id}
                submitText="Review Payment"
                loading={paymentMutation.isPending}
                initialValues={{
                  fullName: user?.name || "",
                  email: user?.email || "",
                  paymentMethod: "wallet",
                }}
                onSubmit={handleSubmitPayment}
              />
            </Stack>
          </Paper>
        </Fade>
      </Container>

      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="xs"
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <ReceiptLongRounded />

            <Typography variant="h6" fontWeight={700}>
              Checkout Preview
            </Typography>
          </Stack>

          <IconButton
            onClick={handleClosePreview}
            disabled={paymentMutation.isPending}
            sx={{
              color: "primary.contrastText",
            }}
          >
            <CloseRounded />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={0.5}>
            <VoucherPlaceHolderItem title="Service" value="Bulk Airtime" />

            <VoucherPlaceHolderItem
              title="Recipients"
              value={`${pricingList.length}`}
            />

            <VoucherPlaceHolderItem
              title="Payment Method"
              value={
                paymentData?.paymentMethod === "wallet"
                  ? "Wallet"
                  : "Mobile Money"
              }
            />

            {paymentData?.paymentMethod !== "wallet" && (
              <>
                <VoucherPlaceHolderItem
                  title="Mobile Number"
                  value={paymentData?.phonenumber || user?.phonenumber}
                />

                <VoucherPlaceHolderItem
                  title="Network"
                  value={paymentData?.mobilePartner}
                />
              </>
            )}

            <VoucherPlaceHolderItem
              title="Email"
              value={paymentData?.email || user?.email || "N/A"}
            />

            <VoucherPlaceHolderItem
              title="Total Amount"
              value={currencyFormatter(totalAmount)}
              titleProps={{
                fontWeight: 700,
              }}
              valueProps={{
                fontWeight: 700,
                color: "primary.main",
              }}
            />

            <Alert severity="warning">
              Please verify all details before confirming payment.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleClosePreview}
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

export default BulkAirtimeBuy;
