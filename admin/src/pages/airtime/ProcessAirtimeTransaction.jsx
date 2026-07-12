import { useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Stack,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  Divider,
  Paper,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  CheckCircle,
  Cancel,
  Receipt,
  Person,
  Phone,
  AttachMoney,
  AssignmentTurnedIn,
  Pending,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useCustomContext } from "../../context/providers/CustomProvider";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { completeBulkAirtimePayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { currencyFormatter } from "../../constants";

const ProcessAirtimeTransaction = () => {
  const [requestID, setRequestID] = useState("");
  const [requestIDErr, setRequestIDErr] = useState("");
  const [status, setStatus] = useState("pending");
  const [statusErr, setStatusErr] = useState("");
  const queryClient = useQueryClient();
  const {
    customState: { ecgTransactionInfoEdit: airtimeData },
    customDispatch,
  } = useCustomContext();



  // Set initial values when data changes
  useEffect(() => {
    if (airtimeData?.details) {
      const { orderId } = airtimeData.details;
      setRequestID(orderId || "");
      // Determine initial status based on isProcessed
     
      
      setStatus(airtimeData.details?.status); // default for new transactions
    }
  }, [airtimeData]);

  // Warn before leaving if dialog is open
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    if (airtimeData.open) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [airtimeData.open]);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: completeBulkAirtimePayment,
    onSuccess: () => {
      queryClient.invalidateQueries(["bulk-airtime-transactions"]);
      queryClient.invalidateQueries(["top-up-balance"]);
      customDispatch(
        globalAlertType("info", "Transaction processed successfully!"),
      );
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleSubmit = () => {
    setRequestIDErr("");
    setStatusErr("");

    if (!requestID.trim()) {
      setRequestIDErr("Order ID is required");
      return;
    }

    if (!status || status === "pending") {
      setStatusErr("Please select a valid status (completed or failed)");
      return;
    }

    const isProcessed = airtimeData?.details?.isProcessed;

    const confirmText = isProcessed
      ? `You are about to reprocess this transaction as "${status}". Are you sure?`
      : `Proceed with marking this transaction as "${status}"? This action cannot be undone.`;

    Swal.fire({
      title: isProcessed ? "Reprocess Transaction" : "Process Transaction",
      text: confirmText,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isProcessed ? "Yes, reprocess" : "Yes, process",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          id: airtimeData.details.paymentId,
          orderId: requestID.trim(),
          status, // Include the selected status
        };
        mutateAsync(payload);
      }
    });
  };

  const handleClose = () => {
    customDispatch({
      type: "viewEcgTransactionInfoEdit",
      payload: { open: false, details: {} },
    });
  };

  if (!airtimeData.open) return null;

  const { details } = airtimeData;
  const isProcessed = details?.isProcessed;
  const recipients = details?.recipient || [];

  return (
    <Dialog
      open={airtimeData.open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <CustomDialogTitle
        title="Process Airtime Transaction"
        subtitle="Review, confirm, and update transaction status"
        onClose={handleClose}
      />

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Transaction Summary Card */}
          <Paper
            variant="outlined"
            sx={{ p: 2, bgcolor: "background.default" }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Receipt color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {details?.id || "—"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AssignmentTurnedIn color="primary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Order ID:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {details?.orderId || "—"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AttachMoney color="secondary" fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    Amount:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="secondary.main"
                  >
                    {currencyFormatter(details?.amount)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Status:
                    </Typography>
                  </Box>
                  <Chip
                    label={status}
                    color={
                      status === "pending"
                        ? "warning"
                        : status === "completed"
                          ? "success"
                          : "error"
                    }
                    size="small"
                    icon={
                      status === "pending" ? (
                        <Pending />
                      ) : status === "completed" ? (
                        <CheckCircle />
                      ) : (
                        <Cancel />
                      )
                    }
                  />
                </Stack>
              </Grid>
            </Grid>

            {isProcessed && (
              <>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Completed by:
                      </Typography>
                      <Typography variant="body2">
                        {details?.issuer || "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Completed on:
                      </Typography>
                      <Typography variant="body2">
                        {details?.updatedAt
                          ? moment(details.updatedAt).format("LLL")
                          : "N/A"}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>

          {/* Recipients List */}
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Recipients ({recipients.length})
            </Typography>
            <Paper variant="outlined" sx={{ overflow: "hidden" }}>
              <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                {recipients.map((item) => (
                  <Stack
                    key={item.id}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      py: 1.5,
                      px: 2,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-child": { borderBottom: "none" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ flex: 1 }}
                    >
                      <Phone color="action" fontSize="small" />
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {item.type}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.recipient}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="secondary.main"
                      >
                        {currencyFormatter(item.price)}
                      </Typography>
                      {status === "pending" ? (
                        <Pending color='warning' />
                      ) : status === "completed" ? (
                        <CheckCircle  color="success"/>
                      ) : (
                        <Cancel color='error'/>
                      )}
                    </Stack>
                  </Stack>
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Order ID Input */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Order ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Enter order ID"
              value={requestID}
              onChange={(e) => {
                setRequestID(e.target.value);
                if (requestIDErr) setRequestIDErr("");
              }}
              error={!!requestIDErr}
              helperText={requestIDErr}
              InputProps={{
                readOnly: isProcessed,
                sx: isProcessed ? { bgcolor: "action.hover" } : {},
              }}
            />
          </Box>

          {/* Status Select */}
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Transaction Status
            </Typography>
            <FormControl fullWidth size="small" error={!!statusErr}>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value);
                  if (statusErr) setStatusErr("");
                }}
                disabled={isLoading}
              >
                <MenuItem value="pending" disabled>
                  Pending
                </MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
              {statusErr && <FormHelperText>{statusErr}</FormHelperText>}
            </FormControl>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <LoadingButton
          loading={isLoading}
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!requestID.trim() || status === "pending" || isLoading}
        >
          {isProcessed ? "Reprocess Transaction" : "Process Transaction"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessAirtimeTransaction;

// import { useContext, useState, useEffect } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogActions,
//   Stack,
//   Typography,
//   Button,
//   TextField,
//   Box,
//   Chip,
//   Divider,
//   Paper,
//   Alert,
//   Grid,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";
// import {
//   CheckCircle,
//   Cancel,
//   Receipt,
//   Person,
//   Phone,
//   AttachMoney,
//   AssignmentTurnedIn,
// } from "@mui/icons-material";
// import Swal from "sweetalert2";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import moment from "moment";
// import { CustomContext, useCustomContext } from "../../context/providers/CustomProvider";
// import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
// import { completeBulkAirtimePayment } from "../../api/paymentAPI";
// import { globalAlertType } from "../../components/alert/alertType";
// import { currencyFormatter } from "../../constants";

// const ProcessAirtimeTransaction = () => {
//   const [requestID, setRequestID] = useState("");
//   const [requestIDErr, setRequestIDErr] = useState("");
//   const queryClient = useQueryClient();
//   const {
//     customState: { ecgTransactionInfoEdit: airtimeData },
//     customDispatch,
//   } = useCustomContext()
//   // console.log(airtimeData)

//   useEffect(() => {
//     // Set initial order ID from data
//     if (airtimeData?.details?.orderId) {
//       setRequestID(airtimeData.details.orderId);
//     }
//   }, [airtimeData]);

//   // Warn before leaving if dialog is open
//   useEffect(() => {
//     const handleBeforeUnload = (e) => {
//       const confirmationMessage = "Are you sure you want to leave?";
//       e.returnValue = confirmationMessage;
//       return confirmationMessage;
//     };

//     if (airtimeData.open) {
//       window.addEventListener("beforeunload", handleBeforeUnload);
//     }
//     return () => window.removeEventListener("beforeunload", handleBeforeUnload);
//   }, [airtimeData.open]);

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: completeBulkAirtimePayment,
//     onSuccess: () => {
//       queryClient.invalidateQueries(["bulk-airtime-transactions"]);
//       queryClient.invalidateQueries(["top-up-balance"]);
//       customDispatch(globalAlertType("info", "Transaction processed successfully!"));
//       handleClose();
//     },
//     onError: (error) => {
//       customDispatch(globalAlertType("error", error));
//     },
//   });

//   const handleSubmit = () => {
//     setRequestIDErr("");
//     if (!requestID.trim()) {
//       setRequestIDErr("Order ID is required");
//       return;
//     }

//     const isProcessed = airtimeData?.details?.isProcessed;
//     const confirmText = isProcessed
//       ? "You are about to resend airtime again. Are you sure?"
//       : "Proceed with transfer of airtime? This action cannot be undone.";

//     Swal.fire({
//       title: isProcessed ? "Reprocess Transaction" : "Process Transaction",
//       text: confirmText,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: isProcessed ? "Yes, reprocess" : "Yes, process",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         const payload = {
//           id: airtimeData.details.id,
//           // orderId: requestID.trim(),
//         };
//         mutateAsync(payload);
//       }
//     });
//   };

//   const handleClose = () => {
//     customDispatch({
//       type: "viewEcgTransactionInfoEdit",
//       payload: { open: false, details: {} },
//     });
//   };

//   if (!airtimeData.open) return null;

//   const { details } = airtimeData;
//   const isProcessed = details?.isProcessed;
//   const recipients = details?.recipient || [];

//   return (
//     <Dialog
//       open={airtimeData.open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//       PaperProps={{
//         sx: { borderRadius: 2 },
//       }}
//     >
//       <CustomDialogTitle
//         title="Process Airtime Transaction"
//         subtitle="Review and confirm transaction details"
//         onClose={handleClose}
//       />

//       <DialogContent dividers>
//         <Stack spacing={3}>
//           {/* Transaction Summary Card */}
//           <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6}>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <Receipt color="primary" fontSize="small" />
//                   <Typography variant="body2" color="text.secondary">
//                     Transaction ID:
//                   </Typography>
//                   <Typography variant="body2" fontWeight="medium">
//                     {details?.id || "—"}
//                   </Typography>
//                 </Stack>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <AssignmentTurnedIn color="primary" fontSize="small" />
//                   <Typography variant="body2" color="text.secondary">
//                     Order ID:
//                   </Typography>
//                   <Typography variant="body2" fontWeight="medium">
//                     {details?.orderId || "—"}
//                   </Typography>
//                 </Stack>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <AttachMoney color="secondary" fontSize="small" />
//                   <Typography variant="body2" color="text.secondary">
//                     Amount:
//                   </Typography>
//                   <Typography variant="body2" fontWeight="bold" color="secondary.main">
//                     {currencyFormatter(details?.amount)}
//                   </Typography>
//                 </Stack>
//               </Grid>
//               <Grid item xs={12} sm={6}>
//                 <Stack direction="row" alignItems="center" spacing={1}>
//                   <Box>
//                     <Typography variant="body2" color="text.secondary">
//                       Status:
//                     </Typography>
//                   </Box>
//                   <Chip
//                     label={isProcessed ? "Completed" : "Pending"}
//                     color={isProcessed ? "success" : "warning"}
//                     size="small"
//                     icon={isProcessed ? <CheckCircle /> : <Cancel />}
//                   />
//                 </Stack>
//               </Grid>
//             </Grid>

//             {isProcessed && (
//               <Divider sx={{ my: 2 }} />
//             )}

//             {isProcessed && (
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={6}>
//                   <Stack direction="row" alignItems="center" spacing={1}>
//                     <Person fontSize="small" color="action" />
//                     <Typography variant="body2" color="text.secondary">
//                       Completed by:
//                     </Typography>
//                     <Typography variant="body2">
//                       {details?.issuer || "N/A"}
//                     </Typography>
//                   </Stack>
//                 </Grid>
//                 <Grid item xs={12} sm={6}>
//                   <Stack direction="row" alignItems="center" spacing={1}>
//                     <Typography variant="body2" color="text.secondary">
//                       Completed on:
//                     </Typography>
//                     <Typography variant="body2">
//                       {details?.updatedAt ? moment(details.updatedAt).format("LLL") : "N/A"}
//                     </Typography>
//                   </Stack>
//                 </Grid>
//               </Grid>
//             )}
//           </Paper>

//           {/* Recipients List */}
//           <Box>
//             <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
//               Recipients ({recipients.length})
//             </Typography>
//             <Paper variant="outlined" sx={{ overflow: "hidden" }}>
//               <Box sx={{ maxHeight: 300, overflow: "auto" }}>
//                 {recipients.map((item) => (
//                   <Stack
//                     key={item.id}
//                     direction="row"
//                     alignItems="center"
//                     justifyContent="space-between"
//                     sx={{
//                       py: 1.5,
//                       px: 2,
//                       borderBottom: "1px solid",
//                       borderColor: "divider",
//                       "&:last-child": { borderBottom: "none" },
//                     }}
//                   >
//                     <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
//                       <Phone color="action" fontSize="small" />
//                       <Typography variant="body2" sx={{ minWidth: 100 }}>
//                         {item.type}
//                       </Typography>
//                       <Typography variant="body2" fontWeight="medium">
//                         {item.recipient}
//                       </Typography>
//                     </Stack>
//                     <Stack direction="row" alignItems="center" spacing={1}>
//                       <Typography variant="body2" fontWeight="bold" color="secondary.main">
//                         {currencyFormatter(item.price)}
//                       </Typography>
//                       {isProcessed && (
//                         <CheckCircle fontSize="small" color="success" />
//                       )}
//                     </Stack>
//                   </Stack>
//                 ))}
//               </Box>
//             </Paper>
//           </Box>

//           {/* Order ID Input */}
//           <Box>
//             <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
//               Order ID
//             </Typography>
//             <TextField
//               fullWidth
//               size="small"
//               placeholder="Enter order ID"
//               value={requestID}
//               onChange={(e) => {
//                 setRequestID(e.target.value);
//                 if (requestIDErr) setRequestIDErr("");
//               }}
//               error={!!requestIDErr}
//               helperText={requestIDErr}
//               InputProps={{
//                 readOnly: isProcessed,
//                 sx: isProcessed ? { bgcolor: "action.hover" } : {},
//               }}
//             />
//           </Box>
//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, gap: 1 }}>
//         <Button onClick={handleClose} variant="outlined">
//           Cancel
//         </Button>
//         <LoadingButton
//           loading={isLoading}
//           variant="contained"
//           color="primary"
//           onClick={handleSubmit}
//           disabled={!requestID.trim()}
//         >
//           {isProcessed ? "Reprocess Transaction" : "Process Transaction"}
//         </LoadingButton>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ProcessAirtimeTransaction;
