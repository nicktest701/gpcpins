import { useContext, useState, useEffect } from "react";
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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";

import { currencyFormatter } from "@/constants";
import { makeMomoTransaction } from "@/api/paymentAPI";
import { disableWallet, getNonUser, getWalletStatus } from "@/api/userAPI";
import { globalAlertType } from "@/components/alert/alertType";
import PaymentOption from "@/components/PaymentOption";
import VoucherPlaceHolderItem from "@/components/items/VoucherPlaceHolderItem";
import { paymentOptionSchema } from "../../config/validationSchema";
import { useAuth } from "../../context/providers/AuthProvider";
import { useCustomContext } from "../../context/providers/CustomProvider";

function VoucherPayment() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    customState: {
      voucherPaymentDetails: { data: payload },
    },
    customDispatch,
  } = useCustomContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const theme = useTheme();

  const [summaryOpen, setSummaryOpen] = useState(false);
  const [failureCount, setFailCount] = useState(3);

  // Wallet status
  const { data: walletStatus, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && payload?.isWallet,
  });

  const { data: disableWalletData } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: () => disableWallet(),
    enabled: failureCount === 0,
    initialData: { active: true, timeOut: null },
  });

  // Payment mutations
  const paymentMutation = useMutation({
    mutationFn: makeMomoTransaction,
    retry: false,
  });

  const guestMutation = useMutation({
    mutationFn: getNonUser,
    retry: false,
  });

  // React Hook Form
  const {
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(paymentOptionSchema()),
    defaultValues: {
      email: "",
      fullName: "",
      paymentMethod: "momo",
      mobilePartner: "",
      phoneNumber: user?.phonenumber || "",
      confirmPhonenumber: "",
      token: "",
    },
  });

  const fullName = watch("fullName");
  const email = watch("email");
  const paymentMethod = watch("paymentMethod");
  const phoneNumber = watch("phoneNumber");
  const confirmPhonenumber = watch("confirmPhonenumber");
  const mobilePartner = watch("mobilePartner");
  const token = watch("token");

  // Wallet balance check
  const walletBalance = user?.id
    ? queryClient.getQueryData(["wallet-balance", user?.id])
    : 0;
  const isInsufficientBalance =
    paymentMethod === "wallet" &&
    user?.id &&
    (Number(walletBalance) === 0 ||
      Number(walletBalance) < payload?.totalAmount);

  // Determine if form is valid for review
  const isFormValidForReview = () => {
    if (paymentMethod === "wallet") {
      return !isInsufficientBalance && token && token.length === 4 && isValid;
    }
    // Mobile money
    return (
      mobilePartner &&
      phoneNumber &&
      confirmPhonenumber &&
      phoneNumber === confirmPhonenumber &&
      isValid
    );
  };

  // Error handling for disabled wallet
  useEffect(() => {
    if (disableWalletData?.active === false) {
      setValue("token", "");
      queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
    }
  }, [disableWalletData, queryClient, setValue]);

  const handleCloseSummary = () => setSummaryOpen(false);

  const handleGoBack = () => {
    customDispatch({ type: "getVoucherPaymentDetails", payload: { data: {} } });
    navigate("/evoucher?_pid=1", { replace: true });
  };

  // This function opens the summary dialog; payment is not yet submitted.
  const openSummary = () => {
    setSummaryOpen(true);
  };

  // This function executes the actual payment after user confirms in the summary dialog.
  const executePayment = async () => {
    // const values = {
    //   paymentMethod,
    //   mobilePartner,
    //   phoneNumber,
    //   confirmPhonenumber,
    //   token,
    // };

    const payloadData = {
      category: payload?.category,
      categoryId: payload?.categoryId,
      service: "voucher",
      voucherName: payload?.voucherName,
      price: payload?.price,
      quantity: payload?.quantity,
      totalAmount: payload?.totalAmount,
      user: {
        name: fullName || "Customer",
        email: DOMPurify.sanitize(email) || "",
        phoneNumber: DOMPurify.sanitize(phoneNumber || user?.phonenumber),
        provider: mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    if (paymentMethod === "wallet") {
      payloadData.token = token;
    }

    Swal.fire({
      title: "Confirm Payment",
      text: "Proceed with payment?",
      icon: "question",
      showCancelButton: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        if (!user?.id) {
          await guestMutation.mutateAsync({});
        }
        paymentMutation.mutate(payloadData, {
          onSuccess: (data) => {
            if (data?.transactionId) {
              navigate("/confirm", {
                replace: true,
                state: {
                  id: data.transactionId,
                  categoryType: "voucher",
                  path: pathname,
                  isWallet: payloadData.isWallet,
                },
              });
              handleCloseSummary();
            }
          },
          onError: (error) => {
            if (error === "Invalid PIN!") {
              const newCount = failureCount - 1;
              setFailCount(newCount);
              if (newCount === 0) {
                customDispatch(
                  globalAlertType(
                    "error",
                    `Wallet disabled. Please use mobile money or contact support.`,
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
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="h6" fontWeight="bold">
                  Payment Information
                </Typography>
                <IconButton onClick={handleGoBack} size="small">
                  <CloseIcon />
                </IconButton>
              </Stack>
              <Divider />
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
                  phonenumber: phoneNumber,
                  setPhonenumber: (val) => setValue("phoneNumber", val),
                  phonenumberErr: !!errors.phoneNumber,
                  phonenumberHelperText: errors.phoneNumber?.message,
                  confirmPhonenumber,
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
                fullNameDetails={{
                  fullName,
                  setFullName: (val) => setValue("fullName", val),
                  fullNameErr: !!errors.fullName,
                  fullNameHelperText: errors.fullName?.message,
                }}
                emailDetails={{
                  email,
                  setEmail: (val) => setValue("email", val),
                  emailErr: !!errors.email,
                  emailHelperText: errors.email?.message,
                }}
              />

              {/* Review & Pay Button */}
              <LoadingButton
                variant="contained"
                fullWidth
                onClick={openSummary}
                disabled={!isFormValidForReview()}
                sx={{ py: 1.5 }}
              >
                Review Order & Pay
              </LoadingButton>
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
                value={paymentMethod === "wallet" ? "Wallet" : "Mobile Money"}
              />
              {paymentMethod !== "wallet" && (
                <>
                  <VoucherPlaceHolderItem
                    title="Mobile Number"
                    value={phoneNumber}
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
          <Button onClick={handleCloseSummary}>Cancel</Button>
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

// export default VoucherPayment;

export default VoucherPayment;

// import { useContext, useState } from "react";
// import Button from "@mui/material/Button";
// import Typography from "@mui/material/Typography";
// import Stack from "@mui/material/Stack";
// import LoadingButton from "@mui/lab/LoadingButton";
// import Swal from "sweetalert2";
// import { Receipt as ReceiptIcon } from "@mui/icons-material";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { Navigate, useLocation, useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import DOMPurify from "dompurify";
// import { CustomContext } from "@/context/providers/CustomProvider";
// import { currencyFormatter } from "@/constants";
// import { makeMomoTransaction } from "@/api/paymentAPI";
// import { disableWallet, getNonUser, getWalletStatus } from "@/api/userAPI";
// import {
//   CircularProgress,
//   Box,
//   Container,
//   Paper,
//   Fade,
//   useTheme,
//   alpha,
//   Divider,
// } from "@mui/material";
// import { AuthContext } from "@/context/providers/AuthProvider";
// import VoucherPlaceHolderItem from "@/components/items/VoucherPlaceHolderItem";
// import { globalAlertType } from "@/components/alert/alertType";
// import PaymentOption from "@/components/PaymentOption";
// import { paymentOptionSchema } from "../../config/validationSchema";
// import { Formik } from "formik";
// import CloseIcon from "@mui/icons-material/Close";
// import IconButton from "@mui/material/IconButton";
// import { useEffect } from "react";

// function VoucherPayment() {
//   const { user } = useContext(AuthContext);
//   const queryClient = useQueryClient();
//   const {
//     customState: {
//       voucherPaymentDetails: { data: payload },
//     },
//     customDispatch,
//   } = useContext(CustomContext);

//   const navigate = useNavigate();
//   const { pathname } = useLocation();
//   const theme = useTheme();

//   const [token, setToken] = useState("");
//   const [err, setErr] = useState("");
//   const [failureCount, setFailCount] = useState(3);

//   const [paymentMethod, setPaymentMethod] = useState("momo");
//   const [mobilePartner, setMobilePartner] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [confirmPhonenumber, setConfirmPhonenumber] = useState("");

//   // Get wallet status
//   const { data, isLoading: isLoadingWalletStatus } = useQuery({
//     queryKey: ["wallet-status"],
//     queryFn: () => getWalletStatus(),
//     enabled: !!user?.id && payload?.isWallet,
//   });

//   // Get wallet status
//   const { data: dataDisableWallet } = useQuery({
//     queryKey: ["disable-wallet"],
//     queryFn: () => disableWallet(),
//     enabled: failureCount === 0,
//     initialData: { active: true, timeOut: null },
//   });

//   useEffect(() => {
//     setErr("");

//     if (dataDisableWallet?.active === false) {
//       const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
//       setErr(message);

//       queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
//     }
//   }, [dataDisableWallet, queryClient]);

//   //Make Payment
//   const paymentMutate = useMutation({
//     mutationFn: makeMomoTransaction,
//     retry: false,
//   });

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: getNonUser,
//     retry: false,
//   });

//   const initialValues = {
//     paymentMethod,
//     token,
//     mobilePartner,
//     phoneNumber,
//     confirmPhonenumber,
//   };

//   const onSubmit = (values) => {
//     const payloadData = {
//       category: payload?.category,
//       categoryId: payload?.categoryId,
//       service: "voucher",
//       voucherName: payload?.voucherName,
//       price: payload?.price,
//       quantity: payload?.quantity,
//       totalAmount: payload?.totalAmount,
//       user: {
//         name: DOMPurify.sanitize(values?.fullName || "Customer"),
//         email: DOMPurify.sanitize(payload?.email),
//         phoneNumber: DOMPurify.sanitize(phoneNumber || user?.phonenumber),
//         provider: values?.mobilePartner,
//       },
//       isWallet: paymentMethod === "wallet",
//     };

//     if (user?.id && paymentMethod === "wallet") {
//       const walletBalance = queryClient.getQueryData(
//         ["wallet-balance", user?.id],
//         { exact: true },
//       );

//       if (
//         Number(walletBalance) === 0 ||
//         Number(walletBalance) < Number(payload.totalAmount)
//       ) {
//         customDispatch(
//           globalAlertType(
//             "error",
//             "Insufficient Wallet Balance. Please request a top up.",
//           ),
//         );
//         return;
//       }
//       payloadData.token = token;
//     }

//     Swal.fire({
//       title: "Processing",
//       text: `Proceed with payment?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         if (!user?.id) {
//           mutateAsync(
//             {},
//             {
//               onSuccess: () => {
//                 paymentMutate.mutateAsync(payloadData, {
//                   onSuccess: (data) => {
//                     paymentMutate.reset();
//                     // return
//                     if (data && data?.transactionId) {
//                       navigate(`/confirm`, {
//                         replace: true,
//                         state: {
//                           id: data?.transactionId,
//                           categoryType: "voucher",
//                           path: pathname,
//                           isWallet: payloadData?.isWallet,
//                         },
//                       });
//                     }
//                   },
//                   onError: (error) => {
//                     customDispatch(globalAlertType("error", error));
//                   },
//                 });
//               },
//             },
//           );
//         } else {
//           paymentMutate.mutateAsync(payloadData, {
//             onSuccess: (data) => {
//               paymentMutate.reset();
//               if (data && data?.transactionId) {
//                 navigate(`/confirm`, {
//                   replace: true,
//                   state: {
//                     id: data?.transactionId,
//                     categoryType: "voucher",
//                     path: pathname,
//                     isWallet: payloadData?.isWallet,
//                   },
//                 });
//               }
//             },
//             onError: async (error) => {
//               if (error === "Invalid PIN!") {
//                 setFailCount((prevState) => prevState - 1);
//                 if (failureCount === 0) {
//                   const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
//                   setErr(message);
//                   queryClient.setQueryData(["wallet-status"], (oldData) => ({
//                     ...oldData,
//                     active: false,
//                     timeOut: dataDisableWallet?.timeOut,
//                   }));
//                 } else {
//                   setErr(`${error} ${failureCount - 1} attempt(s) left.`);
//                 }
//               } else {
//                 // setErr(`${error} ${failureCount - 1} attempt(s) left.`);
//                 customDispatch(globalAlertType("error", error));
//               }
//             },
//           });
//         }
//       }
//     });
//   };

//   const handleClose = () => {
//     Swal.fire({
//       title: "Processing",
//       text: `Do you want to cancel transaction?`,
//       showCancelButton: true,
//       confirmButtonColor: theme.palette.error.main,
//       cancelButtonColor: theme.palette.grey[500],
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         paymentMutate.reset();
//         handleGoBack();
//       }
//     });
//   };

//   const handleGoBack = () => {
//     customDispatch({
//       type: "getVoucherPaymentDetails",
//       payload: { data: {} },
//     });
//     navigate(`/evoucher?_pid=1`, { replace: true });
//   };

//   if (!payload?.category) {
//     return <Navigate to="/evoucher?_pid=1" />;
//   }

//   return (
//     <Box sx={{ minHeight: "100vh", py: 4, bgcolor: theme.palette.grey[50] }}>
//       <Container maxWidth="sm">
//         {payload?.isWallet && isLoadingWalletStatus ? (
//           <Stack justifyContent="center" alignItems="center" height={200}>
//             <CircularProgress />
//           </Stack>
//         ) : (
//           <>
//             {payload.isWallet && (failureCount <= 0 || !data?.active) ? (
//               <Fade in timeout={800}>
//                 <Paper
//                   elevation={3}
//                   sx={{
//                     p: 4,
//                     borderRadius: 4,
//                     textAlign: "center",
//                     boxShadow: theme.shadows[8],
//                   }}
//                 >
//                   <Typography variant="h6" fontWeight={600} gutterBottom>
//                     Wallet Account Disabled
//                   </Typography>
//                   <Typography variant="body2" color="text.secondary" paragraph>
//                     Please contact us for further assistance.
//                   </Typography>
//                   {data?.timeOut && (
//                     <>
//                       <Typography variant="body2" color="text.secondary">
//                         OR
//                       </Typography>
//                       <Typography
//                         variant="body2"
//                         color="error.main"
//                         sx={{ mt: 1 }}
//                       >
//                         Try again in {data?.timeOut}
//                       </Typography>
//                     </>
//                   )}
//                   <Button
//                     onClick={handleGoBack}
//                     variant="outlined"
//                     sx={{ mt: 2, borderRadius: 2 }}
//                   >
//                     Go Back
//                   </Button>
//                 </Paper>
//               </Fade>
//             ) : (
//               <Fade in timeout={800}>
//                 <Paper
//                   elevation={3}
//                   sx={{
//                     borderRadius: 4,
//                     overflow: "hidden",
//                     bgcolor: theme.palette.background.paper,
//                     boxShadow: theme.shadows[8],
//                   }}
//                 >
//                   {/* Custom Header */}
//                   <Stack
//                     direction="row"
//                     alignItems="center"
//                     justifyContent="space-between"
//                     sx={{
//                       bgcolor: "primary.main",
//                       color: "primary.contrastText",
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       p: { xs: 3, sm: 4 },
//                     }}
//                   >
//                     <Stack>
//                       <Stack direction="row" spacing={1} alignItems="center">
//                         <ReceiptIcon />
//                         <Typography
//                           variant="h6"
//                           component="span"
//                           fontWeight={600}
//                         >
//                           Confirm Checkout
//                         </Typography>
//                       </Stack>
//                       <Typography variant="caption" color="secondary.main">
//                         Overview of Payment Information
//                       </Typography>
//                     </Stack>
//                     <IconButton
//                       onClick={
//                         !paymentMutate.isLoading ? handleClose : undefined
//                       }
//                       disabled={paymentMutate.isLoading}
//                       sx={{
//                         transition: theme.transitions.create([
//                           "background-color",
//                           "transform",
//                         ]),
//                         "&:hover": {
//                           bgcolor: alpha(theme.palette.grey[500], 0.1),
//                           transform: "scale(1.1)",
//                         },
//                         color: "#fff",
//                       }}
//                     >
//                       <CloseIcon />
//                     </IconButton>
//                   </Stack>
//                   <Box
//                     sx={{
//                       p: { xs: 3, sm: 4 },
//                     }}
//                   >
//                     <Paper
//                       elevation={0}
//                       sx={{
//                         p: 2,
//                         bgcolor: "background.paper",
//                         borderRadius: 2,
//                         border: "1px solid",
//                         borderColor: "divider",
//                       }}
//                     >
//                       <Stack sx={{ mb: 3 }}>
//                         <Typography
//                           color="primary"
//                           textAlign="center"
//                           fontWeight={600}
//                           textTransform="uppercase"
//                         >
//                           {payload?.voucherName} VOUCHER
//                         </Typography>

//                         <VoucherPlaceHolderItem
//                           title="Price"
//                           value={currencyFormatter(payload?.price)}
//                         />
//                         <VoucherPlaceHolderItem
//                           title="Quantity"
//                           value={payload?.quantity}
//                         />
//                         <VoucherPlaceHolderItem
//                           title="Payment Method"
//                           value={payload?.isWallet ? "Wallet" : "Mobile Money"}
//                         />
//                         <VoucherPlaceHolderItem
//                           title="Amount"
//                           value={currencyFormatter(payload?.totalAmount)}
//                         />
//                         <VoucherPlaceHolderItem
//                           title="Name"
//                           value={payload?.user?.name || "N/A"}
//                         />
//                         <VoucherPlaceHolderItem
//                           title="Email"
//                           value={payload?.email}
//                         />
//                         <Divider sx={{ my: 2 }} />
//                         {/* Additional info / disclaimer */}
//                         <Typography
//                           variant="caption"
//                           color="text.secondary"
//                           textAlign="center"
//                         >
//                           By confirming, you agree to our terms and conditions.
//                           No refunds within 2 hours of departure.
//                         </Typography>
//                       </Stack>
//                     </Paper>
//                     <Formik
//                       initialValues={initialValues}
//                       validationSchema={paymentOptionSchema(
//                         paymentMethod,
//                         user?.id,
//                       )}
//                       enableReinitialize
//                       onSubmit={onSubmit}
//                     >
//                       {({ errors, touched, handleSubmit }) => (
//                         <>
//                           <PaymentOption
//                             showWallet={user?.id}
//                             showMomo
//                             setPaymentMethod={setPaymentMethod}
//                             error={Boolean(
//                               touched.paymentMethod && errors.paymentMethod,
//                             )}
//                             value={paymentMethod}
//                             helperText={errors.paymentMethod || err}
//                             mobileMoneyDetails={{
//                               mobilePartner,
//                               setMobilePartner,
//                               mobilePartnerErr: Boolean(
//                                 touched.mobilePartner && errors.mobilePartner,
//                               ),
//                               mobilePartnerHelperText: errors.mobilePartner,
//                               phonenumber: phoneNumber,
//                               setPhonenumber: setPhoneNumber,
//                               phonenumberErr: Boolean(
//                                 touched.phoneNumber && errors.phoneNumber,
//                               ),
//                               phonenumberHelperText: errors.phoneNumber,
//                               confirmPhonenumber,
//                               setConfirmPhonenumber,
//                               confirmPhonenumberErr: Boolean(
//                                 touched.phoneNumber &&
//                                 errors.confirmPhonenumber,
//                               ),
//                               confirmPhonenumberHelperText:
//                                 errors.confirmPhonenumber,
//                             }}
//                             walletDetails={{
//                               token,
//                               setToken,
//                               tokenErr:
//                                 Boolean(touched.token && errors.token) || err,
//                               tokenHelperText: errors.token || err,
//                             }}
//                           />

//                           <LoadingButton
//                             variant="contained"
//                             onClick={handleSubmit}
//                             fullWidth
//                             loading={isLoading || paymentMutate.isLoading}
//                             sx={{
//                               py: 1.2,
//                               borderRadius: 2,
//                               boxShadow: "none",
//                               transition: theme.transitions.create([
//                                 "background-color",
//                                 "box-shadow",
//                                 "transform",
//                               ]),
//                               "&:hover": {
//                                 boxShadow: theme.shadows[4],
//                                 transform: "scale(1.02)",
//                               },
//                             }}
//                           >
//                             {isLoading || paymentMutate.isLoading
//                               ? "Please Wait..."
//                               : "Pay"}
//                           </LoadingButton>
//                         </>
//                       )}
//                     </Formik>
//                   </Box>
//                 </Paper>
//               </Fade>
//             )}
//           </>
//         )}
//       </Container>
//     </Box>
//   );
// }

// export default VoucherPayment;
