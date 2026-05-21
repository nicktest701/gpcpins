import {
  Box,
  Button,
  Container,
  DialogActions,
  DialogContent,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useContext, useState } from "react";
import { Formik } from "formik";
import { CustomContext } from "@/context/providers/CustomProvider";
import CheckOutItem from "@/components/items/CheckOutItem";

import { LoadingButton } from "@mui/lab";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteMeter } from "@/api/meterAPI";
import { prepaidNonUserPaymentValidationSchema } from "@/config/validationSchema";
import AnimatedContainer from "@/components/animations/AnimatedContainer";
import { globalAlertType } from "@/components/alert/alertType";
// import { AuthContext } from "@/context/providers/AuthProvider";
import DOMPurify from "dompurify";
import PaymentOption from "@/components/PaymentOption";
// import ServiceNotAvaialble from "../../ServiceNotAvaialble";
// import { serviceAvailable } from "@/config/serviceAvailable";
import { isBetween50And99 } from "@/config/validation";
import { AuthContext } from "@/context/providers/AuthProvider";
import { disableWallet } from "@/api/userAPI";
import { useEffect } from "react";
import { makeElectricityPayment } from "@/api/paymentAPI";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getMeterById } from "@/api/meterAPI";

function ViewMeter() {
  const queryClient = useQueryClient();
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const {
    customState: { viewMeter },
    customDispatch,
  } = useContext(CustomContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [showFields, setShowFields] = useState(false);
  const [failureCount, setFailCount] = useState(3);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState(0);
  const [mobilePartner, setMobilePartner] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  // const [openNotAvailable, setOpenNotAvailable] = useState(false);

  const { data: meter } = useQuery({
    queryKey: ["meter", id],
    queryFn: () => getMeterById(id),
    enabled: !!id,
    initialData: viewMeter,
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
  const { mutate, isLoading } = useMutation({
    mutationFn: makeElectricityPayment,
    retry: false,
  });

  //initialState
  const initialValues = {
    amount,
    phoneNumber,
    confirmPhonenumber,
    email: email,
    id: meter?.id,
    name: meter?.name,
    number: meter?.number,
    type: meter?.type,
    mobilePartner,
    paymentMethod,
    token,
  };

  //close dialog
  const handleClose = () =>
    customDispatch({
      type: "openViewMeter",
      payload: {
        open: false,
        // details: {},
      },
    });

  const onSubmit = (values) => {
    values.email = DOMPurify.sanitize(values?.email);
    values.mobileNo = DOMPurify.sanitize(values?.phoneNumber);
    values.provider = values?.mobilePartner;
    values.isWallet = paymentMethod === "wallet";

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
      user: user?.id,
      meter: meter?.id,
      info: {
        amount: values.amount,
        email: values?.email,
        phonenumber: values?.phoneNumber || user?.phonenumber,
        provider: values.provider,
      },
      amount: values.amount,
      topup: values.topup,
      charges: values.charges,
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
          <span style="font-weight: 600; color: #1e2a3e; font-size: 0.9rem; background: white; padding: 0.2rem 0.7rem; border-radius: 30px;">${meter?.name}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0; border-bottom: 1px dashed #e2e8f0;">
          <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
          Meter No.
          </span>
          <span style="font-weight: 600; color: #1e2a3e; font-size: 0.9rem; background: white; padding: 0.2rem 0.7rem; border-radius: 30px; font-family: monospace;">${meter?.number}</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 0.6rem 0;">
          <span style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 500; color: #4a617c;">
             Payment Method
          </span>
          <span style="background: #eef2ff; padding: 0.2rem 0.9rem; border-radius: 40px; font-size: 0.8rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; color: #1f4e6e;">
            ${
        meterInfo.isWallet ? "Wallet" : "Mobile Money"
      }
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
    });

    // handleClose();
  };

  const handleBuyCredit = () => {
    setShowFields(!showFields);
    // if (serviceAvailable()) {
    //   setOpenNotAvailable(true);
    // } else {
    // }
  };

  //DELETE meter

  const { mutateAsync: deleteMutateAsync } = useMutation({
    mutationFn: deleteMeter,
  });

  const handleRemoveMeter = () => {
    Swal.fire({
      title: "Removing meter",
      text: `Do you want to remove meter?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        customDispatch({
          type: "setLoading",
          payload: { open: true, message: "Removing Meter" },
        });

        deleteMutateAsync(viewMeter?.details?._id, {
          onSettled: () => {
            customDispatch({
              type: "setLoading",
              payload: { open: false, message: "Removing Meter" },
            });
            queryClient.invalidateQueries(["meter"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            handleClose();
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  // const updateMeterDetails

  return (
    <>
      <Box sx={{ minHeight: "100vh", py: 4, bgcolor: theme.palette.grey[50] }}>
        <Container maxWidth="sm">
          <Typography>
            {meter?.type} Meter - {meter?.number}
          </Typography>
          <Divider />
          <DialogContent sx={{ p: 2 }}>
            <Container
              sx={{
                borderRadius: 1,
                display: "flex",
                flexDirection: "column",
                rowGap: 1,
                bgcolor: "#fff",
                color: "secondary.contrastText",
                marginY: 2,
              }}
            >
              <Typography color="primary" paragraph>
                Meter Details
              </Typography>

              <CheckOutItem
                title="IMES Meter No."
                value={viewMeter?.details?.number}
              />

              <CheckOutItem title="Name" value={viewMeter?.details?.name} />
              <CheckOutItem
                title="Type"
                value={`${viewMeter?.details?.type} (IMES)`}
              />
            </Container>

            {showFields && (
              <AnimatedContainer delay={0.1}>
                <Container>
                  <ul style={{ paddingBlock: "8px" }}>
                    <li>
                      <Typography variant="caption" color="error">
                        NOTE: Please ensure you have sufficient balance in your
                        account before proceeding with the transaction. Be
                        informed that there is a
                      </Typography>
                    </li>
                    <li>
                      {" "}
                      <Typography variant="caption">
                        <b> fee of GHS 2.00 </b> for transaction from{" "}
                        <b>GHS 50.00 - GHS 99.00</b> and
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="caption" color="error">
                        <b>2% fee</b> for transaction from{" "}
                        <b>GHS 100 and above.</b>
                      </Typography>
                    </li>
                  </ul>
                </Container>
                <Formik
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  enableReinitialize={true}
                  validationSchema={prepaidNonUserPaymentValidationSchema(
                    paymentMethod === "momo",
                  )}
                >
                  {({
                    isSubmitting,
                    errors,
                    touched,

                    handleSubmit,
                  }) => {
                    return (
                      <Stack rowGap={2} paddingY={2}>
                        <TextField
                          size="small"
                          label="Enter Amount"
                          placeholder="Enter Amount here"
                          type="number"
                          inputMode="decimal"
                          fullWidth
                          value={amount}
                          onChange={(e) => setAmount(e.target.valueAsNumber)}
                          error={Boolean(touched.amount && errors.amount)}
                          helperText={touched.amount && errors.amount}
                          required
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                GH¢
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">p</InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          size="small"
                          label="Email Address(optional)"
                          placeholder="Enter email here"
                          type="email"
                          inputMode="email"
                          fullWidth
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
                            confirmPhonenumberHelperText:
                              errors.confirmPhonenumber,
                          }}
                          walletDetails={{
                            token,
                            setToken,
                            tokenErr:
                              Boolean(touched.token && errors.token) || err,
                            tokenHelperText: errors.token || err,
                          }}
                        />

                        <LoadingButton
                          variant="contained"
                          onClick={handleSubmit}
                          fullWidth
                          loading={isLoading || isSubmitting}
                          sx={{
                            py: 1.2,
                            borderRadius: 2,
                            boxShadow: "none",
                            transition: theme.transitions.create([
                              "background-color",
                              "box-shadow",
                              "transform",
                            ]),
                            "&:hover": {
                              boxShadow: theme.shadows[4],
                              transform: "scale(1.02)",
                            },
                          }}
                        >
                          {isLoading || isSubmitting ? "Please Wait..." : "Top up"}
                        </LoadingButton>
                      </Stack>
                    );
                  }}
                </Formik>
              </AnimatedContainer>
            )}
          </DialogContent>
          <Divider />
          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button variant="contained" onClick={handleBuyCredit}>
              Buy Prepaid
            </Button>

            <Button
              color="error"
              variant="outlined"
              onClick={handleRemoveMeter}
            >
              Remove Meter
            </Button>
          </DialogActions>
        </Container>
      </Box>
      {/* <ServiceNotAvaialble open={openNotAvailable} /> */}
    </>
  );
}

export default ViewMeter;
