import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Container,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  InputAdornment,
  Paper,
  Fade,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useMutation } from "@tanstack/react-query";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../alert/alertType";
import { createComplaint } from "../../api/complaintAPI";
import {
  CheckCircle,
  Close,
  ContentCopy,
  PhoneRounded,
  CalendarToday,
} from "@mui/icons-material";

// Common meter issues list
const METER_ISSUES = [
  { label: "Meter not found", value: "Meter not found" },
  { label: "Meter not supported", value: "Meter not supported" },
  { label: "Meter not receiving units after payment", value: "Meter not receiving units after payment" },
  { label: "Meter not responding to tokens", value: "Meter not responding to tokens" },
  { label: "Meter not connected to network", value: "Meter not connected to network" },
  { label: "Other meter issue", value: "Other meter issue" },
];

// Updated validation schema
const schema = yup.object({
  serviceType: yup
    .string()
    .oneOf(["prepaid", "meter", "bundle", "airtime", "voucher", "wallet"])
    .required("Service type is required"),
  transactionId: yup.string().when("serviceType", {
    is: (val) => val !== "meter",
    then: (s) => s.required("Transaction ID is required"),
    otherwise: (s) => s.notRequired(),
  }),
  meterNo: yup.string().when("serviceType", {
    is: (val) => val === "prepaid" || val === "meter",
    then: (s) => s.required("Meter number is required"),
    otherwise: (s) => s.notRequired(),
  }),
  paymentMode: yup.string().when("serviceType", {
    is: (val) => val !== "meter",
    then: (s) => s.oneOf(["wallet", "mobile_money",'other']).required("Payment mode is required"),
    otherwise: (s) => s.notRequired(),
  }),
  phonenumber: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(
      /^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/,
      "Enter a valid Ghana phone number"
    ),
  comment: yup.string().required("Please describe your issue"),
  incidentDate: yup
    .date()
    .nullable()
    .default(() => new Date()),
});

