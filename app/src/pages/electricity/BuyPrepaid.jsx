import {
  Box,
  Container,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import CheckOutItem from "../../components/items/CheckOutItem";
import { Formik } from "formik";
import { useQuery } from "@tanstack/react-query";
import { LoadingButton } from "@mui/lab";
import { Navigate, useParams } from "react-router-dom";
import { IMAGES, currencyFormatter } from "../../constants";
import { getAllMeters } from "../../api/meterAPI";
import { CustomContext } from "../../context/providers/CustomProvider";
import { prepaidNonUserPaymentValidationSchema } from "../../config/validationSchema";
import NonUserPayment from "./meters/NonUserPayment";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import PaymentOption from "../../components/PaymentOption";
import { AuthContext } from "../../context/providers/AuthProvider";
import { serviceAvailable } from "../../config/serviceAvailable";
import ServiceNotAvaialble from "../ServiceNotAvaialble";
import { isBetween50And99 } from "../../config/validation";

function BuyPrepaid() {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const { meterNo, meterName } = useParams();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [amount, setAmount] = useState(Number(0));
  const [mobilePartner, setMobilePartner] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const initialValues = {
    meterNo,
    email,
    amount,
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
    paymentMethod,
  };

  const meterDetails = useQuery({
    queryKey: ["meter-details"],
    queryFn: () => getAllMeters(meterNo),
    enabled: !!meterNo,
  });

  //Verify  Payment
  const onSubmit = (values, options) => {
    const newMeterInfo = {
      number: meterNo,
      name: meterName,
      type: "PREPAID",
      district: sessionStorage.getItem("meter-location"),
    };

    if (isBetween50And99(Number(amount))) {
      //Calculate charges
      values.topup = Number(amount);
      const charges = 2;
      values.charges = charges;
      values.amount = charges + Number(amount);
    } else {
      //Calculate charges
      values.topup = Number(amount);
      const charges = 0.02 * Number(amount);
      values.charges = charges;
      values.amount = charges + Number(amount);
    }

    const meterInfo = {
      meter:
        meterDetails?.data?._id !== undefined
          ? meterDetails?.data?._id
          : newMeterInfo,
      info: {
        amount: Number(values.amount),
        email: values.email,
        mobileNo: values.phoneNumber,
        provider: values?.mobilePartner,
      },
      topup: Number(values.topup),
      charges: Number(values.charges),
      amount: Number(values.amount),
      isWallet: paymentMethod === "wallet",
    };

    customDispatch({
      type: "openVerifyPrepaid",
      payload: {
        open: true,
        details: meterInfo,
      },
    });
    options.setSubmitting(false);
  };

  if (!meterNo || !meterName) {
    return <Navigate to="/electricity" />;
  }

  return (
    <Container
      sx={{
        maxHeight: "100%",
        p: 2,
        display: "grid",
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.7)),url(${IMAGES.ecg}) no-repeat `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: { xs: 50, md: 80 },
          width: "100%",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography variant="h4" color="#fff">
          Prepaid Units
        </Typography>
      </Box>
      {/* <Back to='/electricity' /> */}
      <Container sx={{ py: 6 }}>
        <Stack justifyContent="center" alignItems="center" py={2}>
          <Typography variant="h4" color="secondary" paragraph>
            Meter Details
          </Typography>
          <Typography variant="body2" textAlign="center">
            Enter your transaction details and the amount to top up.
          </Typography>
        </Stack>
        <Divider />

        <ul style={{ paddingBlock: "8px" }}>
          <Typography color="error">
            NOTE: Please ensure you have sufficient balance in your account
            before proceeding with the transaction.
          </Typography>
          Be informed that there is a
          <li>
            {" "}
            <b> fee of GHS 2.00 </b> for transaction from{" "}
            <b>GHS 50.00 - GHS 99.00</b> and
          </li>
          <li>
            {" "}
            <b>2% fee</b> for transaction from <b>GHS 100 and above.</b>
          </li>
        </ul>

        <Container
          maxWidth="md"
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
            gap: 4,
            paddingY: 2,
          }}
        >
          <AnimatedContainer>
            <Container
              sx={{
                borderRadius: 2,
                padding: 3,
                display: "flex",
                flexDirection: "column",
                rowGap: 2,
                bgcolor: "secondary.main",
                color: "secondary.contrastText",
              }}
            >
              <>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  marginY={1}
                  bgcolor="#fff"
                  color="#333"
                  padding={2}
                >
                  <Typography variant="body2">Top Up Amount</Typography>
                  <Typography variant="body2">
                    {currencyFormatter(amount || 0)}
                  </Typography>
                </Stack>
                <small style={{ color: "var(--primary)" }}>
                  NOTE: Minimum amount you can buy is <b> GHS 50</b>.
                </small>
                <CheckOutItem
                  color="secondary.contrastText"
                  title="Meter No."
                  value={meterDetails?.data?.number || meterNo}
                />
                <CheckOutItem
                  color="secondary.contrastText"
                  title="Name"
                  value={meterDetails?.data?.name || meterName}
                />
                <CheckOutItem
                  color="secondary.contrastText"
                  title="Type"
                  value="PREPAID (IMES)"
                />

                <CheckOutItem
                  color="secondary.contrastText"
                  title="District"
                  value={
                    meterDetails?.data?.district ||
                    sessionStorage.getItem("meter-location")
                  }
                />

                <CheckOutItem
                  color="secondary.contrastText"
                  title="Email "
                  value={meterDetails?.data?.email || email}
                />
                <CheckOutItem
                  color="secondary.contrastText"
                  title="Moblie No."
                  value={phoneNumber}
                />
              </>
              {meterDetails.isLoading && (
                <Typography>Loading Meter Information.....</Typography>
              )}
            </Container>
          </AnimatedContainer>
          <AnimatedContainer delay={0.3}>
            <Formik
              initialValues={initialValues}
              onSubmit={onSubmit}
              enableReinitialize={true}
              validationSchema={prepaidNonUserPaymentValidationSchema(
                paymentMethod === "momo"
              )}
            >
              {({ isSubmitting, errors, touched, handleSubmit }) => {
                return (
                  <Stack spacing={3} py={2}>
                    <TextField
                      size="small"
                      label="Enter Amount"
                      placeholder="Enter Amount here"
                      type="number"
                      inputMode="decimal"
                      fullWidth
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      error={Boolean(touched.amount && errors.amount)}
                      helperText={touched.amount && errors.amount}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">GH¢</InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">p</InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      size="small"
                      type="email"
                      inputMode="email"
                      label="Email Address(optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    <PaymentOption
                      showWallet={user?.id}
                      showMomo
                      setPaymentMethod={setPaymentMethod}
                      error={Boolean(
                        touched.paymentMethod && errors.paymentMethod
                      )}
                      helperText={errors.paymentMethod}
                      mobileMoneyDetails={{
                        mobilePartner,
                        setMobilePartner,
                        mobilePartnerErr: Boolean(
                          touched.mobilePartner && errors.mobilePartner
                        ),
                        mobilePartnerHelperText: errors.mobilePartner,
                        phonenumber: phoneNumber,
                        setPhonenumber: setPhoneNumber,
                        phonenumberErr: Boolean(
                          touched.phoneNumber && errors.phoneNumber
                        ),
                        phonenumberHelperText: errors.phoneNumber,
                        //
                        confirmPhonenumber,
                        setConfirmPhonenumber,
                        confirmPhonenumberErr: Boolean(
                          touched.phoneNumber && errors.confirmPhonenumber
                        ),
                        confirmPhonenumberHelperText: errors.confirmPhonenumber,
                      }}
                    />

                    <LoadingButton
                      type="submit"
                      loading={isSubmitting}
                      variant="contained"
                      fullWidth
                      onClick={handleSubmit}
                    >
                      Top Up
                    </LoadingButton>
                  </Stack>
                );
              }}
            </Formik>
          </AnimatedContainer>
        </Container>
      </Container>
      <NonUserPayment />

      <ServiceNotAvaialble open={serviceAvailable()} />
    </Container>
  );
}

export default BuyPrepaid;
