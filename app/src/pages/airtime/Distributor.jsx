import { useState } from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
  Container,
  Grid,
  // Unstable_Grid2 as Grid,
  Chip,
  Alert,
  Box,
  Link as MuiLink,
  useTheme,
  alpha,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  PersonRounded,
  StorefrontRounded,
  LoginRounded,
} from "@mui/icons-material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { agentRegistrationValidationSchema } from "../../config/validationSchema";
import { createNewAgent } from "../../api/userAPI";
import CustomDatePicker from "../../../../admin/src/components/inputs/CustomDatePicker";

// Small section header used by both cards below — keeps icon, title,
// and description consistent instead of repeating the markup twice.
function SectionHeader({ icon, title, description }) {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: 2,
          flexShrink: 0,
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="700">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  );
}

function Distributor() {
  const theme = useTheme();
  const { customDispatch } = useCustomContext();
  const [submitted, setSubmitted] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(agentRegistrationValidationSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      dob: null,
      nid: "",
      residence: "",
      email: "",
      phonenumber: "",
      business_name: "",
      business_location: "",
      business_description: "",
      business_email: "",
      business_phonenumber: "",
    },
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createNewAgent,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data));
      setSubmitted(true);
      reset();
    },
    onError: () => {
      customDispatch(globalAlertType("error", "An error has occurred!"));
    },
  });

  const onSubmit = (values) => {
    mutateAsync(values);
  };

  return (
    <Container
      sx={{
        maxWidth: 840,
        mx: "auto",
        px: { xs: 2, sm: 3 },
        py: { xs: 3, sm: 5 },
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "flex-end" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
         
          <Typography variant="h4" component="h1" fontWeight="800" gutterBottom>
            Register as an Agent
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 480 }}
          >
            Apply to sell airtime, vouchers, tickets, and other prepaid services
            through the platform. We&apos;ll review your details and reach out
            with next steps.
          </Typography>
        </Box>
        <MuiLink
          href="https://agent.gpcpins.com"
          target="_blank"
          rel="noopener noreferrer"
          underline="none"
        >
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              color: "text.primary",
              whiteSpace: "nowrap",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                color: "primary.main",
              },
            }}
          >
            <LoginRounded fontSize="small" />
            <Typography variant="body2" fontWeight="600">
              Already registered? Log in
            </Typography>
          </Stack>
        </MuiLink>
      </Stack>

      {submitted && (
        <Alert
          severity="success"
          onClose={() => setSubmitted(false)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          Application submitted. We&apos;ll review your details and get in touch
          soon.
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={3}>
          {/* Personal information */}
          <Paper
            elevation={1}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 3,
              // border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            }}
          >
            <SectionHeader
              icon={<PersonRounded />}
              title="Personal Information"
              description="Tell us who you are and how to reach you."
            />

            <Stack columnGap={2} >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="firstname"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="First Name"
                        required
                        error={!!errors.firstname}
                        helperText={errors.firstname?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="lastname"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Last Name"
                        required
                        error={!!errors.lastname}
                        helperText={errors.lastname?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} >
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                      <CustomDatePicker
                        label="Date of Birth"
                        value={field.value}
                        setValue={field.onChange}
                        error={!!errors.dob}
                        helperText={errors.dob?.message}
                        minDate={moment("1900-01-01")}
                        disableFuture
                        size="small"
                        format="Do MMMM YYYY"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phonenumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="tel"
                        label="Telephone Number"
                        required
                        error={!!errors.phonenumber}
                        helperText={errors.phonenumber?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="residence"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Residential Address"
                        required
                        multiline
                        rows={2}
                        error={!!errors.residence}
                        helperText={errors.residence?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="email"
                        label="Email Address"
                        required
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="nid"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="National ID / Voter's ID Number"
                        required
                        error={!!errors.nid}
                        helperText={errors.nid?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          {/* Business information */}
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2.5, sm: 3.5 },
              borderRadius: 3,
              // border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
            }}
          >
            <SectionHeader
              icon={<StorefrontRounded />}
              title="Business Details"
              description="Where and how you'll operate as an agent."
            />

            <Stack >
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="business_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Business Name"
                        required
                        error={!!errors.business_name}
                        helperText={errors.business_name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="business_location"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Business Location"
                        required
                        error={!!errors.business_location}
                        helperText={errors.business_location?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="business_description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        label="Short Description of Your Business (Optional)"
                        multiline
                        rows={4}
                        error={!!errors.business_description}
                        helperText={errors.business_description?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="business_email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="email"
                        label="Business Email Address (Optional)"
                        error={!!errors.business_email}
                        helperText={errors.business_email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="business_phonenumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        type="tel"
                        label="Business Telephone Number (Optional)"
                        error={!!errors.business_phonenumber}
                        helperText={errors.business_phonenumber?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          {/* Submit */}
          <Box>
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting || isPending}
              fullWidth
              sx={{
                borderRadius: 2,
                textTransform: "none",
                py: 1.25,
                fontWeight: 700,
              }}
            >
              Submit Application
            </LoadingButton>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              textAlign="center"
              sx={{ mt: 1.5 }}
            >
              By submitting, you agree to be contacted about your application.
            </Typography>
          </Box>
        </Stack>
      </form>
    </Container>
  );
}

export default Distributor;