const ComplaintForm = () => {
  const { customDispatch } = useCustomContext();
  const [submittedId, setSubmittedId] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      serviceType: "meter",
      transactionId: "",
      meterNo: "",
      paymentMode: "other",
      phonenumber: "",
      comment: "",
      incidentDate: new Date().toISOString().split("T")[0],
    },
  });

  const serviceType = watch("serviceType");
  const selectedIssue = watch("comment"); // used for meter issues dropdown

  const mutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: (data) => {
      customDispatch(
        globalAlertType(
          "success",
          "Complaint submitted successfully. We will contact you shortly."
        )
      );
      reset();
      setSubmittedId(data.id);
      setSuccessModalOpen(true);
    },
    onError: (error) => {
      customDispatch(
        globalAlertType(
          "error",
          error.message || "Failed to submit complaint!"
        )
      );
    },
  });

  const handleCopyId = () => {
    if (submittedId) {
      navigator.clipboard
        .writeText(submittedId)
        .then(() => {
          customDispatch(
            globalAlertType("info", "Complaint ID copied to clipboard!")
          );
        })
        .catch(() => {
          const textArea = document.createElement("textarea");
          textArea.value = submittedId;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          customDispatch(
            globalAlertType("info", "Complaint ID copied to clipboard!")
          );
        });
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSubmittedId(null);
  };

  const onSubmit = (data) => {

    mutation.mutate(data);
  };

  // Handle issue selection: auto-fill comment field
  const handleIssueChange = (e) => {
    const value = e.target.value;
    setValue("comment", value);
  };

  return (
    <>
      <Container maxWidth="sm">
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            We take your concerns seriously. Please fill out the form below and
            we will get back to you.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <Controller
                name="serviceType"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Service Type"
                    fullWidth
                    size="small"
                    error={!!errors.serviceType}
                    helperText={errors.serviceType?.message}
                  >
                    <MenuItem value="prepaid">Prepaid / Postpaid</MenuItem>
                    <MenuItem value="meter">Meter Issues</MenuItem>
                    <MenuItem value="airtime">Airtime Transfer</MenuItem>
                    <MenuItem value="bundle">Data Bundle</MenuItem>
                    <MenuItem value="voucher">Vouchers / Tickets</MenuItem>
                    <MenuItem value="wallet">Wallet Topup</MenuItem>
                  </TextField>
                )}
              />

              {/* Transaction ID - hidden when meter is selected */}
              {serviceType !== "meter" && (
                <Controller
                  name="transactionId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Transaction ID"
                      placeholder="e.g. TXN123456"
                      fullWidth
                      size="small"
                      error={!!errors.transactionId}
                      helperText={errors.transactionId?.message}
                    />
                  )}
                />
              )}

              {/* Meter Number - shown for prepaid or meter */}
              {(serviceType === "prepaid" || serviceType === "meter") && (
                <Controller
                  name="meterNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meter Number"
                      placeholder="e.g. 1234567890"
                      fullWidth
                      size="small"
                      error={!!errors.meterNo}
                      helperText={errors.meterNo?.message}
                    />
                  )}
                />
              )}

              {/* Payment Mode - hidden when meter is selected */}
              {serviceType !== "meter" && (
                <Controller
                  name="paymentMode"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Payment Mode"
                      fullWidth
                      size="small"
                      error={!!errors.paymentMode}
                      helperText={errors.paymentMode?.message}
                    >
                      {serviceType !== "wallet" && (
                        <MenuItem value="wallet">Wallet</MenuItem>
                      )}
                      <MenuItem value="mobile_money">Mobile Money</MenuItem>
                    </TextField>
                  )}
                />
              )}

              {/* Meter Issues Dropdown (only when serviceType is 'meter') */}
              {serviceType === "meter" && (
                <TextField
                  select
                  label="Common Meter Issues"
                  fullWidth
                  size="small"
                  value={selectedIssue || ""}
                  onChange={handleIssueChange}
                >
                  <MenuItem value="">Select an issue...</MenuItem>
                  {METER_ISSUES.map((issue) => (
                    <MenuItem key={issue.value} value={issue.value}>
                      {issue.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* Phone Number Field */}
              <Controller
                name="phonenumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="tel"
                    variant="outlined"
                    label="Phone Number"
                    inputMode="tel"
                    autoComplete="tel"
                    error={!!errors.phonenumber}
                    helperText={errors.phonenumber?.message}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    placeholder="024XXXXXXX"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneRounded fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              {/* Incident Date - hidden when meter is selected */}
              {serviceType !== "meter" && (
                <Controller
                  name="incidentDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Incident Date"
                      fullWidth
                      size="small"
                      error={!!errors.incidentDate}
                      helperText={errors.incidentDate?.message}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday fontSize="small" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              )}

              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Comment / Description"
                    multiline
                    rows={2}
                    placeholder={
                      serviceType === "meter"
                        ? "Select an issue above or type your own description..."
                        : "Please describe your issue in detail..."
                    }
                    fullWidth
                    size="small"
                    error={!!errors.comment}
                    helperText={errors.comment?.message}
                  />
                )}
              />

              <LoadingButton
                type="submit"
                variant="contained"
                size="large"
                loading={mutation.isPending || isSubmitting}
                fullWidth
              >
                Submit Complaint
              </LoadingButton>
            </Stack>
          </form>
        </Paper>
      </Container>

      {/* Success Modal */}
      <Dialog
        open={successModalOpen}
        onClose={handleCloseSuccessModal}
        maxWidth="xs"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            textAlign: "center",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <IconButton
            onClick={handleCloseSuccessModal}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <CheckCircle sx={{ fontSize: 64, color: "success.main" }} />
            <Typography variant="h5" fontWeight="bold">
              Complaint Submitted!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We have received your complaint. Our support team will review it
              and get back to you shortly.
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: "background.default",
                borderRadius: 2,
              }}
            >
              <Typography
                variant="body2"
                fontWeight="medium"
                color="primary.main"
              >
                {submittedId}
              </Typography>
              <IconButton onClick={handleCopyId} size="small">
                <ContentCopy fontSize="small" />
              </IconButton>
            </Paper>
            <Typography variant="caption" color="text.secondary">
              Please save this ID for future reference.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <Button variant="contained" onClick={handleCloseSuccessModal}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ComplaintForm;

// import { useState } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import {
//   Container,
//   Stack,
//   TextField,
//   MenuItem,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   IconButton,
//   Typography,
//   Box,
//   InputAdornment,
//   Paper,
//   Fade,
// } from "@mui/material";
// import { LoadingButton } from "@mui/lab";
// import { useMutation } from "@tanstack/react-query";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { globalAlertType } from "../alert/alertType";
// import { createComplaint } from "../../api/complaintAPI";
// import {
//   CheckCircle,
//   Close,
//   ContentCopy,
//   PhoneRounded,
//   CalendarToday,
// } from "@mui/icons-material";

// const schema = yup.object({
//   serviceType: yup
//     .string()
//     .oneOf(["prepaid", "bundle", "airtime", "voucher", "wallet"])
//     .required("Service type is required"),
//   transactionId: yup.string().required("Transaction ID is required"),
//   meterNo: yup.string().when("serviceType", {
//     is: "prepaid",
//     then: (s) => s.required("Meter number is required"),
//     otherwise: (s) => s.notRequired(),
//   }),
//   paymentMode: yup
//     .string()
//     .oneOf(["wallet", "mobile_money"])
//     .required("Payment mode is required"),
//   phonenumber: yup
//     .string()
//     .trim()
//     .required("Phone number is required")
//     .matches(
//       /^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/,
//       "Enter a valid Ghana phone number",
//     ),
//   comment: yup.string().required("Please describe your issue"),
//   incidentDate: yup
//     .date()
//     .nullable()
//     .default(() => new Date()),
// });

// const ComplaintForm = () => {
//   const { customDispatch } = useCustomContext();
//   const [submittedId, setSubmittedId] = useState(null);
//   const [successModalOpen, setSuccessModalOpen] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     watch,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       serviceType: "meter",
//       transactionId: "",
//       meterNo: "",
//       paymentMode: "wallet",
//       phonenumber: "",
//       comment: "",
//       incidentDate: new Date().toISOString().split("T")[0], // today's date as string
//     },
//   });

//   const serviceType = watch("serviceType");

//   const mutation = useMutation({
//     mutationFn: createComplaint,
//     onSuccess: (data) => {
//       customDispatch(
//         globalAlertType(
//           "success",
//           "Complaint submitted successfully. We will contact you shortly."
//         )
//       );
//       reset();
//       setSubmittedId(data.id);
//       setSuccessModalOpen(true);
//     },
//     onError: (error) => {
//       customDispatch(
//         globalAlertType(
//           "error",
//           error.message || "Failed to submit complaint!"
//         )
//       );
//     },
//   });

//   const handleCopyId = () => {
//     if (submittedId) {
//       navigator.clipboard
//         .writeText(submittedId)
//         .then(() => {
//           customDispatch(
//             globalAlertType("info", "Complaint ID copied to clipboard!")
//           );
//         })
//         .catch(() => {
//           const textArea = document.createElement("textarea");
//           textArea.value = submittedId;
//           document.body.appendChild(textArea);
//           textArea.select();
//           document.execCommand("copy");
//           document.body.removeChild(textArea);
//           customDispatch(
//             globalAlertType("info", "Complaint ID copied to clipboard!")
//           );
//         });
//     }
//   };

//   const handleCloseSuccessModal = () => {
//     setSuccessModalOpen(false);
//     setSubmittedId(null);
//   };

//   const onSubmit = (data) => {
//     mutation.mutate(data);
//   };

//   return (
//     <>
//       <Container maxWidth="sm">
//         <Paper sx={{ p: 3 }}>
//           <Typography variant="body2" color="text.secondary" paragraph>
//             We take your concerns seriously. Please fill out the form below and
//             we will get back to you.
//           </Typography>

//           <form onSubmit={handleSubmit(onSubmit)}>
//             <Stack spacing={3}>
//               <Controller
//                 name="serviceType"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     select
//                     label="Service Type"
//                     fullWidth
//                     size="small"
//                     error={!!errors.serviceType}
//                     helperText={errors.serviceType?.message}
//                   >
//                     <MenuItem value="prepaid">Prepaid / Postpaid</MenuItem>
//                     <MenuItem value="airtime">Airtime Transfer</MenuItem>
//                     <MenuItem value="bundle">Data Bundle</MenuItem>
//                     <MenuItem value="voucher">Vouchers / Tickets</MenuItem>
//                     <MenuItem value="wallet">Wallet Topup</MenuItem>
//                   </TextField>
//                 )}
//               />

//               <Controller
//                 name="transactionId"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="Transaction ID"
//                     placeholder="e.g. TXN123456"
//                     fullWidth
//                     size="small"
//                     error={!!errors.transactionId}
//                     helperText={errors.transactionId?.message}
//                   />
//                 )}
//               />

//               {serviceType === "prepaid" && (
//                 <Controller
//                   name="meterNo"
//                   control={control}
//                   render={({ field }) => (
//                     <TextField
//                       {...field}
//                       label="Meter Number"
//                       placeholder="e.g. 1234567890"
//                       fullWidth
//                       size="small"
//                       error={!!errors.meterNo}
//                       helperText={errors.meterNo?.message}
//                     />
//                   )}
//                 />
//               )}

//               <Controller
//                 name="paymentMode"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     select
//                     label="Payment Mode"
//                     fullWidth
//                     size="small"
//                     error={!!errors.paymentMode}
//                     helperText={errors.paymentMode?.message}
//                   >
//                     {serviceType !== "wallet" && (
//                       <MenuItem value="wallet">Wallet</MenuItem>
//                     )}
//                     <MenuItem value="mobile_money">Mobile Money</MenuItem>
//                   </TextField>
//                 )}
//               />

//               {/* Phone Number Field */}
//               <Controller
//                 name="phonenumber"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     type="tel"
//                     variant="outlined"
//                     label="Phone Number"
//                     inputMode="tel"
//                     autoComplete="tel"
//                     error={!!errors.phonenumber}
//                     helperText={errors.phonenumber?.message}
//                     InputLabelProps={{ shrink: true }}
//                     fullWidth
//                     size="small"
//                     placeholder="024XXXXXXX"
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <PhoneRounded fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}
//               />

