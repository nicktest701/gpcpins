import {
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useContext, useState } from "react";
import { Formik } from "formik";
import { CustomContext } from "../../../context/providers/CustomProvider";
import CheckOutItem from "../../../components/items/CheckOutItem";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import Transition from "../../../components/Transition";
import { LoadingButton } from "@mui/lab";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteMeter } from "../../../api/meterAPI";
import { prepaidNonUserPaymentValidationSchema } from "../../../config/validationSchema";
import AnimatedContainer from "../../../components/animations/AnimatedContainer";
import { globalAlertType } from "../../../components/alert/alertType";
// import { AuthContext } from "../../../context/providers/AuthProvider";
import DOMPurify from "dompurify";
import PaymentOption from "../../../components/PaymentOption";
// import ServiceNotAvaialble from "../../ServiceNotAvaialble";
// import { serviceAvailable } from "../../../config/serviceAvailable";
import { isBetween50And99 } from "../../../config/validation";

function ViewMeter() {
  const queryClient = useQueryClient();
  // const { user } = useContext(AuthContext);
  const {
    customState: { viewMeter },
    customDispatch,
  } = useContext(CustomContext);
  const [showFields, setShowFields] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(0);
  const [mobilePartner, setMobilePartner] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  // const [openNotAvailable, setOpenNotAvailable] = useState(false);

  //initialState
  const initialValues = {
    amount,
    phoneNumber,
    confirmPhonenumber,
    email: email,
    _id: viewMeter?.details?._id,
    name: viewMeter?.details?.name,
    number: viewMeter?.details?.number,
    type: viewMeter?.details?.type,
    mobilePartner,
    paymentMethod,
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

  const onSubmit = (values, options) => {
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

    customDispatch({
      type: "openVerifyMeter",
      payload: {
        open: true,
        details: values,
      },
    });
    options.setSubmitting(false);
    options.resetForm();

    handleClose();
  };

  const handleBuyCredit = () => {
    setShowFields(!showFields);
    // if (serviceAvailable()) {
    //   setOpenNotAvailable(true);
    // } else {
    // }
  };

  //DELETE meter

  const { mutateAsync } = useMutation({
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

        mutateAsync(viewMeter?.details?._id, {
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
      <Dialog
        open={viewMeter.open}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Transition}
      >
        <CustomDialogTitle title="Meter Information" onClose={handleClose} />
        <Divider />
        <DialogContent sx={{ p: 2 }}>
          <Button
            variant="contained"
            sx={{  float: "right" }}
            onClick={handleBuyCredit}
          >
            Buy Prepaid
          </Button>

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
                  <Typography color="error">
                    NOTE: Please ensure you have sufficient balance in your
                    account before proceeding with the transaction.
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
              </Container>
              <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
                enableReinitialize={true}
                validationSchema={prepaidNonUserPaymentValidationSchema(
                  paymentMethod === "momo"
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
                        showWallet
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
                          confirmPhonenumberHelperText:
                            errors.confirmPhonenumber,
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
          <Button color="error" onClick={handleRemoveMeter}>
            Remove Meter
          </Button>
        </DialogActions>
      </Dialog>
      {/* <ServiceNotAvaialble open={openNotAvailable} /> */}
    </>
  );
}

export default ViewMeter;
