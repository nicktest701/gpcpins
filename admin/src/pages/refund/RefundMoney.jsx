import { useContext, useState } from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  Grid,
  Divider,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  MenuItem,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import moment from "moment";
import {
  Receipt,
  AttachMoney,
  Email,
  Phone,
  CalendarToday,
  Info,
} from "@mui/icons-material";

import CustomTitle from "@/components/custom/CustomTitle";
import { refundValidationSchema } from "@/config/validationSchema";
import { getRefundTransaction, refundTransaction } from "@/api/transactionAPI";
import { currencyFormatter } from "@/constants";
import { globalAlertType } from "@/components/alert/alertType";
import { CustomContext } from "@/context/providers/CustomProvider";
import GlobalSpinner from "@/components/spinners/GlobalSpinner";

function RefundMoney() {
  const { customDispatch } = useContext(CustomContext);
  const [transactionData, setTransactionData] = useState(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundError, setRefundError] = useState("");

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(refundValidationSchema()),
    defaultValues: {
      category: "",
      id: "",
    },
  });

  // Mutation to fetch transaction details
  const fetchMutation = useMutation({
    mutationFn: getRefundTransaction,
    onSuccess: (data) => {
      setTransactionData(data);
      setRefundAmount("");
      setRefundError("");
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
      setTransactionData(null);
    },
  });

  // Mutation to process refund
  const refundMutation = useMutation({
    mutationFn: refundTransaction,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      // Reset form and state
      reset();
      setTransactionData(null);
      setRefundAmount("");
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  // Submit search
  const onSearch = (values) => {
    fetchMutation.mutate(values);
  };

  // Validate and process refund
  const handleRefund = () => {
    const amountNum = Number(refundAmount);
    if (!refundAmount || amountNum <= 0) {
      setRefundError("Amount must be greater than 0");
      return;
    }
    if (amountNum > transactionData?.amount) {
      setRefundError(`Amount cannot exceed paid amount (${currencyFormatter(transactionData?.amount)})`);
      return;
    }

    Swal.fire({
      title: "Confirm Refund",
      html: `You are about to refund <strong>${currencyFormatter(amountNum)}</strong>.<br/>This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, refund",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          id: transactionData.id,
          paymentId: transactionData.paymentId,
          category: transactionData.category,
          amount: amountNum,
          mode: transactionData.mode,
          email: transactionData.email,
          phonenumber: transactionData.phonenumber,
          user: transactionData.user,
          isAgent: transactionData.isAgent,
        };
        refundMutation.mutate(payload);
      }
    });
  };

  const handleClear = () => {
    reset();
    setTransactionData(null);
    setRefundAmount("");
    setRefundError("");
    fetchMutation.reset();
  };

  const isLoading = fetchMutation.isLoading;
  const isRefunding = refundMutation.isLoading;
  const searchError = fetchMutation.error;

  return (
    <Box sx={{  mx: "auto", px: { xs: 2, sm: 3 }, py: 3 }}>
      <CustomTitle
        title="Refund Money"
        subtitle="Process customer refunds for vouchers, tickets, airtime, and more"
      />

      <Paper elevation={3} sx={{ p: 3, borderRadius: 1.2, mb: 4 }}>
        <form onSubmit={handleSubmit(onSearch)} noValidate>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Enter transaction type and ID to fetch details.
          </Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={5}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Transaction Type"
                    fullWidth
                    size="small"
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    <MenuItem value="voucher">Vouchers</MenuItem>
                    <MenuItem value="ticket">Tickets</MenuItem>
                    <MenuItem value="prepaid">Prepaid Units</MenuItem>
                    <MenuItem value="airtime">Airtime Transfer</MenuItem>
                    <MenuItem value="bundle">Data Bundle</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <Controller
                name="id"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Transaction ID"
                    fullWidth
                    size="small"
                    error={!!errors.id}
                    helperText={errors.id?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isLoading}
                fullWidth
              >
                Find
              </LoadingButton>
            </Grid>
          </Grid>
        </form>

        {searchError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {searchError.message || "Transaction not found"}
          </Alert>
        )}
      </Paper>

      {/* Transaction Details Card */}
      {transactionData && (
        <Card elevation={2} sx={{ borderRadius: 1.2, mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Transaction Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Receipt fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Transaction ID:</Typography>
                  <Typography variant="body2" fontWeight="medium">{transactionData.id}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Info fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Payment Mode:</Typography>
                  <Typography variant="body2" fontWeight="medium">{transactionData.mode}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AttachMoney fontSize="small" color="secondary" />
                  <Typography variant="body2" color="text.secondary">Amount Paid:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="secondary.main">
                    {currencyFormatter(transactionData.amount)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Email fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Email:</Typography>
                  <Typography variant="body2">{transactionData.email || "N/A"}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Phone fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Phone:</Typography>
                  <Typography variant="body2">{transactionData.phonenumber || "N/A"}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CalendarToday fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Created:</Typography>
                  <Typography variant="body2">
                    {transactionData.updatedAt ? moment(transactionData.updatedAt).format("LLL") : "N/A"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Typography variant="body2" textTransform="capitalize" fontWeight="medium">
                    {transactionData.status}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Refund Section */}
      {transactionData && (
        <Paper elevation={2} sx={{ p: 3, borderRadius: 1.2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Process Refund
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the amount you wish to refund (must not exceed the paid amount).
          </Typography>

          <Stack spacing={2}>
            <TextField
              type="number"
              label="Refund Amount"
              value={refundAmount}
              onChange={(e) => {
                setRefundAmount(e.target.value);
                if (refundError) setRefundError("");
              }}
              InputProps={{
                startAdornment: <InputAdornment position="start">GH¢</InputAdornment>,
                endAdornment: <InputAdornment position="end">p</InputAdornment>,
              }}
              error={!!refundError}
              helperText={refundError}
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <LoadingButton
                variant="contained"
                loading={isRefunding}
                onClick={handleRefund}
                disabled={!refundAmount}
              >
                Refund
              </LoadingButton>
              <LoadingButton
                variant="outlined"
                onClick={handleClear}
                disabled={isRefunding}
              >
                Clear
              </LoadingButton>
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Global loaders */}
      {isRefunding && <GlobalSpinner />}
    </Box>
  );
}

export default RefundMoney;

// import {
//   DialogActions,
//   Divider,
//   InputAdornment,
//   MenuItem,
//   Stack,
//   TextField,
//   Typography,
// } from "@mui/material";
// import moment from "moment";
// import Swal from "sweetalert2";
// import CustomTitle from "@/components/custom/CustomTitle";
// import CustomFormControl from "@/components/inputs/CustomFormControl";
// import { LoadingButton } from "@mui/lab";
// import { Formik } from "formik";
// import { useMutation } from "@tanstack/react-query";
// import { getRefundTransaction, refundTransaction } from "@/api/transactionAPI";
// import { currencyFormatter } from "@/constants";
// import { useContext, useState } from "react";
// import { globalAlertType } from "@/components/alert/alertType";
// import { CustomContext } from "@/context/providers/CustomProvider";
// import GlobalSpinner from "@/components/spinners/GlobalSpinner";
// import LoadingSpinner from "@/components/spinners/LoadingSpinner";
// import { refundValidationSchema } from "@/config/validationSchema";

// function RefundMoney() {
//   const { customDispatch } = useContext(CustomContext);
//   const [category, setCategory] = useState("");
//   const [id, setId] = useState("");
//   const [amount, setAmount] = useState(0);
//   const [amountErr, setAmountErr] = useState("");
//   const initialValues = {
//     category,
//     id,
//   };

//   const { data, isError, error, isSuccess, mutateAsync, isLoading,reset } =
//     useMutation({
//       mutationFn: getRefundTransaction,
//     });

//   const onSubmit = (values, options) => {
//     mutateAsync(values, {
//       onSettled: () => {
//         options.setSubmitting(false);
//       },
//     });
//   };

//   const { mutateAsync: refundMutateAsync, isLoading: isRefunding, } =
//     useMutation({
//       mutationFn: refundTransaction,
//     });
//   const proceedWithRefund = () => {
//     setAmountErr("");

//     if (Number(amount) <= 0) {
//       setAmountErr("Amount should not be less than GHS 0.00");
//       return;
//     }
//     if (Number(amount) >= data?.amount) {
//       setAmountErr(
//         `Amount should be less than or equal to amount paid (${currencyFormatter(
//           data?.amount,
//         )})`,
//       );
//       return;
//     }

//     Swal.fire({
//       title: "Refund Money",
//       text: `You are about to refund an amount of ${currencyFormatter(
//         amount,
//       )}.Changes cannot be undone after completion.Proceed with refund?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         const payload = {
//           id,
//           paymentId: data?.paymentId,
//           category,
//           amount,
//           mode: data?.mode,
//           email: data?.email,
//           phonenumber: data?.phonenumber,
//           user: data?.user,
//           isAgent: data?.isAgent,
//         };

//         // console.log(payload);
//         // return;
//         refundMutateAsync(payload, {
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("success", data));
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   return (
//     <>
//       <CustomTitle
//         title="Refund Money"
//         subtitle="Manage and View history of all refund requests for customers"
//       />

//       <Formik
//         initialValues={initialValues}
//         onSubmit={onSubmit}
//         enableReinitialize={true}
//         validationSchema={refundValidationSchema}
//       >
//         {({ touched, errors, handleSubmit }) => {
//           return (
//             <>
//               <Stack rowGap={3} p={2} my={2} bgcolor="#fff" borderRadius={1}>
//                 <Typography>
//                   Begin refund process by selecting transaction type and
//                   providing your transaction ID.
//                 </Typography>
//                 <CustomFormControl>
//                   <div style={{ width: "100%" }}>
//                     <label style={{ fontWeight: "bold", display: "block" }}>
//                       Select Transaction Type
//                     </label>
//                     <TextField
//                       select
//                       size="small"
//                       value={category}
//                       fullWidth
//                       onChange={(e) => setCategory(e.target.value)}
//                       error={Boolean(touched.category && errors.category)}
//                       helperText={touched.category && errors.category}
//                     >
//                       <MenuItem value="voucher">Vouchers</MenuItem>
//                       <MenuItem value="ticket">Tickets</MenuItem>
//                       <MenuItem value="prepaid">Prepaid Units </MenuItem>
//                       <MenuItem value="airtime">Airtime Transfer </MenuItem>
//                       <MenuItem value="bundle">Data Bundle </MenuItem>
//                     </TextField>
//                   </div>
//                   <div style={{ width: "100%" }}>
//                     <label style={{ fontWeight: "bold" }}>Transaction ID</label>
//                     <TextField
//                       size="small"
//                       fullWidth
//                       value={id}
//                       onChange={(e) => setId(e.target.value)}
//                       aria-readonly
//                       InputProps={{
//                         style: {
//                           backgroundColor: "whitesmoke",
//                         },
//                       }}
//                       error={Boolean(touched.id && errors.id)}
//                       helperText={touched.id && errors.id}
//                     />
//                   </div>
//                 </CustomFormControl>

//                 <DialogActions>
//                   <LoadingButton
//                     variant="contained"
//                     loading={isLoading}
//                     onClick={handleSubmit}
//                   >
//                     Find Transaction
//                   </LoadingButton>
//                 </DialogActions>
//               </Stack>
//             </>
//           );
//         }}
//       </Formik>

//       {isError && (
//         <Stack>
//           <Typography textAlign="center">{error}</Typography>
//         </Stack>
//       )}
//       {isSuccess && data && (
//         <>
//           <Stack spacing={1} my={4} padding={2} bgcolor="#fff" borderRadius={2}>
//             <Typography>
//               Showing details of transaction awaiting refunding.
//             </Typography>
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Transaction ID</Typography>
//               <Typography>{data?.id}</Typography>
//             </Stack>
//             <Divider flexItem />
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Payment Mode</Typography>
//               <Typography>{data?.mode}</Typography>
//             </Stack>
//             <Divider flexItem />
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Amount Paid</Typography>
//               <Typography variant="h6" color="secondary">
//                 {currencyFormatter(data?.amount)}
//               </Typography>
//             </Stack>
//             <Divider flexItem />
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Email Address</Typography>
//               <Typography>{data?.email}</Typography>
//             </Stack>
//             <Divider flexItem />
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Phone Number</Typography>
//               <Typography>{data?.phonenumber}</Typography>
//             </Stack>
//             <Divider flexItem />
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Created On</Typography>
//               <Typography>{moment(data?.updatedAt)?.format("LLL")}</Typography>
//             </Stack>
//             <Divider flexItem />
//             <Stack
//               flexDirection="row"
//               justifyContent="space-between"
//               alignItems="center"
//               gap={2}
//             >
//               <Typography fontWeight="bold">Status</Typography>
//               <Typography textTransform="capitalize">{data?.status}</Typography>
//             </Stack>
//           </Stack>

//           <Typography variant="h6" color="secondary">
//             Refund Process
//           </Typography>
//           <Typography>
//             Complete the refund process by entering the amount you want to
//             refund.
//           </Typography>

//           <CustomFormControl>
//             <TextField
//               variant="filled"
//               type="number"
//               inputMode="numeric"
//               placeholder="Amount"
//               label=" Amount to Refund"
//               fullWidth
//               required
//               InputProps={{
//                 startAdornment: (
//                   <InputAdornment position="start">GH¢</InputAdornment>
//                 ),
//                 endAdornment: <InputAdornment position="end">p</InputAdornment>,
//               }}
//               value={amount}
//               onChange={(e) => setAmount(e.target.value)}
//               error={amountErr !== ""}
//               helperText={amountErr}
//             />

//             <DialogActions>
//               <LoadingButton
//                 variant="contained"
//                 color="primary"
//                 loading={isRefunding}
//                 onClick={proceedWithRefund}
//                 style={{ minWidth: 300 }}
//               >
//                 Refund
//               </LoadingButton>
//               <LoadingButton
//                 variant="outlined"
//                 disabled={isRefunding}
//                 onClick={() => {
//                   setAmount("");
//                   setAmountErr("");
//                   reset()
//                 }}
//                 style={{ minWidth: 300 }}
//               >
//                 Clear
//               </LoadingButton>
//             </DialogActions>
//           </CustomFormControl>
//         </>
//       )}

//       {isRefunding && <GlobalSpinner />}
//       {isLoading && <LoadingSpinner value="Please Wait..." />}
//     </>
//   );
// }

// export default RefundMoney;
