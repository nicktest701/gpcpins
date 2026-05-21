import { useContext, useEffect, useMemo, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Typography,
  Stack,
  Avatar,
  InputAdornment,
  Box,
  Alert,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useLocation } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  airtimeValidationSchema,
  bundleValidationSchema,
} from "../../config/validationSchema";
import { CustomContext } from "../../context/providers/CustomProvider";
import { AuthContext } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { getCode } from "../../constants";
import Back from "../../components/Back";
import PaymentOption from "../../components/PaymentOption";
import BundleList from "./BundleList";
import { disableWallet, getNonUser } from "../../api/userAPI";
import { makeAirtimeTransaction } from "../../api/paymentAPI";

function AirtimeBuy() {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBundle, setSelectedBundle] = useState({
    plan_id: searchParams.get("plan_id"),
    plan_name: searchParams.get("plan_name"),
    volume: searchParams.get("plan_volume"),
    price: searchParams.get("plan_price"),
  });
  const [failureCount, setFailCount] = useState(3);

  const recipient = searchParams.get("recipient");
  const type = searchParams.get("type");

  // Get wallet status (disabled state)
  const { data: disableWalletData } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: () => disableWallet(),
    enabled: failureCount === 0,
    initialData: { active: true, timeOut: null },
  });

  // Service provider info from recipient number
  const serviceProviderInfo = useMemo(() => getCode(recipient), [recipient]);

  // Validation schema based on type
  const validationSchema = useMemo(
    () =>
      type === "Bundle"
        ? bundleValidationSchema(selectedBundle)
        : airtimeValidationSchema(),
    [type, selectedBundle],
  );

  // React Hook Form setup
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      amount: type === "Bundle" ? selectedBundle.price : 1,
      paymentMethod: "wallet",
      phonenumber: user?.phonenumber || "",
      mobilePartner: "",
      token: "",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const token = watch("token");
  const amount = watch("amount");
  const mobilePartner = watch("mobilePartner");
  const phonenumber = watch("phonenumber");

  // Check if bundle is selected (only for bundle type)
  const isBundleSelected =
    type !== "Bundle" || (selectedBundle && selectedBundle.plan_id);

  // Update amount when selectedBundle changes (for bundles)
  useEffect(() => {
    if (type === "Bundle") {
      setValue("amount", selectedBundle.price);
    }
  }, [selectedBundle, type, setValue]);

  // Wallet balance check (derived)
  const walletBalance = user?.id
    ? queryClient.getQueryData(["wallet-balance", user?.id], { exact: true })
    : 0;
  const totalAmount = type === "Bundle" ? selectedBundle.price : Number(amount);
  const isInsufficientBalance =
    paymentMethod === "wallet" &&
    user?.id &&
    (Number(walletBalance) === 0 || Number(walletBalance) < totalAmount);

  // Wallet disabled error message
  const walletDisabledError = useMemo(() => {
    if (disableWalletData?.active === false) {
      return `Wallet disabled due to multiple failed attempts. Try again after ${disableWalletData?.timeOut}`;
    }
    return "";
  }, [disableWalletData]);

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: makeAirtimeTransaction,
    onSuccess: (data) => {
      navigate("/confirm", {
        replace: true,
        state: {
          _id: data?.id,
          categoryType: type === "Bundle" ? "bundle" : "airtime",
          path: pathname,
          isWallet: paymentMethod === "wallet",
        },
      });
    },
    onError: async (error) => {
      if (error === "Invalid PIN!") {
        const newCount = failureCount - 1;
        setFailCount(newCount);
        if (newCount === 0) {
          // Wallet is now disabled
          setValue("token", "");
          customDispatch(
            globalAlertType(
              "error",
              `Wallet disabled. Please use mobile money or contact support.`,
            ),
          );
        } else {
          setValue("token", "");
          customDispatch(
            globalAlertType(
              "error",
              `${error} ${newCount} attempt(s) left. Wallet will be disabled after ${
                newCount - 1
              } more attempt(s).`,
            ),
          );
          
        }
      } else {
        customDispatch(globalAlertType("error", error));
      }
    },
  });

  // Guest user check mutation
  const guestMutation = useMutation({
    mutationFn: getNonUser,
    onSuccess: () => {
      // After guest check, proceed with payment
      // handlePaymentSubmit();
    },
    onError: () => {
      customDispatch(
        globalAlertType("error", "Failed to verify user. Please try again."),
      );
    },
  });

  // Form submission handler
  const onSubmit = (values) => {
    // Validate wallet balance
    if (paymentMethod === "wallet" && isInsufficientBalance) {
      customDispatch(
        globalAlertType(
          "error",
          "Insufficient wallet balance. Please fund your wallet or use mobile money.",
        ),
      );
      return;
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with payment?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const payload = {
          type: type,
          service: type?.toLowerCase(),
          amount: totalAmount,
          recipient: recipient,
          phonenumber: user?.phonenumber || values.phonenumber,
          provider: serviceProviderInfo.providerName,
          email: user?.email,
          isWallet: paymentMethod === "wallet",
        };

        if (type === "Bundle") {
          payload.plan = {
            id: selectedBundle.plan_id,
            name: selectedBundle.plan_name,
            volume: selectedBundle.volume,
          };
        }

        if (paymentMethod === "wallet") {
          payload.token = token;
        }

  

        // If user not logged in, run guest check first
        if (!user?.id) {
          guestMutation.mutate({});
        } else {
          paymentMutation.mutate(payload);
        }      }
    });
  };



  // Redirect if required params missing
  if (!recipient || !["Airtime", "Bundle"].includes(type)) {
    return (
      <Navigate to="/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5" />
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Back />
      <Typography variant="h4" gutterBottom>
        Complete Top-Up
      </Typography>

      {/* Info notice for airtime */}
      {type === "Airtime" && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Minimum airtime: <strong>GHS 1</strong> | Maximum:{" "}
          <strong>GHS 100</strong>
        </Alert>
      )}

      {type === "Bundle" && !isBundleSelected && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a bundle from the list to continue.
        </Alert>
      )}

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        {/* Recipient summary */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            bgcolor: "primary.main",
            color: "white",
            p: 2,
            borderRadius: 1,
            mb: 3,
          }}
        >
          <Avatar
            variant="square"
            src={serviceProviderInfo?.image}
            sx={{ width: 60, height: 40, objectFit: "contain" }}
          />
          <Stack alignItems="flex-end">
            {type === "Bundle" && selectedBundle.plan_name && (
              <Typography variant="caption" sx={{ color: "#000" }}>
                {selectedBundle.plan_name} ({selectedBundle.volume})
              </Typography>
            )}
            <Typography variant="body2">{recipient}</Typography>
            <Typography variant="caption">Recipient Number</Typography>
          </Stack>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            {/* Amount field */}
            {type === "Bundle" ? (
              <TextField
                fullWidth
                variant="filled"
                label="Bundle Price"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">GH¢</InputAdornment>
                  ),
                  readOnly: true,
                  style: { fontWeight: "bold", fontSize: "1.8rem" },
                }}
                value={selectedBundle.price}
              />
            ) : (
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    type="number"
                    label="Top-Up Amount"
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">GH¢</InputAdornment>
                      ),
                      style: { fontWeight: "bold", fontSize: "1.8rem" },
                    }}
                  />
                )}
              />
            )}

            {/* Payment options */}
            <PaymentOption
              showWallet={user?.id}
              setPaymentMethod={(value) => setValue("paymentMethod", value)}
              value={paymentMethod}
              error={!!errors.paymentMethod}
              helperText={errors.paymentMethod?.message || walletDisabledError}
              mobileMoneyDetails={{
                mobilePartner,
                setMobilePartner: (val) => setValue("mobilePartner", val),
                mobilePartnerErr: !!errors.mobilePartner,
                mobilePartnerHelperText: errors.mobilePartner?.message,
                phonenumber,
                setPhonenumber: (val) => setValue("phonenumber", val),
                phonenumberErr: !!errors.phonenumber,
                phonenumberHelperText: errors.phonenumber?.message,
              }}
              walletDetails={{
                token,
                setToken: (val) => setValue("token", val),
                tokenErr: !!errors.token,
                tokenHelperText: errors.token?.message,
              }}
            />

            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={
                isSubmitting ||
                paymentMutation.isLoading ||
                guestMutation.isLoading
              }
              disabled={
                paymentMethod === "" ||
                (paymentMethod === "wallet" && isInsufficientBalance)
              }
              fullWidth
            >
              Confirm Details
            </LoadingButton>
          </Stack>
        </form>
      </Paper>

      {/* Bundle selection (only visible for Bundle type) */}
      {type === "Bundle" && (
        <BundleList
          selectedBundle={selectedBundle}
          setSelectedBundle={setSelectedBundle}
        />
      )}
    </Container>
  );
}

