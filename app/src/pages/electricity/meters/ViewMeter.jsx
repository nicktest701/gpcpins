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
import { Delete, CreditCard, AccountBalanceWallet, Close } from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import { LoadingButton } from "@mui/lab";
import { prepaidPaymentValidationSchema } from "@/config/validationSchema";
import { CustomContext } from "@/context/providers/CustomProvider";
import { AuthContext } from "@/context/providers/AuthProvider";
import { globalAlertType } from "@/components/alert/alertType";
import { disableWallet } from "@/api/userAPI";
import { makeElectricityPayment } from "@/api/paymentAPI";
import { deleteMeter, getMeterById } from "@/api/meterAPI";
import { currencyFormatter, getCode } from "@/constants";
import PaymentOption from "@/components/PaymentOption";
import { isBetween50And99 } from "@/config/validation";
import { prepaidValidationSchema } from "../../../config/validationSchema";

const ViewMeter = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();

  // Modal state
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [failureCount, setFailCount] = useState(3);

  // Fetch meter data
  const {
    data: meter,
    isLoading,
    isError,
    refetch,
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
              `Wallet disabled due to multiple failed attempts. Try again after ${walletStatus?.timeOut}`
            )
          );
        } else {
          customDispatch(
            globalAlertType(
              "error",
              `Invalid PIN! ${newCount} attempt(s) left.`
            )
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
    if (!amt || amt <= 0)
      return { topup: 0, charges: 0, total: 0 };
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
    (Number(walletBalance) === 0 || Number(walletBalance) < calculatedAmounts.total);

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
          "Insufficient wallet balance. Please top up your wallet."
        )
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
        <Button variant="contained" onClick={() => navigate("/electricity/meters")} sx={{ mt: 2 }}>
          Back to Meters
        </Button>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
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
              <Chip label={`${meter.type} (IMES)`} size="small" color="primary" />
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
                {meter.createdAt ? new Date(meter.createdAt).toLocaleDateString() : "—"}
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
      <Dialog open={buyModalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
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

            <form id="prepaid-payment-form" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                        startAdornment: <InputAdornment position="start">GH¢</InputAdornment>,
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
                        <Typography variant="body2" fontWeight="bold" color="error">
                          {currencyFormatter(calculatedAmounts.charges)}
                        </Typography>
                      </Stack>
                      <Divider />
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight="bold">
                          Total:
                        </Typography>
                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
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
                    setConfirmPhonenumber: (val) => setValue("confirmPhonenumber", val),
                    confirmPhonenumberErr: !!errors.confirmPhonenumber,
                    confirmPhonenumberHelperText: errors.confirmPhonenumber?.message,
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
            loading={paymentMutation.isLoading || isSubmitting}
            disabled={!amount || calculatedAmounts.total === 0 || isInsufficientBalance}
          >
            Pay {calculatedAmounts.total > 0 && currencyFormatter(calculatedAmounts.total)}
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewMeter;


// import {
//   Box,
//   Button,
//   Container,
//   DialogActions,
//   DialogContent,
//   Divider,
//   InputAdornment,
//   Stack,
//   TextField,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import { useContext, useState } from "react";
// import { Formik } from "formik";
// import { CustomContext } from "@/context/providers/CustomProvider";
// import CheckOutItem from "@/components/items/CheckOutItem";

// import { LoadingButton } from "@mui/lab";
// import Swal from "sweetalert2";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { deleteMeter } from "@/api/meterAPI";
// import { prepaidPaymentValidationSchema } from "@/config/validationSchema";
// import AnimatedContainer from "@/components/animations/AnimatedContainer";
// import { globalAlertType } from "@/components/alert/alertType";
// // import { AuthContext } from "@/context/providers/AuthProvider";
// import DOMPurify from "dompurify";
// import PaymentOption from "@/components/PaymentOption";
// // import ServiceNotAvaialble from "../../ServiceNotAvaialble";
// // import { serviceAvailable } from "@/config/serviceAvailable";
// import { isBetween50And99 } from "@/config/validation";
// import { AuthContext } from "@/context/providers/AuthProvider";
// import { disableWallet } from "@/api/userAPI";
// import { useEffect } from "react";
// import { makeElectricityPayment } from "@/api/paymentAPI";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { getMeterById } from "@/api/meterAPI";

// function ViewMeter() {
//   const queryClient = useQueryClient();
//   const { id } = useParams();
//   const { user } = useContext(AuthContext);
//   const theme = useTheme();
//   const {
//     customState: { viewMeter },
//     customDispatch,
//   } = useContext(CustomContext);
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const [showFields, setShowFields] = useState(false);
//   const [failureCount, setFailCount] = useState(3);
//   const [token, setToken] = useState("");
//   const [err, setErr] = useState("");
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
//   const [email, setEmail] = useState("");
//   const [amount, setAmount] = useState(0);
//   const [mobilePartner, setMobilePartner] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("momo");
//   // const [openNotAvailable, setOpenNotAvailable] = useState(false);

//   const { data: meter } = useQuery({
//     queryKey: ["meter", id],
//     queryFn: () => getMeterById(id),
//     enabled: !!id,
//     initialData: viewMeter,
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
//   const { mutate, isLoading } = useMutation({
//     mutationFn: makeElectricityPayment,
//     retry: false,
//   });

//   //initialState
//   const initialValues = {
//     amount,
//     phoneNumber,
//     confirmPhonenumber,
//     email: email,
//     id: meter?.id,
//     name: meter?.name,
//     number: meter?.number,
//     type: meter?.type,
//     mobilePartner,
//     paymentMethod,
//     token,
//   };

//   //close dialog
//   const handleClose = () =>
//     customDispatch({
//       type: "openViewMeter",
//       payload: {
//         open: false,
//         // details: {},
//       },
//     });

//   const onSubmit = (values) => {
//     values.email = DOMPurify.sanitize(values?.email);
//     values.mobileNo = DOMPurify.sanitize(values?.phoneNumber);
//     values.provider = values?.mobilePartner;
//     values.isWallet = paymentMethod === "wallet";

//     if (isBetween50And99(Number(amount))) {
//       //Calculate charges
//       values.topup = Number(amount);
//       const charges = 2;
//       values.charges = charges;
//       values.amount = charges + Number(amount);
//     } else {
//       //Calculate charges
//       values.topup = Number(amount);
//       const charges = 0.02 * Number(amount);
//       values.charges = charges;
//       values.amount = charges + Number(amount);
//     }

//     const meterInfo = {
//       user: user?.id,
//       meter: meter?.id,
//       info: {
//         amount: values.amount,
//         email: values?.email,
//         phonenumber: values?.phoneNumber || user?.phonenumber,
//         provider: values.provider,
//       },
//       amount: values.amount,
//       topup: values.topup,
//       charges: values.charges,
//       isWallet: paymentMethod === "wallet",
//     };

//     if (user?.id && paymentMethod === "wallet") {
//       const walletBalance = queryClient.getQueryData(
//         ["wallet-balance", user?.id],
//         { exact: true },
//       );

//       if (
//         Number(walletBalance) === 0 ||
//         Number(walletBalance) < Number(meterInfo.amount)
//       ) {
//         customDispatch(
//           globalAlertType(
//             "error",
//             "Insufficient Wallet Balance. Please request a top up.",
//           ),
//         );
//         return;
//       }
//       meterInfo.token = token;
//     }

//     Swal.fire({
//       title: "Processing",
//       text: `Proceed with payment?`,
//       html: `
//      <div style="display: flex; justify-content: center; align-items: center; height: 65svh; margin: 0; background: linear-gradient(135deg, #f0f4fa 0%, #e6ecf3 100%); font-family: 'Segoe UI', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; padding: 0.5rem;">
//   <div style="max-width: 520px; width: 100%; background: #ffffff; overflow: hidden; transition: all 0.2s ease;">
 

//     <!-- Content area -->
//     <div style="padding: 1.8rem 1.8rem 2rem;">
      
//       <!-- Meter details card -->
//       <div style="background: #f8fafd; border-radius: 20px; padding: 1rem 1.2rem; border: 1px solid #e9edf2; margin-bottom: 1rem;">
//         <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0; border-bottom: 1px dashed #e2e8f0;">
//           <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
//            Meter Name
//           </span>
//           <span style="font-weight: 600; color: #1e2a3e; font-size: 0.9rem; background: white; padding: 0.2rem 0.7rem; border-radius: 30px;">${meter?.name}</span>
//         </div>
//         <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0; border-bottom: 1px dashed #e2e8f0;">
//           <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
//           Meter No.
//           </span>
//           <span style="font-weight: 600; color: #1e2a3e; font-size: 0.9rem; background: white; padding: 0.2rem 0.7rem; border-radius: 30px; font-family: monospace;">${meter?.number}</span>
//         </div>
//         <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0;">
//           <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
//              Payment Method
//           </span>
//           <span style="background: #eef2ff; padding: 0.2rem 0.9rem; border-radius: 40px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; color: #1f4e6e;">
//             ${
//         meterInfo.isWallet ? "Wallet" : "Mobile Money"
//       }
//           </span>
//         </div>
//       </div>

//       <!-- Financial breakdown (top‑up, charges, total) -->
//       <div style="background: #ffffff; border-radius: 20px; border: 1px solid #edf2f7; margin-bottom: 1rem; overflow: hidden;">
//         <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; border-bottom: 1px solid #f0f4f9;">
//           <span style="display: flex; align-items: center; gap: 10px; font-weight: 500; color: #4a5b7a; font-size: 0.9rem;">
//             Top Up
//           </span>
//           <span style="font-weight: 600; color: #1f2a44;">GH¢${meterInfo.amount.toFixed(2)}</span>
//         </div>
//         <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; border-bottom: 1px solid #f0f4f9;">
//           <span style="display: flex; align-items: center; gap: 10px; font-weight: 500; color: #4a5b7a; font-size: 0.9rem;">
//          Charges
//           </span>
//           <span style="font-weight: 600; color: #1f2a44;">GH¢${meterInfo.charges.toFixed(2)}</span>
//         </div>
//       </div>

//       <!-- Total row (highlighted) -->
//       <div style="background: #fef9e6; border-radius: 18px; padding: 1rem .5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ffe6c2; margin-bottom: 1.8rem;">
//         <span style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; color: #b45309;">
//         Amount
//         </span>
//         <span style="font-weight: 800; font-size: 1.5rem; color: #c2410c; letter-spacing: -0.3px;">GH¢${meterInfo.amount.toFixed(2)}</span>
//         </div>
//         </div>
       
//         </div>
// </div>
//       `,
    


//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {

//         mutate(meterInfo, {
//           onSuccess: (data) => {
//             if (data) {
//               navigate(`/confirm`, {
//                 replace: true,
//                 state: {
//                   id: data?.id,
//                   categoryType: "prepaid",
//                   path: pathname,
//                   isWallet: meterInfo.isWallet,
//                 },
//               });
//             }
//           },
//           onError: async (error) => {
//             if (error === "Invalid PIN!") {
//               setFailCount((prevState) => prevState - 1);
//               if (failureCount === 0) {
//                 const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
//                 setErr(message);
//                 queryClient.setQueryData(["wallet-status"], (oldData) => ({
//                   ...oldData,
//                   active: false,
//                   timeOut: dataDisableWallet?.timeOut,
//                 }));
//               } else {
//                 setErr(`${error} ${failureCount - 1} attempt(s) left.`);
//               }
//             } else {
//               // setErr(`${error} ${failureCount - 1} attempt(s) left.`);
//               customDispatch(globalAlertType("error", error));
//             }
//           },
//         });

//       }
//     });

//     // handleClose();
//   };

//   const handleBuyCredit = () => {
//     setShowFields(!showFields);
//     // if (serviceAvailable()) {
//     //   setOpenNotAvailable(true);
//     // } else {
//     // }
//   };

//   //DELETE meter

//   const { mutateAsync: deleteMutateAsync } = useMutation({
//     mutationFn: deleteMeter,
//   });

//   const handleRemoveMeter = () => {
//     Swal.fire({
//       title: "Removing meter",
//       text: `Do you want to remove meter?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         customDispatch({
//           type: "setLoading",
//           payload: { open: true, message: "Removing Meter" },
//         });

//         deleteMutateAsync(viewMeter?.details?._id, {
//           onSettled: () => {
//             customDispatch({
//               type: "setLoading",
//               payload: { open: false, message: "Removing Meter" },
//             });
//             queryClient.invalidateQueries(["meter"]);
//           },
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("info", data));
//             handleClose();
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   // const updateMeterDetails

//   return (
//     <>
//       <Box sx={{ minHeight: "100vh", py: 4, bgcolor: theme.palette.grey[50] }}>
//         <Container maxWidth="sm">
//           <Typography>
//             {meter?.type} Meter - {meter?.number}
//           </Typography>
//           <Divider />
//           <DialogContent sx={{ p: 2 }}>
//             <Container
//               sx={{
//                 borderRadius: 1,
//                 display: "flex",
//                 flexDirection: "column",
//                 rowGap: 1,
//                 bgcolor: "#fff",
//                 color: "secondary.contrastText",
//                 marginY: 2,
//               }}
//             >
//               <Typography color="primary" paragraph>
//                 Meter Details
//               </Typography>

//               <CheckOutItem
//                 title="IMES Meter No."
//                 value={viewMeter?.details?.number}
//               />

//               <CheckOutItem title="Name" value={viewMeter?.details?.name} />
//               <CheckOutItem
//                 title="Type"
//                 value={`${viewMeter?.details?.type} (IMES)`}
//               />
//             </Container>

//  {/* Buy Prepaid  */}
//             {showFields && (
//               <AnimatedContainer delay={0.1}>
//                 <Container>
//                   <ul style={{ paddingBlock: "8px" }}>
//                     <li>
//                       <Typography variant="caption" color="error">
//                         NOTE: Please ensure you have sufficient balance in your
//                         account before proceeding with the transaction. Be
//                         informed that there is a
//                       </Typography>
//                     </li>
//                     <li>
//                       {" "}
//                       <Typography variant="caption">
//                         <b> fee of GHS 2.00 </b> for transaction from{" "}
//                         <b>GHS 50.00 - GHS 99.00</b> and
//                       </Typography>
//                     </li>
//                     <li>
//                       <Typography variant="caption" color="error">
//                         <b>2% fee</b> for transaction from{" "}
//                         <b>GHS 100 and above.</b>
//                       </Typography>
//                     </li>
//                   </ul>
//                 </Container>
//                 <Formik
//                   initialValues={initialValues}
//                   onSubmit={onSubmit}
//                   enableReinitialize={true}
//                   validationSchema={prepaidPaymentValidationSchema(
//                     paymentMethod === "momo",
//                   )}
//                 >
//                   {({
//                     isSubmitting,
//                     errors,
//                     touched,

//                     handleSubmit,
//                   }) => {
//                     return (
//                       <Stack rowGap={2} paddingY={2}>
//                         <TextField
//                           size="small"
//                           label="Enter Amount"
//                           placeholder="Enter Amount here"
//                           type="number"
//                           inputMode="decimal"
//                           fullWidth
//                           value={amount}
//                           onChange={(e) => setAmount(e.target.valueAsNumber)}
//                           error={Boolean(touched.amount && errors.amount)}
//                           helperText={touched.amount && errors.amount}
//                           required
//                           InputProps={{
//                             startAdornment: (
//                               <InputAdornment position="start">
//                                 GH¢
//                               </InputAdornment>
//                             ),
//                             endAdornment: (
//                               <InputAdornment position="end">p</InputAdornment>
//                             ),
//                           }}
//                         />
//                         <TextField
//                           size="small"
//                           label="Email Address(optional)"
//                           placeholder="Enter email here"
//                           type="email"
//                           inputMode="email"
//                           fullWidth
//                           value={email}
//                           onChange={(e) => setEmail(e.target.value)}
//                           error={Boolean(touched.email && errors.email)}
//                           helperText={touched.email && errors.email}
//                         />
//                         <PaymentOption
//                           showWallet={user?.id}
//                           showMomo
//                           setPaymentMethod={setPaymentMethod}
//                           error={Boolean(
//                             touched.paymentMethod && errors.paymentMethod,
//                           )}
//                           value={paymentMethod}
//                           helperText={errors.paymentMethod || err}
//                           mobileMoneyDetails={{
//                             mobilePartner,
//                             setMobilePartner,
//                             mobilePartnerErr: Boolean(
//                               touched.mobilePartner && errors.mobilePartner,
//                             ),
//                             mobilePartnerHelperText: errors.mobilePartner,
//                             phonenumber: phoneNumber,
//                             setPhonenumber: setPhoneNumber,
//                             phonenumberErr: Boolean(
//                               touched.phoneNumber && errors.phoneNumber,
//                             ),
//                             phonenumberHelperText: errors.phoneNumber,
//                             confirmPhonenumber,
//                             setConfirmPhonenumber,
//                             confirmPhonenumberErr: Boolean(
//                               touched.phoneNumber && errors.confirmPhonenumber,
//                             ),
//                             confirmPhonenumberHelperText:
//                               errors.confirmPhonenumber,
//                           }}
//                           walletDetails={{
//                             token,
//                             setToken,
//                             tokenErr:
//                               Boolean(touched.token && errors.token) || err,
//                             tokenHelperText: errors.token || err,
//                           }}
//                         />

//                         <LoadingButton
//                           variant="contained"
//                           onClick={handleSubmit}
//                           fullWidth
//                           loading={isLoading || isSubmitting}
//                           sx={{
//                             py: 1.2,
//                             borderRadius: 2,
//                             boxShadow: "none",
//                             transition: theme.transitions.create([
//                               "background-color",
//                               "box-shadow",
//                               "transform",
//                             ]),
//                             "&:hover": {
//                               boxShadow: theme.shadows[4],
//                               transform: "scale(1.02)",
//                             },
//                           }}
//                         >
//                           {isLoading || isSubmitting ? "Please Wait..." : "Top up"}
//                         </LoadingButton>
//                       </Stack>
//                     );
//                   }}
//                 </Formik>
//               </AnimatedContainer>
//             )}
//           </DialogContent>
//           <Divider />
//           <DialogActions
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//             }}
//           >
//             <Button variant="contained" onClick={handleBuyCredit}>
//               Buy Prepaid
//             </Button>

//             <Button
//               color="error"
//               variant="outlined"
//               onClick={handleRemoveMeter}
//             >
//               Remove Meter
//             </Button>
//           </DialogActions>
//         </Container>
//       </Box>
//       {/* <ServiceNotAvaialble open={openNotAvailable} /> */}
//     </>
//   );
// }

// export default ViewMeter;
