import { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Alert,
  Skeleton,
  Paper,
  Stack,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CloseIcon from "@mui/icons-material/Close";
import { IMAGES } from "../../constants";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { prepaidMeterValidationSchema } from "../../config/validationSchema";
import { getMeterByNumber } from "@/api/meterAPI"; // assuming this API exists

function Prepaid() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState("");

  // React Hook Form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(prepaidMeterValidationSchema),
    defaultValues: {
      number: "",
      confirmNumber: "",
    },
  });

  // Query to fetch meter details (enabled only when modal opens)
  const {
    data: meter,
    isLoading: meterLoading,
    isError: meterError,
    error: meterErrorObj,
    refetch: refetchMeter,
  } = useQuery({
    queryKey: ["meter-by-id", submittedNumber],
    queryFn: () => getMeterByNumber(submittedNumber),
    enabled:!! submittedNumber, // manual trigger
    retry: 1,
  });

  const onVerify = (values) => {
    const meterNumber = values?.number?.toUpperCase();
    setSubmittedNumber(meterNumber);
    setModalOpen(true);
    // We'll refetch after modal opens, but we'll call refetch in useEffect when modal opens and number changes.
  };


  const handleCloseModal = () => {
    setModalOpen(false);
    // Optionally reset meter data
    setSubmittedNumber(null);
  };

  const handleProceedToVerify = () => {
    if (meter) {
      navigate(`prepaid/${submittedNumber}/buy`, {
        state: {
          meterDetails: {
            number: submittedNumber,
            name: meter.name,
            address: meter.address,
            spn: meter.spn,
            // any other data
          },
        },
      });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Banner */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.65)), url(${IMAGES.ecg}) no-repeat center`,
          backgroundSize: "cover",
          borderRadius: 2,
          p: { xs: 3, md: 5 },
          mb: 4,
        }}
      >
        <Typography variant="h3" component="h1" color="white" fontWeight="bold" textAlign="center">
          Prepaid Units
        </Typography>
        <Typography variant="body1" color="white" textAlign="center" sx={{ mt: 1 }}>
          Buy electricity units for your IMES meter instantly
        </Typography>
      </Box>

      <AnimatedContainer>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
          <Typography variant="h5" color="primary" fontWeight="bold" gutterBottom>
            Buy Your Prepaid Units Online
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            We&apos;ve simplified things for easy & quick buying of your home and office prepaid units.
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" color="error" fontWeight="bold" gutterBottom>
            Please Note!!!
          </Typography>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Our prepaid electricity units are exclusively available to residents with{" "}
            <strong>IMES meter type</strong>. Please ensure your location eligibility before
            proceeding. Thank you for your cooperation.
          </Alert>

          <form onSubmit={handleSubmit(onVerify)} noValidate>
            <Stack spacing={2} maxWidth="sm" mx="auto">
              <Controller
                name="number"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="IMES Meter ID"
                    placeholder="e.g. Q788798766"
                    fullWidth
                    error={!!errors.number}
                    helperText={errors.number?.message}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                )}
              />
              <Controller
                name="confirmNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Meter ID"
                    placeholder="e.g. Q788798766"
                    fullWidth
                    error={!!errors.confirmNumber}
                    helperText={errors.confirmNumber?.message}
                    inputProps={{ style: { textTransform: "uppercase" } }}
                  />
                )}
              />
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                size="large"
                sx={{ py: 1.5, mt: 1 }}
              >
                Verify Meter
              </LoadingButton>
            </Stack>
          </form>
        </Paper>
      </AnimatedContainer>

      {/* Meter Details Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          Meter Details
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {meterLoading ? (
            <Stack spacing={2}>
              <Skeleton variant="text" width="80%" height={32} />
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="rectangular" height={80} />
            </Stack>
          ) : meterError ? (
            <Alert severity="error" action={
              <Button color="inherit" size="small" onClick={() => refetchMeter()}>
                Retry
              </Button>
            }>
              {meterErrorObj?.message || "Failed to fetch meter details. Please check the meter number."}
            </Alert>
          ) : meter ? (
            <Stack spacing={2}>
              <Typography variant="body2">
                <strong>Meter Number:</strong> {submittedNumber}
              </Typography>
              <Typography variant="body2">
                <strong>Meter Name:</strong> {meter.name || "N/A"}
              </Typography>
              <Typography variant="body2">
                <strong>Address:</strong> {meter.address || "N/A"}
              </Typography>
              {meter.spn && (
                <Typography variant="body2">
                  <strong>SPN Number:</strong> {meter.spn}
                </Typography>
              )}
              <Typography variant="body2" color="success.main">
                <strong>Type:</strong> IMES Prepaid
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="center" py={4}>
              <SearchOffIcon sx={{width: 60, height: 60}}/>
            <Typography severity="warning">Meter not found. Please verify the number and try again.</Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancel</Button>
          <LoadingButton
            variant="contained"
            onClick={handleProceedToVerify}
            disabled={!meter || meterError}
          >
            Proceed to Buy
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Prepaid;

