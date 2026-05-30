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
  useTheme,
} from "@mui/material";

import LoadingButton from "@mui/lab/LoadingButton";

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

import { getNonUser } from "../../api/userAPI";

import { currencyFormatter, getCode } from "../../constants";

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
  const theme = useTheme();

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const { pathname } = useLocation();

  const { user } = useAuth();

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

  /**
   * FORM
   */

  const {
    register,
    watch,
    setValue,
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

  const walletBalance = user?.id
    ? queryClient.getQueryData(["wallet-balance", user?.id]) || 0
    : 0;

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
          id: data?.id,
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
   * GUEST USER MUTATION
   */

  const guestMutation = useMutation({
    mutationFn: getNonUser,
    retry: false,
    onError: () => {
      customDispatch(globalAlertType("error", "Unable to verify guest user."));
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
        return;
      }
    }

    /**
     * VALIDATE WALLET
     */

    const insufficientBalance =
      values.paymentMethod === "wallet" &&
      user?.id &&
      Number(walletBalance) < Number(totalAmount);

    if (insufficientBalance) {
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

    try {
      /**
       * VERIFY GUEST
       */

      if (!user?.id) {
        await guestMutation.mutateAsync(
          {},
          {
            onSuccess: async () => {
              await paymentMutation.mutateAsync(payload);
            },
          },
        );
      }

      /**
       * MAKE PAYMENT
       */

      await paymentMutation.mutateAsync(payload);
    } catch (error) {
      console.log(error);
    }
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

              borderRadius: 4,

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

                  borderRadius: 3,

                  bgcolor: "primary.main",

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
                        {serviceProviderInfo?.provider}
                      </Typography>

                      <Typography variant="body2">{recipient}</Typography>
                    </Stack>
                  </Stack>

                  <PhoneAndroidIcon />
                </Stack>

                {type === "Bundle" && selectedBundle?.plan_name && (
                  <Box mt={2}>
                    <Typography variant="caption">
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
                    label="Bundle Price"
                    value={currencyFormatter(totalAmount)}
                    InputProps={{
                      readOnly: true,

                      startAdornment: (
                        <InputAdornment position="start">GH¢</InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <TextField
                    fullWidth
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
        maxWidth="sm"
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

            bgcolor: "primary.main",

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
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Service</Typography>

                <Typography fontWeight={600}>{type}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Recipient</Typography>

                <Typography fontWeight={600}>{recipient}</Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Network</Typography>

                <Typography fontWeight={600}>
                  {serviceProviderInfo?.providerName}
                </Typography>
              </Stack>

              {type === "Bundle" && (
                <>
                  <Divider />

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Bundle</Typography>

                    <Typography fontWeight={600}>
                      {selectedBundle.plan_name}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Volume</Typography>

                    <Typography fontWeight={600}>
                      {selectedBundle.volume}
                    </Typography>
                  </Stack>
                </>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Payment Method</Typography>

                <Typography fontWeight={600}>
                  {paymentData?.paymentMethod === "wallet"
                    ? "Wallet"
                    : "Mobile Money"}
                </Typography>
              </Stack>

              {paymentData?.paymentMethod !== "wallet" && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography color="text.secondary">Payment Number</Typography>

                  <Typography fontWeight={600}>
                    {paymentData?.phonenumber}
                  </Typography>
                </Stack>
              )}

              <Divider />

              <Stack direction="row" justifyContent="space-between">
                <Typography variant="h6" fontWeight={700}>
                  Total Amount
                </Typography>

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
            loading={paymentMutation.isLoading || guestMutation.isLoading}
          >
            Confirm Payment
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default AirtimeBuy;

// import { useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Paper,
//   TextField,
//   Typography,
//   Stack,
//   Avatar,
//   InputAdornment,
//   Alert,
// } from "@mui/material";
// import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import { useLocation } from "react-router-dom";
// import { useQueryClient, useMutation } from "@tanstack/react-query";
// // import {
// //   airtimeValidationSchema,
// //   bundleValidationSchema,
// // } from "../../config/validationSchema";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { useAuth } from "../../context/providers/AuthProvider";
// import { globalAlertType } from "../../components/alert/alertType";
// import { getCode } from "../../constants";
// import Back from "../../components/Back";
// import PaymentOption from "../../components/PaymentOption";
// import BundleList from "./BundleList";
// import { getNonUser } from "../../api/userAPI";
// import { makeAirtimeTransaction } from "../../api/paymentAPI";

// function AirtimeBuy() {
//   const queryClient = useQueryClient();
//   const { customDispatch } = useCustomContext();
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [searchParams, _] = useSearchParams();
//   const type = searchParams.get("type");
//   const [selectedBundle, setSelectedBundle] = useState({
//     plan_id: searchParams.get("plan_id"),
//     plan_name: searchParams.get("plan_name"),
//     volume: searchParams.get("plan_volume"),
//     price: searchParams.get("plan_price"),
//   });
//   const [amount, setAmount] = useState(
//     type === "Bundle" ? searchParams.get("plan_price") : 1,
//   );
//   const [failureCount, setFailCount] = useState(3);

//   const recipient = searchParams.get("recipient");

//   // Service provider info from recipient number
//   const serviceProviderInfo = useMemo(() => getCode(recipient), [recipient]);

//   // Check if bundle is selected (only for bundle type)
//   const isBundleSelected =
//     type !== "Bundle" || (selectedBundle && selectedBundle.plan_id);

//   // Update amount when selectedBundle changes (for bundles)
//   useEffect(() => {
//     if (type === "Bundle") {
//       setAmount("amount", selectedBundle.price);
//     }
//   }, [selectedBundle, type]);

//   // Wallet balance check (derived)
//   const walletBalance = user?.id
//     ? queryClient.getQueryData(["wallet-balance", user?.id], { exact: true })
//     : 0;
//   const totalAmount = type === "Bundle" ? selectedBundle.price : Number(amount);

//   // Payment mutation
//   const paymentMutation = useMutation({
//     mutationFn: makeAirtimeTransaction,
//     onSuccess: (data) => {
//       navigate("/confirm", {
//         replace: true,
//         state: {
//           id: data?.id,
//           categoryType: type === "Bundle" ? "bundle" : "airtime",
//           path: pathname,
//           // isWallet: paymentMethod === "wallet",
//         },
//       });
//     },
//     onError: async (error) => {
//       if (error === "Invalid PIN!") {
//         const newCount = failureCount - 1;
//         setFailCount(newCount);
//         if (newCount === 0) {
//           // Wallet is now disabled

//           customDispatch(
//             globalAlertType(
//               "error",
//               `Wallet disabled. Please use mobile money or contact support.`,
//             ),
//           );
//         } else {
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
//       // handlePaymentSubmit();
//     },
//     onError: () => {
//       customDispatch(
//         globalAlertType("error", "Failed to verify user. Please try again."),
//       );
//     },
//   });

//   // Form submission handler
//   const onSubmit = async (values) => {
//     const isInsufficientBalance =
//       values.paymentMethod === "wallet" &&
//       user?.id &&
//       (Number(walletBalance) === 0 || Number(walletBalance) < totalAmount);
//     // Validate wallet balance
//     if (values.paymentMethod === "wallet" && isInsufficientBalance) {
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
//           type: type,
//           service: type?.toLowerCase(),
//           amount: totalAmount,
//           recipient: recipient,
//           phonenumber: values.phonenumber || user?.phonenumber,
//           provider: serviceProviderInfo.providerName,
//           email: values.email || user?.email,
//           isWallet: values?.paymentMethod === "wallet",
//         };

//         if (type === "Bundle") {
//           payload.plan = {
//             id: selectedBundle.plan_id,
//             name: selectedBundle.plan_name,
//             volume: selectedBundle.volume,
//           };
//         }

//         if (values.paymentMethod === "wallet") {
//           payload.token = values.token;
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

//   // Redirect if required params missing
//   if (!recipient || !["Airtime", "Bundle"].includes(type)) {
//     return (
//       <Navigate to="/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5" />
//     );
//   }

//   return (
//     <Container maxWidth="sm" sx={{ py: 4 }}>
//       <Back />
//       <Typography variant="h4" gutterBottom>
//         Complete Top-Up
//       </Typography>

//       {/* Info notice for airtime */}
//       {type === "Airtime" && (
//         <Alert severity="info" sx={{ mb: 3 }}>
//           Minimum airtime: <strong>GHS 1</strong> | Maximum:{" "}
//           <strong>GHS 100</strong>
//         </Alert>
//       )}

//       {type === "Bundle" && !isBundleSelected && (
//         <Alert severity="warning" sx={{ mb: 2 }}>
//           Please select a bundle from the list to continue.
//         </Alert>
//       )}

//       <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
//         {/* Recipient summary */}
//         <Stack
//           direction="row"
//           justifyContent="space-between"
//           alignItems="center"
//           sx={{
//             bgcolor: "primary.main",
//             color: "white",
//             p: 2,
//             borderRadius: 1,
//             mb: 3,
//           }}
//         >
//           <Avatar
//             variant="square"
//             src={serviceProviderInfo?.image}
//             sx={{ width: 60, height: 40, objectFit: "contain" }}
//           />
//           <Stack alignItems="flex-end">
//             {type === "Bundle" && selectedBundle.plan_name && (
//               <Typography variant="caption" sx={{ color: "#000" }}>
//                 {selectedBundle.plan_name} ({selectedBundle.volume})
//               </Typography>
//             )}
//             <Typography variant="body2">{recipient}</Typography>
//             <Typography variant="caption">Recipient Number</Typography>
//           </Stack>
//         </Stack>

//         <Stack spacing={3}>
//           {/* Amount field */}
//           {type === "Bundle" ? (
//             <TextField
//               fullWidth
//               variant="filled"
//               label="Bundle Price"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">GH¢</InputAdornment>
//                 ),
//                 readOnly: true,
//                 style: { fontWeight: "bold", fontSize: "1.8rem" },
//               }}
//               value={selectedBundle.price}
//             />
//           ) : (
//             <TextField
//               fullWidth
//               type="number"
//               label="Top-Up Amount"
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">GH¢</InputAdornment>
//                 ),
//                 style: { fontWeight: "bold", fontSize: "1.8rem" },
//               }}
//             />
//           )}

//           {/* Payment */}

//           <PaymentOption
//             showMomo
//             showWallet={!!user?.id}
//             initialValues={{
//               fullName: user?.name || "",
//               email: user?.email || "",
//             }}
//             onSubmit={onSubmit}
//           />

//           {/* <LoadingButton
//               type="submit"
//               variant="contained"
//               size="large"
//               loading={
//                 isSubmitting ||
//                 paymentMutation.isLoading ||
//                 guestMutation.isLoading
//               }
//               disabled={
//                 paymentMethod === "" ||
//                 (paymentMethod === "wallet" && isInsufficientBalance)
//               }
//               fullWidth
//             >
//               Confirm Details
//             </LoadingButton> */}
//         </Stack>
//       </Paper>

//       {/* Bundle selection (only visible for Bundle type) */}
//       {type === "Bundle" && (
//         <BundleList
//           selectedBundle={selectedBundle}
//           setSelectedBundle={setSelectedBundle}
//         />
//       )}
//     </Container>
//   );
// }

// export default AirtimeBuy;