export default AirtimeBuy;

// import { useContext, useEffect, useMemo, useState } from "react";
// import {
//   Container,
//   Paper,
//   TextField,
//   Typography,
//   Stack,
//   Avatar,
//   InputAdornment,
//   Box,
//   Alert,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";
// import { Formik } from "formik";
// import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import { useLocation } from "react-router-dom";
// import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
// import {
//   airtimeValidationSchema,
//   bundleValidationSchema,
// } from "../../config/validationSchema";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import { AuthContext } from "../../context/providers/AuthProvider";
// import { globalAlertType } from "../../components/alert/alertType";
// import { getCode } from "../../constants";
// import Back from "../../components/Back";
// import PaymentOption from "../../components/PaymentOption";
// import BundleList from "./BundleList";

// import { disableWallet, getNonUser } from "../../api/userAPI";
// import { makeAirtimeTransaction } from "../../api/paymentAPI";

// function AirtimeBuy() {
//   const queryClient = useQueryClient();
//   const { customDispatch } = useContext(CustomContext);
//   const { pathname } = useLocation();
//   const { user } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [selectedBundle, setSelectedBundle] = useState({
//     price: 0,
//     plan_id: "",
//     plan_name: "",
//     volume: "",
//   });

//   const [mobilePartner, setMobilePartner] = useState("");
//   const [token, setToken] = useState("");
//   const [err, setErr] = useState("");
//   const [phonenumber, setPhonenumber] = useState(user?.phonenumber);
//   const [paymentMethod, setPaymentMethod] = useState("wallet");
//   const [failureCount, setFailCount] = useState(3);
//   // const [openNotAvailable, setOpenNotAvailable] = useState

