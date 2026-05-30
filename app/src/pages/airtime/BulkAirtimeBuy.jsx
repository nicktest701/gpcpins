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
import { getNonUser } from "../../api/userAPI";

import { globalAlertType } from "../../components/alert/alertType";
import Back from "../../components/Back";
import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";

import { currencyFormatter } from "../../constants";
import PaymentOption from "../../components/PaymentOption";

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
        queryClient.getQueryData(["wallet-balance", user?.id], {
          exact: true,
        }) || 0,
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
          id: data?.id,
          categoryType: "airtime",
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

  const guestMutation = useMutation({
    mutationFn: getNonUser,
    retry: false,

    onError: () => {
      customDispatch(
        globalAlertType(
          "error",
          "Unable to verify guest session. Please try again.",
        ),
      );
    },
  });

  const handleClosePreview = () => {
    if (paymentMutation.isLoading || guestMutation.isLoading) {
      return;
    }

    setPreviewOpen(false);
  };

  const handleSubmitPayment = async (values) => {
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

    const payload = {
      type: "Bulk",
      service: "airtime",
      amount: totalAmount,
      recipient: "",
      phonenumber: DOMPurify.sanitize(values?.phonenumber || user?.phonenumber),
      provider: values?.mobilePartner,
      email: DOMPurify.sanitize(values?.email || user?.email || ""),
      isWallet,
      bulk: true,
      pricing: pricingList,
    };

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
      if (!user?.id) {
        await guestMutation.mutateAsync({});
      }

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
                loading={paymentMutation.isLoading || guestMutation.isLoading}
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
        maxWidth="sm"
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
            disabled={paymentMutation.isLoading || guestMutation.isLoading}
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
            disabled={paymentMutation.isLoading || guestMutation.isLoading}
          >
            Cancel
          </Button>

          <LoadingButton
            variant="contained"
            onClick={executePayment}
            loading={paymentMutation.isLoading || guestMutation.isLoading}
          >
            Confirm Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BulkAirtimeBuy;

// import { useContext, useState, useMemo, useEffect } from "react";
// import { Container, TextField, Typography, Stack, Paper } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   useSearchParams,
//   Navigate,
//   useLocation,
//   useNavigate,
// } from "react-router-dom";
// import Swal from "sweetalert2";
// import { AuthContext, useAuth } from "../../context/providers/AuthProvider";
// import {
//   CustomContext,
//   useCustomContext,
// } from "../../context/providers/CustomProvider";
// import { globalAlertType } from "../../components/alert/alertType";
// import { currencyFormatter } from "../../constants";
// import Back from "../../components/Back";
// import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";
// import PaymentOption from "../../components/PaymentOption";
// import { disableWallet, getNonUser } from "../../api/userAPI";
// import { makeAirtimeTransaction } from "../../api/paymentAPI";
// import { bulkAirtimeValidationSchema } from "../../config/validationSchema";

// function BulkAirtimeBuy() {
//   const queryClient = useQueryClient();
//   const { customDispatch } = useCustomContext();
//   const { pathname, state } = useLocation();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const { user } = useAuth();
//   const [failureCount, setFailCount] = useState(3);

//   const pricingList = state?.recipientPayload;
//   const sessionAmount = state?.totalAmount;

//   useEffect(() => {
//     if (!pricingList) {
//       navigate(
//         "/airtime?link=c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a",
//       );
//     }
//   }, [pricingList]);

//   // const pricingInfo = searchParams.get("info");

//   const totalAmount = useMemo(() => {
//     return pricingList.reduce((sum, item) => sum + (item.price || 0), 0);
//   }, [pricingList]);

//   // Validate session storage amount matches total

//   // React Hook Form setup
//   const {
//     control,
//     handleSubmit,
//     watch,
//     setValue,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm({
//     resolver: yupResolver(bulkAirtimeValidationSchema()),
//     defaultValues: {
//       amount: sessionAmount,
//     },
//   });

//   const token = watch("token");

//   // Wallet balance check
//   const walletBalance = user?.id
//     ? queryClient.getQueryData(["wallet-balance", user?.id], { exact: true })
//     : 0;
//   const isInsufficientBalance =
//     paymentMethod === "wallet" &&
//     user?.id &&
//     (Number(walletBalance) === 0 || Number(walletBalance) < totalAmount);

//   // Payment mutation
//   const paymentMutation = useMutation({
//     mutationFn: makeAirtimeTransaction,
//     onSuccess: (data) => {
//       navigate("/confirm", {
//         replace: true,
//         state: {
//           id: data?.id,
//           categoryType: "airtime",
//           path: pathname,
//           isWallet: paymentMethod === "wallet",
//         },
//       });
//     },
//     onError: async (error) => {
//       if (error === "Invalid PIN!") {
//         const newCount = failureCount - 1;
//         setFailCount(newCount);
//         if (newCount === 0) {
//           setValue("token", "");
//           customDispatch(
//             globalAlertType(
//               "error",
//               `Wallet disabled. Please use mobile money or contact support.`,
//             ),
//           );
//         } else {
//           setValue("token", "");
//           customDispatch(
//             globalAlertType(
//               "error",
//               `${error} ${newCount} attempt(s) left. Wallet will be disabled after ${
//                 newCount - 1
//               } more attempt(s).`,
//             ),
//           );
//         }
//       } else {
//         customDispatch(globalAlertType("error", error));
//       }
//     },
//   });

//   // Guest user check mutation
//   const guestMutation = useMutation({
//     mutationFn: getNonUser,
//     onSuccess: () => {
//       // After guest check, proceed with payment
//       handlePaymentSubmit();
//     },
//     onError: () => {
//       customDispatch(
//         globalAlertType("error", "Failed to verify user. Please try again."),
//       );
//     },
//   });

//   // Payment submission logic
//   const handlePaymentSubmit = (payload) => {
//     paymentMutation.mutate(payload);
//   };

//   const onSubmit = (values) => {
//     // Validate wallet balance
//     if (paymentMethod === "wallet" && isInsufficientBalance) {
//       customDispatch(
//         globalAlertType(
//           "error",
//           "Insufficient wallet balance. Please fund your wallet or use mobile money.",
//         ),
//       );
//       return;
//     }

//     Swal.fire({
//       title: "Processing",
//       text: `Proceed with payment?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         const payload = {
//           type: "Bulk",
//           service: "airtime",
//           amount: totalAmount,
//           recipient: "", // not used for bulk
//           phonenumber: values.phonenumber || user?.phonenumber,
//           provider: values.mobilePartner,
//           email: values.email || user?.email,
//           isWallet: paymentMethod === "wallet",
//           bulk: true,
//           pricing: pricingList, // send the list
//         };

//         if (paymentMethod === "wallet") {
//           payload.token = token;
//         }

//         // If user not logged in, run guest check first
//         if (!user?.id) {
//           guestMutation.mutate({});
//         } else {
//           paymentMutation.mutate(payload);
//         }
//       }
//     });
//   };

//   return (
//     <Container maxWidth="sm" sx={{ py: 4 }}>
//       <Back />
//       <Typography variant="h4" gutterBottom>
//         Payment Information
//       </Typography>
//       <Typography variant="body2" color="text.secondary" paragraph>
//         Verify your payment details to complete the transaction.
//       </Typography>

//       <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
//         {/* Pricing summary */}
//         <Stack
//           sx={{
//             bgcolor: "action.hover",
//             p: 2,
//             borderRadius: 1,
//             mb: 3,
//           }}
//         >
//           <Typography variant="subtitle2" color="text.secondary" gutterBottom>
//             Recipients ({pricingList.length})
//           </Typography>
//           {pricingList.map((item) => (
//             <VoucherPlaceHolderItem
//               key={item.id}
//               title={`${item.type} (${item.recipient})`}
//               value={currencyFormatter(item.price)}
//             />
//           ))}
//           <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
//             <Typography variant="body2" fontWeight="bold">
//               Total Amount:
//             </Typography>
//             <Typography variant="body1" fontWeight="bold" color="primary.main">
//               {currencyFormatter(totalAmount)}
//             </Typography>
//           </Stack>
//         </Stack>

//         <form onSubmit={handleSubmit(onSubmit)} noValidate>
//           <Stack spacing={3}>
//             {/* Payment options */}
//             <PaymentOption
//               showMomo
//               showWallet={!!user?.id}
//               initialValues={{
//                 fullName: user?.name || "",

//                 email: user?.email || "",
//               }}
//               onSubmit={() => {}}
//             />
//           </Stack>
//         </form>
//       </Paper>
//     </Container>
//   );
// }

// export default BulkAirtimeBuy;
