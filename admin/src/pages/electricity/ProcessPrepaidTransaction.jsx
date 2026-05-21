import { useContext, useState, useEffect } from "react";
import {
  Button,
  DialogActions,
  Stack,
  TextField,
  Divider,
  Chip,
  Box,
  InputLabel,
  Typography,
  IconButton,
  Avatar,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowBack, UploadFile, CheckCircle, Cancel } from "@mui/icons-material";
import moment from "moment";
import Swal from "sweetalert2";
import { CustomContext } from "../../context/providers/CustomProvider";
import { getElectricity, updateElectricityPayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import CheckOutItem from "../../components/items/CheckOutItem";
import { currencyFormatter } from "../../constants";
import CustomTitle from "../../components/custom/CustomTitle";
import { processPrepaidValidationSchema } from "../../config/validationSchema";
import { uploadFile } from "@/lib/upload";

const ProcessPrepaidTransaction = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  // Local state for file upload
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Fetch transaction data
  const transactionId = searchParams.get("row_id");
  const viewMode = searchParams.get("view_status") === "true";

  const {
    data: transactionData,
    isLoading: isLoadingData,
    isError: isDataError,
    error: dataError,
  } = useQuery({
    queryKey: ["electricity-transaction", transactionId],
    queryFn: () => getElectricity(transactionId),
    enabled: !!transactionId,
    initialData: queryClient
      .getQueryData(["ecg-transactions"])
      ?.find((t) => t.id === transactionId),
  });

  // Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(processPrepaidValidationSchema()),
    defaultValues: {
      receipt: transactionData?.info?.downloadLink || "",
      orderNo: "",
      confirmOrderNo: "",
      paymentId: "",
      confirmPaymentId: "",
      lastCharge: "0",
      lastMonthConsumption: "0",
      geoCode: "0",
      ...(transactionData || {}),
    },
  });

  // Watch values for preview
  const receiptUrl = watch("receipt");

  // Pre-populate form when data loads (in edit mode)
  useEffect(() => {
    if (transactionData && !viewMode) {
      setValue("orderNo", transactionData.info?.orderNo || "");
      setValue("paymentId", transactionData.paymentId || "");
      setValue("receipt", transactionData.info?.downloadLink || "");
    }
  }, [transactionData, viewMode, setValue]);

  // Warn on page leave
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Are you sure you want to leave?";
      return "Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Mutation for updating transaction
  const mutation = useMutation({
    mutationFn: updateElectricityPayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["ecg-transactions"]);
      queryClient.invalidateQueries(["electricity-transaction"]);
      customDispatch(globalAlertType("info", "Transaction completed!"));
      navigate("/electricity/transactions?YixHy=a34cdd3543&_pid=423423");
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  // Submit handler
  const onSubmit = (values) => {
    // console.log(values);
    // return
    Swal.fire({
      title: "Processing Payment",
      text: "Proceed with transaction?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, proceed",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          id: transactionData.id,
          data: {
            meterId: transactionData.meterId,
            paymentId: values.paymentId,
            meter: {
              number: transactionData.number,
              geo_code: values.geoCode || 0,
              address: transactionData.address,
              district: transactionData.district,
              name: transactionData.name,
            },
            info: {
              orderNo: values.orderNo,
              amount: transactionData.amount,
              email: transactionData.email,
              phonenumber: transactionData.phonenumber,
              topup: transactionData.topup,
              lastCharge: values.lastCharge,
              lastMonthConsumption: values.lastMonthConsumption,
              downloadLink: values.receipt,
            },
          },
        };
        mutation.mutate(payload);
      }
    });
  };

  // File upload handler
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      const { downloadURL } = await uploadFile({
        folder: "receipts",
        file,
        onProgress: (progress) => setUploadProgress(progress),
      });
      setValue("receipt", downloadURL);
    } catch (error) {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (isDataError || !transactionData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {dataError?.message || "Transaction not found."}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate(-1)}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const { info, ...rest } = transactionData;
  const isCompleted = rest.isProcessed;

  // View mode: display transaction details
  if (viewMode) {
    return (
      <Box sx={{ p: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
          <ArrowBack />
        </IconButton>

        <CustomTitle
          title="Transaction Status"
          subtitle="Details of the current prepaid electricity transaction"
        />

        <Paper elevation={0} sx={{ p: 3, mt: 2 }}>
          <Stack spacing={2}>
            {info?.downloadLink && (
              <Button
                component="a"
                href={info.downloadLink}
                target="_blank"
                variant="contained"
                sx={{ alignSelf: "flex-end" }}
              >
                View Receipt
              </Button>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Transaction ID" value={rest.id} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Order ID" value={rest.paymentId} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem
                  title="Purchased On"
                  value={moment(rest.createdAt).format("LLL")}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Meter Number" value={rest.number} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Meter Name" value={rest.name} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="SPN Number" value={rest.spn} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="District" value={rest.district} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem title="Payment Method" value={rest.mode} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem
                  title="Top Up Amount"
                  value={currencyFormatter(rest.topup)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <CheckOutItem
                  title="Total Amount"
                  value={currencyFormatter(rest.amount)}
                />
              </Grid>
              {isCompleted && (
                <>
                  <Grid item xs={12} sm={6}>
                    <CheckOutItem
                      title="Completed By"
                      value={rest.issuerName || "N/A"}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <CheckOutItem
                      title="Completed On"
                      value={
                        rest.updatedAt
                          ? moment(rest.updatedAt).format("LLL")
                          : "N/A"
                      }
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <CheckOutItem title="Transaction Token" value={info?.orderNo} />
              </Grid>
            </Grid>
            <Divider>
              <Chip
                label={isCompleted ? "Completed" : "Pending"}
                color={isCompleted ? "success" : "warning"}
                icon={isCompleted ? <CheckCircle /> : <Cancel />}
              />
            </Divider>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Edit mode: form to process transaction
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      <CustomTitle
        title="Process Prepaid Transaction"
        subtitle="Complete the payment process by filling the form below."
      />

      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            {/* Read-only fields (meter info) */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Meter Number"
                  value={rest.number}
                  InputProps={{ readOnly: true }}
                     InputLabelProps={{
                    shrink:true
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Meter Name"
                  
                  value={rest.name}
                  InputProps={{ readOnly: true }}
                  InputLabelProps={{
                    shrink:true
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="SPN Number"
                  value={rest.spn}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Amount"
                  value={currencyFormatter(rest.topup)}
                  InputProps={{
                    readOnly: true,
                    sx: { fontWeight: "bold", color: "primary.main" },
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            {/* Form fields */}
            <Controller
              name="orderNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Transaction Token"
                  required
                  error={!!errors.orderNo}
                  helperText={errors.orderNo?.message}
                  fullWidth
                  size="small"
                />
              )}
            />

            <Controller
              name="confirmOrderNo"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Transaction Token"
                  required
                  error={!!errors.confirmOrderNo}
                  helperText={errors.confirmOrderNo?.message}
                  fullWidth
                  size="small"
                />
              )}
            />

            <Controller
              name="paymentId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Order ID"
                  required
                  error={!!errors.paymentId}
                  helperText={errors.paymentId?.message}
                  fullWidth
                  size="small"
                />
              )}
            />

            <Controller
              name="confirmPaymentId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Confirm Order ID"
                  required
                  error={!!errors.confirmPaymentId}
                  helperText={errors.confirmPaymentId?.message}
                  fullWidth
                  size="small"
                />
              )}
            />

            {/* Receipt upload */}
            <Box>
              <InputLabel sx={{ mb: 1 }}>Copy of Receipt</InputLabel>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add a screenshot or a copy of your transaction receipt
              </Typography>

              {receiptUrl && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Avatar
                    src={receiptUrl}
                    variant="rounded"
                    sx={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 200,
                      objectFit: "contain",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Box>
              )}

              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadFile />}
                disabled={isUploading}
                sx={{ mt: 1 }}
              >
                {receiptUrl ? "Change Receipt" : "Upload Receipt"}
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                />
              </Button>

              {isUploading && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Uploading... {Math.round(uploadProgress)}%
                  </Typography>
                  <Box
                    sx={{
                      height: 4,
                      width: "100%",
                      bgcolor: "action.hover",
                      borderRadius: 1,
                      overflow: "hidden",
                      mt: 0.5,
                    }}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: `${uploadProgress}%`,
                        bgcolor: "primary.main",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </Box>
                </Box>
              )}

              {uploadError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {uploadError}
                </Alert>
              )}

              {errors.receipt && (
                <Typography variant="caption" color="error">
                  {errors.receipt.message}
                </Typography>
              )}
            </Box>

            <DialogActions sx={{ p: 0, pt: 2 }}>
              <Button onClick={() => navigate(-1)}>Cancel</Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting || mutation.isLoading}
                disabled={isUploading}
              >
                Proceed
              </LoadingButton>
            </DialogActions>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default ProcessPrepaidTransaction;


// import { useContext, useState } from "react";
// import {
//   Button,
//   DialogActions,
//   Stack,
//   TextField,
//   Divider,
//   Chip,
//   Box,
//   InputLabel,
//   Typography,
//   IconButton,
//   Avatar,
// } from "@mui/material";
// import moment from "moment";
// import LoadingButton from "@mui/lab/LoadingButton";
// import { Formik } from "formik";
// import Swal from "sweetalert2";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getElectricity, updateElectricityPayment } from "../../api/paymentAPI";
// import { globalAlertType } from "../../components/alert/alertType";
// import { Link, useNavigate, useSearchParams } from "react-router-dom";
// import CheckOutItem from "../../components/items/CheckOutItem";
// import { currencyFormatter } from "../../constants";
// import { useEffect } from "react";
// import { ArrowBack } from "@mui/icons-material";
// import CustomTitle from "../../components/custom/CustomTitle";
// import { processPrepaidValidationSchema } from "../../config/validationSchema";
// import CustomFormControl from "../../components/inputs/CustomFormControl";
// import { uploadFile } from "@/lib/upload";
// import GlobalSpinner from "@/components/spinners/GlobalSpinner";

// const ProcessPrepaidTransaction = () => {
//   // Local state
//   const [logoFile, setLogoFile] = useState(null);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const queryClient = useQueryClient();
//   const navigate = useNavigate();
//   const { customDispatch } = useContext(CustomContext);
//   const [searchParams] = useSearchParams();

//   const {
//     data: { info, ...rest },
//     isLoading: isTransactionLoading,
//   } = useQuery({
//     queryKey: ["electricity-transaction", searchParams?.get("row_id")],
//     queryFn: () => getElectricity(searchParams?.get("row_id")),
//     enabled: !!searchParams?.get("row_id"),
//     initialData:
//       queryClient
//         .getQueryData(["ecg-transactions"])
//         ?.find(
//           (transaction) => transaction?.id === searchParams?.get("row_id"),
//         ) ?? {},
//   });

//   const initialValues = {
//     receipt: info.downloadLink,
//     orderNo: "",
//     confirmOrderNo: "",
//     paymentId: "",
//     confirmPaymentId: "",
//     lastCharge: "0",
//     lastMonthConsumption: "0",
//     geoCode: "0",
//     ...info,
//     ...rest,
//   };

//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const confirmationMessage = "Are you sure you want to leave?";
//       e.returnValue = confirmationMessage; // For IE and Firefox prior to version 4
//       return confirmationMessage; // For Safari and modern browsers
//     };

//     window.addEventListener("beforeunload", handleBeforeUnload);

//     return () => {
//       window.removeEventListener("beforeunload", handleBeforeUnload);
//     };
//   }, []);

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: updateElectricityPayment,
//   });
//   const onSubmit = (values, options) => {
//     // console.log(values);
//     Swal.fire({
//       title: "Processing Payment",
//       text: `Proceed with transaction?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         // console.log(values);
//         const updatedInfo = {
//           id: values.id,
//           data: {
//             meterId: values?.meterId,
//             paymentId: values?.paymentId,

//             meter: {
//               number: values.number,
//               geo_code: values.geoCode || 0,
//               address: values.address,
//               district: values.district,
//               name: values.name,
//             },
//             info: {
//               orderNo: values.orderNo,
//               amount: values.amount,
//               email: values.email,
//               phonenumber: values.phonenumber,
//               topup: values.topup,
//               lastCharge: values.lastCharge,
//               lastMonthConsumption: values.lastMonthConsumption,
//               downloadLink: values.receipt
//                 ? values.receipt
//                 : info?.downloadLink,
//             },
//           },
//         };
//         // console.log(updatedInfo);
//         // return

//         mutateAsync(updatedInfo, {
//           onSettled: () => {
//             options.setSubmitting(false);
//             queryClient.invalidateQueries(["ecg-transactions"]);
//             queryClient.invalidateQueries(["electricity-transaction"]);
//           },
//           onSuccess: () => {
//             customDispatch(globalAlertType("info", "Transaction Completed!"));
//             handleClose();
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   // Upload logo
//   const handleUploadFile = async (e) => {
//     setLoading(true);

//     try {
//       const file = e.target.files[0];
//       if (!file) return;
//       setLogoFile(file);
//       // Create preview
//       const reader = new FileReader();
//       reader.onload = () => setLogoPreview(reader.result);
//       reader.readAsDataURL(file);

//       // Actually upload to Firebase
//       const { downloadURL } = await uploadFile({
//         folder: "category",
//         file,
//         onProgress: (progress) => {
//           setProgress(progress);
//         },
//       });
//       return downloadURL;
//     } catch (error) {
//       customDispatch(
//         globalAlertType("error", "Something went wrong. Please try again."),
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClose = () => {
//     navigate("/electricity/transactions?YixHy=a34cdd3543&_pid=423423");
//   };

//   // Preview logo if uploaded
//   const LogoPreview = ({ dLink }) => (
//     <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
//       {(logoPreview || dLink) && (
//         <Avatar
//           src={logoPreview ? logoPreview : dLink}
//           variant="square"
//           sx={{
//             width: { xs: 240, md: 400 },
//             height: { xs: 240, md: 400 },
//             objectFit: "contain",
//           }}
//         />
//       )}
//     </Box>
//   );

//   return (
//     <>
//       <Link to={"/electricity/transactions?YixHy=a34cdd3543&_pid=423423"}>
//         <IconButton>
//           <ArrowBack />
//         </IconButton>
//       </Link>
//       <CustomTitle
//         title={
//           searchParams?.get("view_status")
//             ? "Transaction Status"
//             : "Process Prepaid Transaction"
//         }
//         subtitle={
//           searchParams?.get("view_status")
//             ? "Showing details of current transaction."
//             : "Complete the payment process by filling the forms below."
//         }
//       />

//       {isTransactionLoading && !rest?.id ? (
//         <Box
//           sx={{
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <div className="spinner"></div>
//         </Box>
//       ) : (
//         <>
//           {rest !== undefined && rest?.id && (
//             <>
//               {searchParams?.get("view_status") ? (
//                 <>
//                   <Stack rowGap={1} p={3}>
//                     {info?.downloadLink && (
//                       <Link
//                         target="_blank"
//                         to={info?.downloadLink}
//                         style={{
//                           alignSelf: "flex-end",
//                           color: "#fff",
//                           backgroundColor: "var(--primary)",
//                           padding: "8px 12px",
//                           borderRadius: "5px",
//                         }}
//                       >
//                         View Receipt
//                       </Link>
//                     )}
//                     <CheckOutItem title="Transaction No." value={rest.id} />
//                     <CheckOutItem title="Order No." value={rest.paymentId} />
//                     <CheckOutItem
//                       title="Purchased On"
//                       value={moment(rest?.createdAt).format("LLL")}
//                     />
//                     <CheckOutItem title="Meter No." value={rest?.number} />
//                     <CheckOutItem title="Meter Name" value={rest?.name} />
//                     <CheckOutItem title="SPN Number" value={rest?.spn} />
//                     <CheckOutItem title="District" value={rest?.district} />
//                     <CheckOutItem title="Payment Method" value={rest?.mode} />
//                     <CheckOutItem
//                       title="Top Up Amount"
//                       value={currencyFormatter(rest?.topup)}
//                     />
//                     <CheckOutItem
//                       title="Total Amount"
//                       value={currencyFormatter(rest?.amount)}
//                     />

//                     {rest?.isProcessed && (
//                       <>
//                         <CheckOutItem
//                           title="Completed By"
//                           value={rest?.issuerName || "N/A"}
//                         />

//                         <CheckOutItem
//                           title="Completed on"
//                           value={moment(rest?.updatedAt).format("LLL") || "N/A"}
//                         />
//                       </>
//                     )}

//                     <CheckOutItem
//                       title="Transaction Token"
//                       value={info?.orderNo}
//                     />

//                     <Divider flexItem>
//                       <Chip
//                         label={rest?.isProcessed ? "Completed" : "Pending"}
//                         sx={{
//                           color: "white",
//                           bgcolor: rest?.isProcessed
//                             ? "success.darker"
//                             : "info.main",
//                         }}
//                       />
//                     </Divider>
//                   </Stack>
//                 </>
//               ) : (
//                 <Formik
//                   initialValues={initialValues}
//                   onSubmit={onSubmit}
//                   enableReinitialize={true}
//                   validationSchema={processPrepaidValidationSchema}
//                 >
//                   {({
//                     touched,
//                     errors,
//                     setFieldValue,
//                     handleSubmit,
//                     getFieldProps,
//                     values,
//                   }) => {
//                     return (
//                       <>
//                         <Stack rowGap={3} py={2}>
//                           <div style={{ width: "100%" }}>
//                             <label style={{ fontWeight: "bold" }}>
//                               Meter Number
//                             </label>
//                             <TextField
//                               size="small"
//                               fullWidth
//                               defaultValue={rest?.number}
//                               value={values?.number}
//                               aria-readonly
//                               InputProps={{
//                                 readOnly: true,
//                                 style: {
//                                   backgroundColor: "whitesmoke",
//                                   color: "var(--primary)",
//                                   fontWeight: "bold",
//                                 },
//                               }}
//                             />
//                           </div>
//                           <CustomFormControl>
//                             <div style={{ width: "100%" }}>
//                               <label style={{ fontWeight: "bold" }}>
//                                 Meter Name
//                               </label>
//                               <TextField
//                                 size="small"
//                                 fullWidth
//                                 defaultValue={rest?.name}
//                                 value={values?.name}
//                                 aria-readonly
//                                 InputProps={{
//                                   readOnly: true,
//                                   style: {
//                                     backgroundColor: "whitesmoke",
//                                   },
//                                 }}
//                               />
//                             </div>
//                           </CustomFormControl>

//                           <CustomFormControl>
//                             <div style={{ width: "100%" }}>
//                               <label style={{ fontWeight: "bold" }}>
//                                 SPN Number
//                               </label>
//                               <TextField
//                                 size="small"
//                                 fullWidth
//                                 defaultValue={rest?.spn}
//                                 value={values?.spn}
//                                 aria-readonly
//                                 InputProps={{
//                                   readOnly: true,
//                                   style: {
//                                     backgroundColor: "whitesmoke",
//                                   },
//                                 }}
//                               />
//                             </div>
//                             <div style={{ width: "100%" }}>
//                               <label style={{ fontWeight: "bold" }}>
//                                 Amount
//                               </label>
//                               <TextField
//                                 size="small"
//                                 fullWidth
//                                 defaultValue={currencyFormatter(rest?.topup)}
//                                 value={currencyFormatter(values?.topup)}
//                                 aria-readonly
//                                 InputProps={{
//                                   readOnly: true,
//                                   style: {
//                                     backgroundColor: "whitesmoke",
//                                     color: "green",
//                                     fontWeight: "bold",
//                                   },
//                                 }}
//                               />
//                             </div>
//                           </CustomFormControl>

//                           <TextField
//                             size="small"
//                             label="Transaction Token"
//                             required
//                             fullWidth
//                             {...getFieldProps("orderNo")}
//                             error={Boolean(touched.orderNo && errors.orderNo)}
//                             helperText={touched.orderNo && errors.orderNo}
//                           />
//                           <TextField
//                             size="small"
//                             label="Confirm Transaction Token"
//                             required
//                             fullWidth
//                             {...getFieldProps("confirmOrderNo")}
//                             error={Boolean(
//                               touched.confirmOrderNo && errors.confirmOrderNo,
//                             )}
//                             helperText={
//                               touched.confirmOrderNo && errors.confirmOrderNo
//                             }
//                           />
//                           <TextField
//                             size="small"
//                             label="Order ID"
//                             required
//                             fullWidth
//                             {...getFieldProps("paymentId")}
//                             error={Boolean(
//                               touched.paymentId && errors.paymentId,
//                             )}
//                             helperText={touched.paymentId && errors.paymentId}
//                           />
//                           <TextField
//                             size="small"
//                             label="Confirm Order ID"
//                             required
//                             fullWidth
//                             {...getFieldProps("confirmPaymentId")}
//                             error={Boolean(
//                               touched.confirmPaymentId &&
//                               errors.confirmPaymentId,
//                             )}
//                             helperText={
//                               touched.confirmPaymentId &&
//                               errors.confirmPaymentId
//                             }
//                           />
//                           <Stack pb={4} spacing={1} width="100%">
//                             <InputLabel sx={{ alignSelf: "flex-start" }}>
//                               Copy of Receipt
//                             </InputLabel>
//                             <Typography fontSize={14} fontWeight="bold">
//                               Add a screenshot or a copy of your transaction
//                               receipt
//                             </Typography>
//                             {/* Logo Upload */}
//                             <Box>
//                               {loading && (
//                                 <Box sx={{ width: "100%", mb: 1 }}>
//                                   <Typography
//                                     variant="caption"
//                                     color="textSecondary"
//                                   >
//                                     Uploading... {Math.round(progress)}%
//                                   </Typography>
//                                   <Box
//                                     sx={{
//                                       height: 4,
//                                       width: "100%",
//                                       bgcolor: "action.hover",
//                                       borderRadius: 1,
//                                       overflow: "hidden",
//                                     }}
//                                   >
//                                     <Box
//                                       sx={{
//                                         height: "100%",
//                                         width: `${progress}%`,
//                                         bgcolor: "primary.main",
//                                         transition: "width 0.3s ease",
//                                       }}
//                                     />
//                                   </Box>
//                                 </Box>
//                               )}

//                               <LogoPreview dLink={values.receipt} />
//                             </Box>

//                             {touched.receipt && errors.receipt && (
//                               <small style={{ color: "#B72136" }}>
//                                 {errors.receipt}
//                               </small>
//                             )}

//                             <Box
//                               sx={{
//                                 mt: 1,
//                                 display: "flex",
//                                 alignItems: "center",
//                                 gap: 2,
//                               }}
//                             >
//                               <input
//                                 type="file"
//                                 // fullWidth
//                                 accept="image/*"
//                                 onChange={async (e) => {
//                                   const downloadURL = await handleUploadFile(e);
//                                   setFieldValue("receipt", downloadURL);
//                                 }}
//                               />
//                             </Box>
//                           </Stack>
//                         </Stack>

//                         <DialogActions sx={{ p: 4 }}>
//                           <Link to={-1}>
//                             <Button>Cancel</Button>
//                           </Link>
//                           <LoadingButton
//                             variant="contained"
//                             loading={isLoading}
//                             onClick={handleSubmit}
//                           >
//                             Proceed
//                           </LoadingButton>
//                         </DialogActions>
//                       </>
//                     );
//                   }}
//                 </Formik>
//               )}
//             </>
//           )}
//         </>
//       )}

//       {loading && <GlobalSpinner />}
//     </>
//   );
// };

// export default ProcessPrepaidTransaction;