//               {/* Incident Date Field */}
//               <Controller
//                 name="incidentDate"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     type="date"
//                     label="Incident Date"
//                     fullWidth
//                     size="small"
//                     error={!!errors.incidentDate}
//                     helperText={errors.incidentDate?.message}
//                     InputLabelProps={{ shrink: true }}
//                     InputProps={{
//                       startAdornment: (
//                         <InputAdornment position="start">
//                           <CalendarToday fontSize="small" />
//                         </InputAdornment>
//                       ),
//                     }}
//                   />
//                 )}
//               />

//               <Controller
//                 name="comment"
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="Comment / Description"
//                     multiline
//                     rows={2}
//                     placeholder="Please describe your issue in detail..."
//                     fullWidth
//                     size="small"
//                     error={!!errors.comment}
//                     helperText={errors.comment?.message}
//                   />
//                 )}
//               />

//               <LoadingButton
//                 type="submit"
//                 variant="contained"
//                 size="large"
//                 loading={mutation.isPending || isSubmitting}
//                 fullWidth
//               >
//                 Submit Complaint
//               </LoadingButton>
//             </Stack>
//           </form>
//         </Paper>
//       </Container>

//       {/* Success Modal */}
//       <Dialog
//         open={successModalOpen}
//         onClose={handleCloseSuccessModal}
//         maxWidth="xs"
//         fullWidth
//         TransitionComponent={Fade}
//         PaperProps={{
//           sx: {
//             borderRadius: 3,
//             p: 2,
//             textAlign: "center",
//           },
//         }}
//       >
//         <DialogTitle sx={{ pb: 1 }}>
//           <IconButton
//             onClick={handleCloseSuccessModal}
//             sx={{ position: "absolute", right: 8, top: 8 }}
//           >
//             <Close />
//           </IconButton>
//         </DialogTitle>
//         <DialogContent>
//           <Box
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               alignItems: "center",
//               gap: 2,
//             }}
//           >
//             <CheckCircle sx={{ fontSize: 64, color: "success.main" }} />
//             <Typography variant="h5" fontWeight="bold">
//               Complaint Submitted!
//             </Typography>
//             <Typography variant="body2" color="text.secondary">
//               We have received your complaint. Our support team will review it
//               and get back to you shortly.
//             </Typography>
//             <Paper
//               variant="outlined"
//               sx={{
//                 p: 2,
//                 width: "100%",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "space-between",
//                 bgcolor: "background.default",
//                 borderRadius: 2,
//               }}
//             >
//               <Typography
//                 variant="body2"
//                 fontWeight="medium"
//                 color="primary.main"
//               >
//                 {submittedId}
//               </Typography>
//               <IconButton onClick={handleCopyId} size="small">
//                 <ContentCopy fontSize="small" />
//               </IconButton>
//             </Paper>
//             <Typography variant="caption" color="text.secondary">
//               Please save this ID for future reference.
//             </Typography>
//           </Box>
//         </DialogContent>
//         <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
//           <Button variant="contained" onClick={handleCloseSuccessModal}>
//             Done
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default ComplaintForm;