import { useContext, useState } from "react";
import {
  Container,
  Paper,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Formik } from "formik";
import { airtimeORbundleValidationSchema } from "../../config/validationSchema";
import { AuthContext } from "../../context/providers/AuthProvider";
import ServiceProvider from "../../components/ServiceProvider";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "../../constants/PhoneCode";

const Single = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();
  const { user } = useContext(AuthContext);
  const [phoneNumberErr, setPhoneNumberErr] = useState("");

  const initialValues = {
    type: "Airtime",
    provider: "",
    phoneNumber: "",
    confirmPhonenumber: "",
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const { provider, phoneNumber, type } = values;

    // Validate phone number
    if (!isValidPartner(provider, getInternationalMobileFormat(phoneNumber))) {
      setPhoneNumberErr(`Invalid ${provider} number`);
      setSubmitting(false);
      return;
    }

    setPhoneNumberErr("");

    // Redirect to login if not authenticated
    if (!user?.id) {
      navigate(
        `/user/login?redirect_url=${pathname}?link=${searchParams.get("link")}`,
      );
      setSubmitting(false);
      return;
    }

    // Build navigation URL
    const bundleFlag = type === "Bundle" ? "true" : "";
    const search = new URLSearchParams({
      link: searchParams.get("link"),
      type,
      recipient: phoneNumber,
      show_list: bundleFlag,
      provider,
      network:
        provider === "MTN"
          ? 4
          : provider === "Vodafone"
            ? 6
            : provider === "AirtelTigo"
              ? 1
              : 0,
    }).toString();

    console.log(search);

    navigate(`/airtime/buy?${search}`, {
      state: {
        bundleInfo: {
          type,
          provider,
          network:
            provider === "MTN"
              ? 4
              : provider === "Vodafone"
                ? 6
                : provider === "AirtelTigo"
                  ? 1
                  : 0,
        },
      },
    });
    setSubmitting(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Select Top-Up Type & Enter Recipient Number
        </Typography>

        <Formik
          initialValues={initialValues}
          validationSchema={airtimeORbundleValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={false}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Stack spacing={3}>
                {/* Top-Up Type */}
                <TextField
                  select
                  fullWidth
                  label="Top-Up Type"
                  name="type"
                  value={values.type}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.type && Boolean(errors.type)}
                  helperText={touched.type && errors.type}
                >
                  <MenuItem value="Airtime">Airtime</MenuItem>
                  <MenuItem value="Bundle">Data Bundle</MenuItem>
                </TextField>

                {/* Network Provider */}
                <ServiceProvider
                  label="Network Provider"
                  size="medium"
                  value={values.provider}
                  setValue={(val) =>
                    handleChange({ target: { name: "provider", value: val } })
                  }
                  error={touched.provider && Boolean(errors.provider)}
                  helperText={touched.provider && errors.provider}
                />

                {/* Recipient Number */}
                <TextField
                  fullWidth
                  type="tel"
                  label="Recipient Number"
                  name="phoneNumber"
                  value={values.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    (touched.phoneNumber && Boolean(errors.phoneNumber)) ||
                    Boolean(phoneNumberErr)
                  }
                  helperText={
                    (touched.phoneNumber && errors.phoneNumber) ||
                    phoneNumberErr
                  }
                />

                {/* Confirm Number */}
                <TextField
                  fullWidth
                  type="tel"
                  label="Confirm Recipient Number"
                  name="confirmPhonenumber"
                  value={values.confirmPhonenumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.confirmPhonenumber &&
                    Boolean(errors.confirmPhonenumber)
                  }
                  helperText={
                    touched.confirmPhonenumber && errors.confirmPhonenumber
                  }
                />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="large"
                  loading={isSubmitting}
                  fullWidth
                >
                  Continue
                </LoadingButton>
              </Stack>
            </Box>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default Single;
