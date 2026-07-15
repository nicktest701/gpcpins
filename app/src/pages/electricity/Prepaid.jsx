import { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Paper,
  Stack,
  Divider,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../../constants";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { prepaidMeterValidationSchema } from "../../config/validationSchema";
import { getMeterByNumber } from "@/api/meterAPI"; // assuming this API exists
import PageHero from "../../components/custom/PageHero";
import MeterDetailsDialog from "./MeterDetailsDialog";



function Prepaid() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [submittedNumber, setSubmittedNumber] = useState("");

  // React Hook Form
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(prepaidMeterValidationSchema),
    defaultValues: {
      number: "",
      name: "",
    },
  });

  const watchedName = watch("name");

  // Query to fetch meter details (enabled only when modal opens)
  const {
    data: meter,
    isLoading: meterLoading,
    // isError: meterError,
    error: meterError,
    refetch: refetchMeter,
  } = useQuery({
    queryKey: ["meter-by-id", submittedNumber],
    queryFn: () => getMeterByNumber(submittedNumber, watchedName),
    enabled: !!submittedNumber, // manual trigger
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
            type: meter.type,
            provider_name: meter.provider_name,
          },
        },
      });
    }
  };

  return (
    <>
      {/* Hero Banner */}
      <PageHero
        title="Prepaid Units"
        subtitle=" Buy electricity units for your IMES meter instantly."
        bgImage={IMAGES.ecg}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <AnimatedContainer>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
            <Typography
              variant="h5"
              color="primary"
              fontWeight="bold"
              gutterBottom
            >
              Buy Your Prepaid Units Online
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              We&apos;ve simplified things for easy & quick buying of your home
              and office prepaid units.
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* <Typography
              variant="h6"
              color="error"
              fontWeight="bold"
              gutterBottom
            >
              Please Note!!!
            </Typography> */}
            {/* <Alert severity="warning" sx={{ mb: 3 }}>
              Our prepaid electricity units are exclusively available to
              residents with <strong>IMES meter type</strong>. Please ensure
              your location eligibility before proceeding. Thank you for your
              cooperation.
            </Alert> */}

            <form onSubmit={handleSubmit(onVerify)} noValidate>
              <Stack spacing={2} maxWidth="sm" py={2} mx="auto">
                <Controller
                  name="number"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meter Number"
                      placeholder="e.g. 12788798766"
                      fullWidth
                      error={!!errors.number}
                      helperText={errors.number?.message}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                  )}
                />
                {/* <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Meter Name (Optional)"
                      placeholder="e.g. Jane Doe"
                      fullWidth
                      error={!!errors.name}
                      helperText={errors.name?.message}
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                  )}
                /> */}
                {/* <Controller
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
                /> */}

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
        <MeterDetailsDialog
          open={modalOpen}
          onClose={handleCloseModal}
          meter={meter}
          meterLoading={meterLoading}
          meterError={meterError}
          submittedNumber={submittedNumber}
          refetchMeter={refetchMeter}
          handleProceedToVerify={handleProceedToVerify}
        />
        {/* Meter Details Modal */}
    
      </Container>
    </>
  );
}

export default Prepaid;

