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
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { CustomContext } from "../../context/providers/CustomProvider";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { completeBulkAirtimePayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { currencyFormatter } from "../../constants";

const ProcessAirtimeTransaction = () => {
  const [requestID, setRequestID] = useState("");
  const [requestIDErr, setRequestIDErr] = useState("");
  const queryClient = useQueryClient();
  const {
    customState: { ecgTransactionInfoEdit: airtimeData },
    customDispatch,
  } = useContext(CustomContext);

  useEffect(() => {
    // Set initial order ID from data
    if (airtimeData?.details?.orderId) {
      setRequestID(airtimeData.details.orderId);
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
      customDispatch(globalAlertType("info", "Transaction processed successfully!"));
      handleClose();
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleSubmit = () => {
    setRequestIDErr("");
    if (!requestID.trim()) {
      setRequestIDErr("Order ID is required");
      return;
    }

    const isProcessed = airtimeData?.details?.isProcessed;
    const confirmText = isProcessed
      ? "You are about to resend airtime again. Are you sure?"
      : "Proceed with transfer of airtime? This action cannot be undone.";

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
          id: airtimeData.details.id,
          orderId: requestID.trim(),
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
        sx: { borderRadius: 2 },
      }}
    >
      <CustomDialogTitle
        title="Process Airtime Transaction"
        subtitle="Review and confirm transaction details"
        onClose={handleClose}
      />

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Transaction Summary Card */}
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "background.default" }}>
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
                  <Typography variant="body2" fontWeight="bold" color="secondary.main">
                    {currencyFormatter(details?.amount)}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                  </Box>
                  <Chip
                    label={isProcessed ? "Completed" : "Pending"}
                    color={isProcessed ? "success" : "warning"}
                    size="small"
                    icon={isProcessed ? <CheckCircle /> : <Cancel />}
                  />
                </Stack>
              </Grid>
            </Grid>

            {isProcessed && (
              <Divider sx={{ my: 2 }} />
            )}

            {isProcessed && (
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
                      {details?.updatedAt ? moment(details.updatedAt).format("LLL") : "N/A"}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
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
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                      <Phone color="action" fontSize="small" />
                      <Typography variant="body2" sx={{ minWidth: 100 }}>
                        {item.type}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {item.recipient}
                      </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body2" fontWeight="bold" color="secondary.main">
                        {currencyFormatter(item.price)}
                      </Typography>
                      {isProcessed && (
                        <CheckCircle fontSize="small" color="success" />
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
          disabled={!requestID.trim()}
        >
          {isProcessed ? "Reprocess Transaction" : "Process Transaction"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessAirtimeTransaction;



// import { useContext, useState } from "react";
// import {
//   Stack,
//   Typography,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   List,
//   ListItemText,
//   ListItem,
//   Box,
//   ListItemSecondaryAction,
//   TextField,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";
// import Swal from "sweetalert2";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { completeBulkAirtimePayment } from "../../api/paymentAPI";
// import { globalAlertType } from "../../components/alert/alertType";
// import { currencyFormatter } from "../../constants";
// import { useEffect } from "react";
// import moment from "moment";
// import { CheckCircle } from "@mui/icons-material";

// const ProcessAirtimeTransaction = () => {
//   const [requestIDErr, setRequestIDErr] = useState("");
//   const queryClient = useQueryClient();
//   const {
//     customState: { ecgTransactionInfoEdit: airtimeData },
//     customDispatch,
//   } = useContext(CustomContext);
//   const [requestID, setRequestID] = useState(airtimeData?.details?.orderId);

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
//     mutationFn: completeBulkAirtimePayment,
//   });
//   const onSubmit = () => {
//     setRequestIDErr("");
//     if (requestID.trim() === "") {
//       setRequestIDErr("Required*");
//       return;
//     }

//     Swal.fire({
//       title: "Processing Airtime Transaction",
//       text: airtimeData?.details?.isProcessed
//         ? "You are about to resend airtime again.Are you sure?"
//         : `Proceed with transfer of airtime? Airtime sent cannot be undone.`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         const updatedInfo = {
//           id: airtimeData?.details?.id,
//           orderId: requestID,
//         };

//         mutateAsync(updatedInfo, {
//           onSettled: () => {
//             queryClient.invalidateQueries(["bulk-airtime-transactions"]);
//             queryClient.invalidateQueries(["top-up-balance"]);
//           },
//           onSuccess: (data) => {
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

//   const handleClose = () => {
//     customDispatch({
//       type: "viewAirtimeData",
//       payload: {
//         open: false,
//         details: {},
//       },
//     });
//   };
//   // console.log(airtimeData);
//   return (
//     <Dialog
//       open={airtimeData.open}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//     >
//       <CustomDialogTitle
//         title="Process Airtime Transaction"
//         onClose={handleClose}
//       />

//       <DialogContent>
//         <List>
//           <Stack spacing={1}>
//             <Typography>
//               <b>ID:</b> {airtimeData?.details?.id}
//             </Typography>
//             <Typography>
//               <b>ORDER ID:</b> {airtimeData?.details?.orderId}
//             </Typography>
//             <Typography>
//               <b>Amount:</b> {currencyFormatter(airtimeData?.details?.amount)}
//             </Typography>

//             <Typography>
//               <b>Status: </b>
//               {airtimeData?.details?.isProcessed
//                 ? "Completed"
//                 : "Not Completed"}
//             </Typography>

//             {airtimeData?.details?.isProcessed && (
//               <>
//                 <Typography>
//                   <b>Completed by : </b>
//                   {airtimeData?.details?.issuer ?? "N/A"}
//                 </Typography>
//                 <Typography>
//                   <b>Completed On : </b>
//                   {moment(airtimeData?.details?.updatedAt).format("LLL")}
//                 </Typography>
//               </>
//             )}
//           </Stack>
//           <Box sx={{ py: 4 }}>
//             {airtimeData?.details?.recipient?.map((item) => (
//               <ListItem key={item?.id} divider sx={{ py: 2 }}>
//                 <Stack direction="row" spacing={3} width="70%">
//                   <ListItemText
//                     primary={item?.type}
//                     primaryTypographyProps={{ fontWeight: "bold" }}
//                     sx={{ flex: 0.4 }}
//                   ></ListItemText>
//                   <ListItemText
//                     primaryTypographyProps={{ flex: 0.4 }}
//                     primary={item?.recipient}
//                     sx={{ flex: 0.4 }}
//                   />
//                   <ListItemText
//                     sx={{ flex: 0.2 }}
//                     primary={currencyFormatter(item?.price)}
//                     primaryTypographyProps={{
//                       fontWeight: "bold",
//                       fontStyle: "italic",
//                       color: "var(--secondary)",
//                     }}
//                   />
//                 </Stack>
//                 <ListItemSecondaryAction>
//                   {airtimeData?.details?.isProcessed && (
//                     <CheckCircle color="success" />
//                   )}
//                 </ListItemSecondaryAction>
//               </ListItem>
//             ))}
//           </Box>
//         </List>
//         <div style={{ width: "100%" }}>
//           <label style={{ fontWeight: "bold" }}>ORDER ID</label>
//           <TextField
//             size="small"
//             fullWidth
//             defaultValue={airtimeData?.details?.orderId}
//             value={requestID}
//             onChange={(e) => setRequestID(e.target.value)}
//             aria-readonly
//             InputProps={{
//               style: {
//                 backgroundColor: "whitesmoke",
//               },
//             }}
//             error={requestIDErr !== ""}
//             helperText={requestIDErr}
//           />
//         </div>
//       </DialogContent>
//       <DialogActions sx={{ p: 2 }}>
//         <Button onClick={handleClose}>Cancel</Button>
//         <LoadingButton
//           loadingi={isLoading}
//           variant="contained"
//           color="secondary"
//           onClick={onSubmit}
//         >
//           {airtimeData?.details?.isProcessed
//             ? "Reprocess Transaction"
//             : "Process Transaction"}
//         </LoadingButton>
//       </DialogActions>
//     </Dialog>
//   );
// };

// export default ProcessAirtimeTransaction;