//   const recipient = searchParams.get("recipient");
//   const type = searchParams.get("type");

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

//   // Service provider info from recipient number
//   const serviceProviderInfo = useMemo(() => getCode(recipient), [recipient]);
//   // const network = useMemo(() => getCode(phonenumber), [phonenumber]);

//   // Initial form values
//   const initialValues = {
//     amount: selectedBundle.price,
//     paymentMethod,
//     phonenumber: phonenumber,
//     mobilePartner: mobilePartner,
//     token,
//   };

//   const handleSubmit = (values, { setSubmitting }) => {
//     const { amount, paymentMethod } = values;

//     const payload = {
//       type: type,
//       service: type?.toLowerCase(),
//       amount: amount,
//       recipient: recipient,
//       phonenumber: user?.phonenumber,
//       provider: serviceProviderInfo.providerName,
//       email: user?.email,
//       isWallet: paymentMethod === "wallet",
//     };

//     if (type === "Bundle") {
//       payload.plan = {
//         id: selectedBundle.plan_id,
//         name: selectedBundle.plan_name,
//         volume: selectedBundle.volume,
//       };
//     }

//     // Validate wallet balance if payment method is wallet
//     const totalAmount =
//       type === "Bundle" ? selectedBundle.price : Number(amount);
//     if (user?.id && paymentMethod === "wallet") {
//       const walletBalance = queryClient.getQueryData(
//         ["wallet-balance", user?.id],
//         { exact: true },
//       );

//       if (
//         Number(walletBalance) === 0 ||
//         Number(walletBalance) < Number(totalAmount)
//       ) {
//         customDispatch(
//           globalAlertType(
//             "error",
//             "Insufficient Wallet Balance. Please request a top up.",
//           ),
//         );
//         return;
//       }
//       payload.token = token;
//     }

//     console.log(payload);
//     handlePayment(payload);
//     setSubmitting(false);
//   };

