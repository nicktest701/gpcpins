import {
  Container,
  Paper,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  Alert,
  InputAdornment,
  Fade,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { PhoneRounded, SendRounded } from "@mui/icons-material";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { useAuth } from "../../context/providers/AuthProvider";

import ServiceProvider from "../../components/ServiceProvider";

import { airtimeORbundleValidationSchema } from "../../config/validationSchema";

function Single() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { user } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: yupResolver(airtimeORbundleValidationSchema),
    defaultValues: {
      type: "Airtime",
      provider: "",
      phoneNumber: "",
      confirmPhonenumber: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values) => {
    // Schema already validated everything (provider + phone match + confirm match)

    const search = new URLSearchParams({
      link: searchParams.get("link"),
      type: values.type,
      recipient: values.phoneNumber,
      show_list: values.type === "Bundle" ? "true" : "",
      provider: values.provider,
      network:
        values.provider === "MTN"
          ? 4
          : values.provider === "Vodafone"
            ? 6
            : values.provider === "AirtelTigo"
              ? 1
              : 0,
    }).toString();

    // auth redirect
    if (!user?.id) {
      navigate(
        `/user/login?redirect_url=${pathname}?link=${searchParams.get("link")}`,
      );
      return;
    }

    navigate(`/airtime/buy?${search}`, {
      state: {
        bundleInfo: {
          type: values.type,
          provider: values.provider,
          network:
            values.provider === "MTN"
              ? 4
              : values.provider === "Vodafone"
                ? 6
                : values.provider === "AirtelTigo"
                  ? 1
                  : 0,
        },
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 4,
        bgcolor: (theme) => theme.palette.grey[50],
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={400}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                p: { xs: 3, sm: 4 },
                bgcolor: "primary.main",
                color: "primary.contrastText",
              }}
            >
              <Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Typography variant="h5" fontWeight={700} pb={0}>
                    Airtime & Bundle Purchase
                  </Typography>

                  {/* <Chip size="small" color="secondary" label={watchType} /> */}
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.9,
                  }}
                >
                  Enter recipient details to continue with your top-up
                  transaction.
                </Typography>
              </Stack>
            </Box>

            {/* Content */}
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{
                p: { xs: 3, sm: 4 },
              }}
            >
              <Stack spacing={3}>
                <Alert severity="info" sx={{}}>
                  Ensure the recipient number matches the selected network
                  provider before continuing.
                </Alert>

                {/* Top Up Type */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      select
                      fullWidth
                      label="Top-Up Type"
                      error={!!errors.type}
                      helperText={errors.type?.message}
                    >
                      <MenuItem value="Airtime">Airtime</MenuItem>

                      <MenuItem value="Bundle">Data Bundle</MenuItem>
                    </TextField>
                  )}
                />

                {/* Provider */}
                <Controller
                  name="provider"
                  control={control}
                  render={({ field }) => (
                    <ServiceProvider
                      label="Network Provider"
                      size="small"
                      value={field.value}
                      setValue={field.onChange}
                      error={!!errors.provider}
                      helperText={errors.provider?.message}
                    />
                  )}
                />

                {/* Recipient Number */}
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      fullWidth
                      type="tel"
                      label="Recipient Number"
                      placeholder="024XXXXXXX"
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
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

                {/* Confirm Number */}
                <Controller
                  name="confirmPhonenumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      fullWidth
                      type="tel"
                      label="Confirm Recipient Number"
                      placeholder="Re-enter phone number"
                      error={!!errors.confirmPhonenumber}
                      helperText={errors.confirmPhonenumber?.message}
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

                {/* Submit */}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                  disabled={!isValid}
                  endIcon={<SendRounded />}
                  fullWidth
                  sx={{
                    py: 1.4,
                    // borderRadius: 3,
                    fontWeight: 700,
                    textTransform: "none",
                    boxShadow: "none",

                    "&:hover": {
                      boxShadow: 3,
                    },
                  }}
                >
                  Continue
                </LoadingButton>
              </Stack>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
}

export default Single;
