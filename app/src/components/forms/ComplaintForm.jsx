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
} from "@mui/icons-material";

const schema = yup.object({
  serviceType: yup
    .string()
    .oneOf(["prepaid", "bundle", "airtime", "voucher"])
    .required("Service type is required"),
  transactionId: yup.string().required("Transaction ID is required"),
  meterNo: yup.string().when("serviceType", {
    is: "prepaid",
    then: (s) => s.required("Meter number is required"),
    otherwise: (s) => s.notRequired(),
  }),
  paymentMode: yup
    .string()
    .oneOf(["wallet", "mobile_money"])
    .required("Payment mode is required"),
  phonenumber: yup
    .string()
    .trim()
    .required("Recipient number is required")
    .matches(
      /^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/,
      "Enter a valid Ghana phone number",
    ),
  comment: yup.string().required("Please describe your issue"),
});

const ComplaintForm = () => {
  const { customDispatch } = useCustomContext();
  const [submittedId, setSubmittedId] = useState(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      serviceType: "meter",
      transactionId: "",
      meterNo: "",
      paymentMode: "wallet",
      phonenumber: "",
      comment: "",
    },
  });

  const serviceType = watch("serviceType");

  const mutation = useMutation({
    mutationFn: createComplaint,
    onSuccess: (data) => {
      customDispatch(
        globalAlertType(
          "success",
          "Complaint submitted successfully. We will contact you shortly.",
        ),
      );
      reset();
      setSubmittedId(data.id);
      setSuccessModalOpen(true);
    },
    onError: (error) => {
      customDispatch(
        globalAlertType(
          "error",
          error.message || "Failed to submit complaint!",
        ),
      );
    },
  });

  const handleCopyId = () => {
    if (submittedId) {
      navigator.clipboard
        .writeText(submittedId)
        .then(() => {
          customDispatch(
            globalAlertType("info", "Complaint ID copied to clipboard!"),
          );
        })
        .catch(() => {
          // Fallback for older browsers
          const textArea = document.createElement("textarea");
          textArea.value = submittedId;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);
          customDispatch(
            globalAlertType("info", "Complaint ID copied to clipboard!"),
          );
        });
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessModalOpen(false);
    setSubmittedId(null);
  };

  const onSubmit = (data) => {
    // console.log(data);

    mutation.mutate(data);
  };

  return (
    <>
      <Container maxWidth="sm" >
        <Paper >
          {/* <Typography variant="h5" fontWeight="bold" gutterBottom>
            Submit a Complaint
          </Typography> */}
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
                    size='small'
                    error={!!errors.serviceType}
                    helperText={errors.serviceType?.message}
                  >
                    <MenuItem value="prepaid">Prepaid / Postpaid</MenuItem>
                    <MenuItem value="airtime">Airtime Transfer</MenuItem>
                    <MenuItem value="bundle">Data Bundle</MenuItem>
                    <MenuItem value="voucher">Vouchers / Tickets</MenuItem>
                  </TextField>
                )}
              />

              <Controller
                name="transactionId"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Transaction ID"
                    placeholder="e.g. TXN123456"
                    fullWidth
                    size='small'
                    error={!!errors.transactionId}
                    helperText={errors.transactionId?.message}
                  />
                )}
              />

              {serviceType === "prepaid" && (
                <Controller
                  name="meterNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meter Number"
                      placeholder="e.g. 1234567890"
                      fullWidth
                      size='small'
                      error={!!errors.meterNo}
                      helperText={errors.meterNo?.message}
                    />
                  )}
                />
              )}

              <Controller
                name="paymentMode"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Payment Mode"
                    fullWidth
                    size='small'
                    error={!!errors.paymentMode}
                    helperText={errors.paymentMode?.message}
                  >
                    <MenuItem value="wallet">Wallet</MenuItem>
                    <MenuItem value="mobile_money">Mobile Money</MenuItem>
                  </TextField>
                )}
              />
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
                    size='small'
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

              <Controller
                name="comment"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Comment / Description"
                    multiline
                    rows={2}
                    placeholder="Please describe your issue in detail..."
                    fullWidth
                    size='small'
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
                // size='small'
              >
                Submit Complaint
              </LoadingButton>
            </Stack>
          </form>
        </Paper>
      </Container>

      {/* ─── Success Modal ──────────────────────────────────────────── */}
      <Dialog
        open={successModalOpen}
        onClose={handleCloseSuccessModal}
        maxWidth="xs"
        fullWidth
        size='small'
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
