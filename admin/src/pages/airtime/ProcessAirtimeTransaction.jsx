import { useContext, useState } from "react";
import {
  Stack,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  List,
  ListItemText,
  ListItem,
  Box,
  ListItemSecondaryAction,
  TextField,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { CustomContext } from "../../context/providers/CustomProvider";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeBulkAirtimePayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { currencyFormatter } from "../../constants";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import moment from "moment";
import { CheckCircle } from "@mui/icons-material";

const ProcessAirtimeTransaction = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [requestIDErr, setRequestIDErr] = useState("");
  const queryClient = useQueryClient();
  const {
    customState: { ecgTransactionInfoEdit },
    customDispatch,
  } = useContext(CustomContext);
  const [requestID, setRequestID] = useState(
    ecgTransactionInfoEdit?.details?.orderId
  );

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage; // For IE and Firefox prior to version 4
      return confirmationMessage; // For Safari and modern browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: completeBulkAirtimePayment,
  });
  const onSubmit = () => {
    setRequestIDErr("");
    if (requestID.trim() === "") {
      setRequestIDErr("Required*");
      return;
    }

    Swal.fire({
      title: "Processing Airtime Transaction",
      text: ecgTransactionInfoEdit?.details?.isProcessed
        ? "You are about to resend airtime again.Are you sure?"
        : `Proceed with transfer of airtime? Airtime sent cannot be undone.`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const updatedInfo = {
          id: ecgTransactionInfoEdit?.details?._id,
          orderId: requestID,
        };

        mutateAsync(updatedInfo, {
          onSettled: () => {
            queryClient.invalidateQueries(["bulk-airtime-transactions"]);
            queryClient.invalidateQueries(["top-up-balance"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", "Transaction Completed!"));
            handleClose();
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const handleClose = () => {
    customDispatch({
      type: "viewEcgTransactionInfoEdit",
      payload: {
        open: false,
        details: {},
      },
    });
  };
  // console.log(ecgTransactionInfoEdit);
  return (
    <Dialog
      open={ecgTransactionInfoEdit.open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle
        title="Process Airtime Transaction"
        onClose={handleClose}
      />

      <DialogContent>
        <List>
          <Stack spacing={1}>
            <Typography>
              <b>ID:</b> {ecgTransactionInfoEdit?.details?._id}
            </Typography>
            <Typography>
              <b>ORDER ID:</b> {ecgTransactionInfoEdit?.details?.orderId}
            </Typography>
            <Typography>
              <b>Amount:</b>{" "}
              {currencyFormatter(ecgTransactionInfoEdit?.details?.amount)}
            </Typography>

            <Typography>
              <b>Status: </b>
              {ecgTransactionInfoEdit?.details?.isProcessed
                ? "Completed"
                : "Not Completed"}
            </Typography>

            {ecgTransactionInfoEdit?.details?.isProcessed && (
              <>
                <Typography>
                  <b>Completed by : </b>
                  {ecgTransactionInfoEdit?.details?.issuer ?? "N/A"}
                </Typography>
                <Typography>
                  <b>Completed On : </b>
                  {moment(ecgTransactionInfoEdit?.details?.updatedAt).format(
                    "LLL"
                  )}
                </Typography>
              </>
            )}
          </Stack>
          <Box sx={{ py: 4 }}>
            {ecgTransactionInfoEdit?.details?.recipient?.map((item) => (
              <ListItem key={item?.id} divider sx={{ py: 2 }}>
                <Stack direction="row" spacing={3} width="70%">
                  <ListItemText
                    primary={item?.type}
                    primaryTypographyProps={{ fontWeight: "bold" }}
                    sx={{ flex: 0.4 }}
                  ></ListItemText>
                  <ListItemText
                    primaryTypographyProps={{ flex: 0.4 }}
                    primary={item?.recipient}
                    sx={{ flex: 0.4 }}
                  />
                  <ListItemText
                    sx={{ flex: 0.2 }}
                    primary={currencyFormatter(item?.price)}
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      fontStyle: "italic",
                      color: "var(--secondary)",
                    }}
                  />
                </Stack>
                <ListItemSecondaryAction>
                  {ecgTransactionInfoEdit?.details?.isProcessed && (
                    <CheckCircle color="success" />
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </Box>
        </List>
        <div style={{ width: "100%" }}>
          <label style={{ fontWeight: "bold" }}>ORDER ID</label>
          <TextField
            size="small"
            fullWidth
            defaultValue={ecgTransactionInfoEdit?.details?.orderId}
            value={requestID}
            onChange={(e) => setRequestID(e.target.value)}
            aria-readonly
            InputProps={{
              style: {
                backgroundColor: "whitesmoke",
              },
            }}
            error={requestIDErr !== ""}
            helperText={requestIDErr}
          />
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <LoadingButton
          loadingi={isLoading}
          variant="contained"
          color="secondary"
          onClick={onSubmit}
        >
          {ecgTransactionInfoEdit?.details?.isProcessed
            ? "Reprocess Transaction"
            : "Process Transaction"}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessAirtimeTransaction;
