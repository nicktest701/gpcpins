import { useContext, useState } from "react";
import { Container, Divider, MenuItem, TextField } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/providers/AuthProvider";
import ServiceProvider from "../../components/ServiceProvider";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "../../constants/PhoneCode";
import { Formik } from "formik";
import { airtimeORbundleValidationSchema } from "../../config/validationSchema";

const Single = () => {
  const [searchParams] = useSearchParams();
  const { pathname } = useLocation();

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [type, setType] = useState("Airtime");
  const [phoneNumber, setPhoneNumber] = useState(user?.phonenumber);
  const [provider, setProvider] = useState("");
  const [phoneNumberErr, setPhoneNumberErr] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState(
    user?.phonenumber
  );

  const initialValues = {
    type,
    phoneNumber,
    confirmPhonenumber,
    provider,
  };

  const onSubmit = (values) => {
    const { phoneNumber, provider, type } = values;
    setPhoneNumberErr("");

    if (!isValidPartner(provider, getInternationalMobileFormat(phoneNumber))) {
      setPhoneNumberErr(`Invalid ${provider} number`);
      return;
    }

    if (!user?.id) {
      navigate(
        `/user/login?redirect_url=${pathname}?link=${searchParams.get("link")}`
      );
      return;
    }

    navigate(
      `buy?link=${searchParams.get(
        "link"
      )}&type=${type}&recipient=${phoneNumber}&show_list=${
        type === "Bundle" ? "true" : ""
      }`,
      {
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
      }
    );
  };

  return (
    <>
      {/* <Typography variant='h4'>
        Select Top-Up Type and Enter Recipient&apos;s Number{' '}
      </Typography> */}

      <Formik
        initialValues={initialValues}
        validationSchema={airtimeORbundleValidationSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ errors, handleSubmit, touched }) => {
          return (
            <Container
              maxWidth="xs"
              sx={{
                py: 4,
                my: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
                borderRadius: 2,
              }}
            >
              <TextField
                select
                label="Select Top-Up Type"
                fullWidth
                required
                value={type}
                onChange={(e) => setType(e.target.value)}
                error={Boolean(touched.type && errors.type)}
                helperText={touched.type && errors.type}
              >
                <MenuItem value="Airtime">Airtime </MenuItem>
                <MenuItem value="Bundle">Data Bundle </MenuItem>
              </TextField>

              <ServiceProvider
                label="Network Type"
                size="small"
                value={provider}
                setValue={setProvider}
                error={Boolean(touched.provider && errors.provider)}
                helperText={touched.provider && errors.provider}
              />
              <TextField
                type="tel"
                inputMode="tel"
                variant="outlined"
                label="Recipient Number"
                fullWidth
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={
                  Boolean(touched.phoneNumber && errors.phoneNumber) ||
                  Boolean(phoneNumberErr)
                }
                helperText={
                  (touched.phoneNumber && errors.phoneNumber) || phoneNumberErr
                }
              />
              <TextField
                type="tel"
                inputMode="tel"
                variant="outlined"
                label="Confirm Recipient Number"
                fullWidth
                required
                value={confirmPhonenumber}
                onChange={(e) => setConfirmPhonenumber(e.target.value)}
                error={
                  Boolean(
                    touched.confirmPhonenumber && errors.confirmPhonenumber
                  ) || Boolean(phoneNumberErr)
                }
                helperText={errors.confirmPhonenumber || phoneNumberErr}
                margin="dense"
              />

              <LoadingButton
                type="submit"
                variant="contained"
                onClick={handleSubmit}
                fullWidth
              >
                Top Up
              </LoadingButton>
            </Container>
          );
        }}
      </Formik>
      <Divider />
    </>
  );
};

export default Single;