//   // Payment mutation
//   const paymentMutation = useMutation({
//     mutationFn: makeAirtimeTransaction,
//     onSuccess: (data) => {
//       navigate("/confirm", {
//         replace: true,
//         state: {
//           _id: data?.id,
//           categoryType:
//             searchParams.get("type") === "Bundle" ? "bundle" : "airtime",
//           path: pathname,
//           isWallet: paymentMethod === "wallet",
//         },
//       });
//     },
//     onError: async (error) => {
//       if (error === "Invalid PIN!") {
//         setFailCount((prevState) => prevState - 1);
//         if (failureCount === 0) {
//           const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
//           setErr(message);
//           queryClient.setQueryData(["wallet-status"], (oldData) => ({
//             ...oldData,
//             active: false,
//             timeOut: dataDisableWallet?.timeOut,
//           }));
//         } else {
//           setErr(`${error} ${failureCount - 1} attempt(s) left.`);
//         }
//       } else {
//         // setErr(`${error} ${failureCount - 1} attempt(s) left.`);
//         customDispatch(globalAlertType("error", error));
//       }
//     },
//   });

//   // Guest user check mutation (for non‑logged‑in users)
//   const guestMutation = useMutation({
//     mutationFn: getNonUser,
//     onSuccess: () => {
//       // After guest check, proceed with payment
//       handlePayment();
//     },
//     onError: () => {
//       customDispatch(
//         globalAlertType("error", "Failed to verify user. Please try again."),
//       );
//     },
//   });

//   const handlePayment = (payload) => {
//     Swal.fire({
//       title: "Processing",
//       text: `Proceed with payment?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         // If user not logged in, run guest check first
//         if (!user?.id) {
//           guestMutation.mutate({});
//         } else {
//           paymentMutation.mutate(payload);
//         }
//       }
//     });
//   };

//   const handleClose = () => {
//     Swal.fire({
//       title: "Cancel transaction?",
//       text: "Are you sure you want to cancel?",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonText: "Yes, cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
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

//         <Formik
//           initialValues={initialValues}
//           validationSchema={
//             type === "Bundle" ? bundleValidationSchema : airtimeValidationSchema
//           }
//           onSubmit={handleSubmit}
//           enableReinitialize
//         >
//           {({
//             values,
//             errors,
//             touched,
//             handleChange,
//             handleBlur,
//             handleSubmit,
//             isSubmitting,
//           }) => (
//             <Box component="form" onSubmit={handleSubmit} noValidate>
//               <Stack spacing={3}>
//                 {/* Amount field */}
//                 {type === "Bundle" ? (
//                   <TextField
//                     fullWidth
//                     variant="filled"
//                     label="Bundle Price"
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">GH¢</InputAdornment>
//                       ),
//                       readOnly: true,
//                       style: { fontWeight: "bold", fontSize: "1.8rem" },
//                     }}
//                     value={selectedBundle.price}
//                   />
//                 ) : (
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Top-Up Amount"
//                     name="amount"
//                     value={values.amount}
//                     onChange={handleChange}
//                     onBlur={handleBlur}
//                     error={touched.amount && Boolean(errors.amount)}
//                     helperText={touched.amount && errors.amount}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">GH¢</InputAdornment>
//                       ),
//                       style: { fontWeight: "bold", fontSize: "1.8rem" },
//                     }}
//                   />
//                 )}

//                 {/* Payment options */}
//                 <PaymentOption
//                   showWallet={user?.id}
//                   setPaymentMethod={setPaymentMethod}
//                   error={Boolean(touched.paymentMethod && errors.paymentMethod)}
//                   value={paymentMethod}
//                   helperText={errors.paymentMethod || err}
//                   mobileMoneyDetails={{
//                     mobilePartner,
//                     setMobilePartner,
//                     mobilePartnerErr: Boolean(
//                       touched.mobilePartner && errors.mobilePartner,
//                     ),
//                     mobilePartnerHelperText: errors.mobilePartner,
//                     phonenumber,
//                     setPhonenumber,
//                     phonenumberErr: Boolean(
//                       touched.phonenumber && errors.phonenumber,
//                     ),
//                     phonenumberHelperText: errors.phonenumber,
//                   }}
//                   walletDetails={{
//                     token,
//                     setToken,
//                     tokenErr:
//                       Boolean(touched.token && errors.token) || Boolean(err),
//                     tokenHelperText: errors.token || err,
//                   }}
//                 />

//                 <LoadingButton
//                   type="submit"
//                   variant="contained"
//                   size="large"
//                   loading={isSubmitting}
//                   disabled={values.paymentMethod === ""}
//                   fullWidth
//                 >
//                   Confirm Details
//                 </LoadingButton>
//               </Stack>
//             </Box>
//           )}
//         </Formik>
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
