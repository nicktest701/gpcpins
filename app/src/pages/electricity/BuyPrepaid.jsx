import {
  Box,
  Container,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { useContext, useState } from "react";
import CheckOutItem from "@/components/items/CheckOutItem";
import { Formik } from "formik";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingButton } from "@mui/lab";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { IMAGES, currencyFormatter } from "@/constants";
import { getAllMeters } from "@/api/meterAPI";
import { CustomContext } from "@/context/providers/CustomProvider";
import { prepaidNonUserPaymentValidationSchema } from "@/config/validationSchema";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import PaymentOption from "@/components/PaymentOption";
import { AuthContext } from "@/context/providers/AuthProvider";
import { disableWallet, getNonUser } from "@/api/userAPI";
import { globalAlertType } from "@/components/alert/alertType";
import { makeElectricityPayment } from "@/api/paymentAPI";
import { isBetween50And99 } from "@/config/validation";
import { useEffect } from "react";

function BuyPrepaid() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const { meterNo, meterName } = useParams();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);
  const [amount, setAmount] = useState(Number(0));
  const [mobilePartner, setMobilePartner] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");

  const initialValues = {
    meterNo,
    email,
    amount,
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
    paymentMethod,
  };

// console.log(user)

  const meterDetails = useQuery({
    queryKey: ["meter-details"],
    queryFn: () => getAllMeters(meterNo),
    enabled: !!meterNo,
  });

  // Get wallet status
  const { data: dataDisableWallet } = useQuery({
    queryKey: ["disable-wallet"],
    queryFn: () => disableWallet(),
    enabled: failureCount === 0,
    initialData: { active: true, timeOut: null },
  });

  useEffect(() => {
    setErr("");

    if (dataDisableWallet?.active === false) {
      const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
      setErr(message);

      queryClient.invalidateQueries({ queryKey: ["wallet-status"] });
    }
  }, [dataDisableWallet, queryClient]);

  //Make Payment
  const { mutate } = useMutation({
    mutationFn: makeElectricityPayment,
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: () => getNonUser(),
  });

  //Verify  Payment
  const onSubmit = (values) => {
    const newMeterInfo = {
      number: meterNo,
      name: meterName,
      type: "prepaid",
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
        meterDetails?.data?.id !== undefined
          ? meterDetails?.data?.id
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

    if (user?.id && paymentMethod === "wallet") {
      const walletBalance = queryClient.getQueryData(
        ["wallet-balance", user?.id],
        { exact: true },
      );

      if (
        Number(walletBalance) === 0 ||
        Number(walletBalance) < Number(meterInfo.amount)
      ) {
        customDispatch(
          globalAlertType(
            "error",
            "Insufficient Wallet Balance. Please request a top up.",
          ),
        );
        return;
      }
      meterInfo.token = token;
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with payment?`,
      html: `
         <div style="display: flex; justify-content: center; align-items: center; height: 65svh; margin: 0; background: linear-gradient(135deg, #f0f4fa 0%, #e6ecf3 100%); font-family: 'Segoe UI', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif; padding: 0.5rem;">
      <div style="max-width: 520px; width: 100%; background: #ffffff; overflow: hidden; transition: all 0.2s ease;">
     
    
        <!-- Content area -->
        <div style="padding: 1.8rem 1.8rem 2rem;">
          
          <!-- Meter details card -->
          <div style="background: #f8fafd; border-radius: 20px; padding: 1rem 1.2rem; border: 1px solid #e9edf2; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0; border-bottom: 1px dashed #e2e8f0;">
              <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
               Meter Name
              </span>
              <span style="font-weight: 600; color: #1e2a3e; font-size: 0.9rem; background: white; padding: 0.2rem 0.7rem; border-radius: 30px;">${meterName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0; border-bottom: 1px dashed #e2e8f0;">
              <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
              Meter No.
              </span>
              <span style="font-weight: 600; color: #1e2a3e; font-size: 0.9rem; background: white; padding: 0.2rem 0.7rem; border-radius: 30px; font-family: monospace;">${meterNo}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0;">
              <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
                 Payment Method
              </span>
              <span style="background: #eef2ff; padding: 0.2rem 0.9rem; border-radius: 40px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; color: #1f4e6e;">
                ${meterInfo.isWallet ? "Wallet" : "Mobile Money"}
              </span>
            </div>
          </div>
    
          <!-- Financial breakdown (top‑up, charges, total) -->
          <div style="background: #ffffff; border-radius: 20px; border: 1px solid #edf2f7; margin-bottom: 1rem; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; border-bottom: 1px solid #f0f4f9;">
              <span style="display: flex; align-items: center; gap: 10px; font-weight: 500; color: #4a5b7a; font-size: 0.9rem;">
                Top Up
              </span>
              <span style="font-weight: 600; color: #1f2a44;">GH¢${meterInfo.amount.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.9rem 1.2rem; border-bottom: 1px solid #f0f4f9;">
              <span style="display: flex; align-items: center; gap: 10px; font-weight: 500; color: #4a5b7a; font-size: 0.9rem;">
             Charges
              </span>
              <span style="font-weight: 600; color: #1f2a44;">GH¢${meterInfo.charges.toFixed(2)}</span>
            </div>
          </div>
    
          <!-- Total row (highlighted) -->
          <div style="background: #fef9e6; border-radius: 18px; padding: 1rem .5rem; display: flex; justify-content: space-between; align-items: center; border: 1px solid #ffe6c2; margin-bottom: 1.8rem;">
            <span style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 1rem; color: #b45309;">
            Amount
            </span>
            <span style="font-weight: 800; font-size: 1.5rem; color: #c2410c; letter-spacing: -0.3px;">GH¢${meterInfo.amount.toFixed(2)}</span>
            </div>
            </div>
           
            </div>
    </div>
          `,

      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        if (!user?.id) {
          mutateAsync(
            {},
            {
              onSuccess: () => {
                mutate(meterInfo, {
                  onSuccess: (data) => {
                    if (data) {
                      navigate(`/confirm`, {
                        replace: true,
                        state: {
                          _id: data?.id,
                          categoryType: "prepaid",
                          path: pathname,
                          isWallet: meterInfo.isWallet,
                        },
                      });
                    }
                  },
                  onError: (error) => {
                    customDispatch(globalAlertType("error", error));
                  },
                });
              },
            },
          );
        } else {
          mutate(meterInfo, {
            onSuccess: (data) => {
              if (data) {
                navigate(`/confirm`, {
                  replace: true,
                  state: {
                    _id: data?.id,
                    categoryType: "prepaid",
                    path: pathname,
                    isWallet: meterInfo.isWallet,
                  },
                });
              }
            },
            onError: async (error) => {
              if (error === "Invalid PIN!") {
                setFailCount((prevState) => prevState - 1);
                if (failureCount === 0) {
                  const message = `Wallet disabled due to multiple failed attempts.Try again after ${dataDisableWallet?.timeOut}`;
                  setErr(message);
                  queryClient.setQueryData(["wallet-status"], (oldData) => ({
                    ...oldData,
                    active: false,
                    timeOut: dataDisableWallet?.timeOut,
                  }));
                } else {
                  setErr(`${error} ${failureCount - 1} attempt(s) left.`);
                }
              } else {
                // setErr(`${error} ${failureCount - 1} attempt(s) left.`);
                customDispatch(globalAlertType("error", error));
              }
            },
          });
        }
      }
    });
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
                paymentMethod === "momo",
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
                        touched.paymentMethod && errors.paymentMethod,
                      )}
                      value={paymentMethod}
                      helperText={errors.paymentMethod || err}
                      mobileMoneyDetails={{
                        mobilePartner,
                        setMobilePartner,
                        mobilePartnerErr: Boolean(
                          touched.mobilePartner && errors.mobilePartner,
                        ),
                        mobilePartnerHelperText: errors.mobilePartner,
                        phonenumber: phoneNumber,
                        setPhonenumber: setPhoneNumber,
                        phonenumberErr: Boolean(
                          touched.phoneNumber && errors.phoneNumber,
                        ),
                        phonenumberHelperText: errors.phoneNumber,
                        confirmPhonenumber,
                        setConfirmPhonenumber,
                        confirmPhonenumberErr: Boolean(
                          touched.phoneNumber && errors.confirmPhonenumber,
                        ),
                        confirmPhonenumberHelperText: errors.confirmPhonenumber,
                      }}
                      walletDetails={{
                        token,
                        setToken,
                        tokenErr: Boolean(touched.token && errors.token) || err,
                        tokenHelperText: errors.token || err,
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
      {/* <NonUserPayment /> */}

      {/* <ServiceNotAvaialble open={serviceAvailable()} /> */}
    </Container>
  );
}

export default BuyPrepaid;
