import { useContext, useState } from "react";
import {
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
  Container,
  Grid,
  Link as MuiLink,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import moment from "moment";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { agentRegistrationValidationSchema } from "../../config/validationSchema";
import { createNewAgent } from "../../api/userAPI";
import CustomDatePicker from "../../../../admin/src/components/inputs/CustomDatePicker";

function Distributor() {
  const { customDispatch } = useContext(CustomContext);
  const [dob, setDob] = useState(moment());

  // React Hook Form setup
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
      reset(); // clear form on success
      setDob(moment()); // reset date picker
    },
    onError: () => {
      customDispatch(globalAlertType("error", "An error has occurred!"));
    },
  });

  const onSubmit = (values) => {
    // Add date of birth from state
    const payload = { ...values, dob };
    mutateAsync(payload);
  };

  return (
    <Container sx={{ maxWidth: 800, mx: "auto", px: { xs: 2, sm: 3 } }}>
      {/* Header with login link */}
      <Typography variant="body2" textAlign="right" sx={{ mb: 2 }}>
        Already have an account?{" "}
        <MuiLink
          href="https://agent.gpcpins.com"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
        >
          Login here
        </MuiLink>
      </Typography>

      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
        Freelance Agent Registration
      </Typography>
      <Divider sx={{ mb: 4 }} />

      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={3}>
            {/* Section header */}
            <Typography
              variant="subtitle1"
              sx={{
                bgcolor: "primary.main",
                color: "white",
                p: 1.5,
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              Fill out the form below to register as a Freelance Airtime Agent
            </Typography>

            {/* Personal Information */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstname"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
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
                      label="Last Name"
                      required
                      error={!!errors.lastname}
                      helperText={errors.lastname?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <CustomDatePicker
                  label="Date of Birth"
                  value={dob}
                  setValue={setDob}
                  error={!!errors.dob}
                  helperText={errors.dob?.message}
                  minDate={moment("1900-01-01")}
                  disableFuture
                  size="medium"
                  format="Do MMMM YYYY"
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
                      type="tel"
                      label="Telephone Number"
                      required
                      error={!!errors.phonenumber}
                      helperText={errors.phonenumber?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="residence"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Residential Address"
                  required
                  multiline
                  rows={2}
                  error={!!errors.residence}
                  helperText={errors.residence?.message}
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
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
                      label="National ID / Voter's ID Number"
                      required
                      error={!!errors.nid}
                      helperText={errors.nid?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Business Information */}
            <Typography variant="h6" sx={{ mt: 2 }}>
              Business Details
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="business_name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
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
                      label="Business Location"
                      required
                      error={!!errors.business_location}
                      helperText={errors.business_location?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Controller
              name="business_description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Short Description of Your Business"
                  multiline
                  rows={4}
                  error={!!errors.business_description}
                  helperText={errors.business_description?.message}
                />
              )}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="business_email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      type="email"
                      label="Business Email Address"
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
                      type="tel"
                      label="Business Telephone Number"
                      error={!!errors.business_phonenumber}
                      helperText={errors.business_phonenumber?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>

            {/* Submit button */}
            <LoadingButton
              type="submit"
              variant="contained"
              size="large"
              loading={isSubmitting || isPending}
              fullWidth
              sx={{ mt: 2 }}
            >
              Register Account
            </LoadingButton>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}

export default Distributor;