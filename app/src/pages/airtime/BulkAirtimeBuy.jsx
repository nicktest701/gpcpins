import { useContext, useEffect, useState } from "react";
import {
  Container,
  TextField,
  Typography,
  Stack,
  InputAdornment,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Formik } from "formik";
import _ from "lodash";
// import MobilePartner from "../../components/MobilePartner";
import { AuthContext } from "../../context/providers/AuthProvider";
import Back from "../../components/Back";
import { useQueryClient } from "@tanstack/react-query";
import { currencyFormatter } from "../../constants";
import { useSearchParams, Navigate } from "react-router-dom";
import { bulkAirtimeValidationSchema } from "../../config/validationSchema";
import VoucherPlaceHolderItem from "../../components/items/VoucherPlaceHolderItem";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import PaymentOption from "../../components/PaymentOption";
import { generateRandomCode } from "../../config/generateRandomCode";

function BulkAirtimeBuy() {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pricingList, setPricingList] = useState([]);
  const { user } = useContext(AuthContext);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [email, setEmail] = useState(user?.email);
  const [mobilePartner, setMobilePartner] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");

  const pricingInfo = searchParams.get("info");
  const initialValues = {
    recipient: searchParams.get("recipient"),
    email,
    amount: sessionStorage.getItem("value-x"),
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
    paymentMethod,
    pricing: pricingList,
  };

  useEffect(() => {
    if (pricingInfo !== null) {
      setPricingList(JSON.parse(pricingInfo));
    }
  }, [pricingInfo]);

  const onSubmit = (values) => {
    if (values.paymentMethod === "wallet") {
      const walletBalance = queryClient.getQueryData(
        ["wallet-balance", user?.id],
        {
          exact: true,
        }
      );

      if (Number(walletBalance) < Number(values.amount)) {
        customDispatch(
          globalAlertType(
            "error",
            "Insufficient Wallet Balance.Please request for a top up."
          )
        );
        return;
      }
    }
    sessionStorage.setItem("value-x", values.amount);

    setSearchParams((params) => {
      params.set("a9ac1", generateRandomCode(200));
      params.set("phonenumber", values.phoneNumber || user?.phonenumber);
      params.set("provider", values.mobilePartner);
      params.set("email", values.email || user?.email);
      params.set("bulk", true);
      params.set("amount", values.amount);

      params.set(
        "preload",
        paymentMethod === "wallet"
          ? "3e6810ec81036d2f7088231351b3097b"
          : "4d33dd9000bcb39a9ac1f2b5d094b61e"
      );

      params.set("open-preview", true);

      return params;
    });
  };

  if (
    pricingInfo === null ||
    Number(sessionStorage.getItem("value-x")) !==
      Number(_.sumBy(JSON.parse(pricingInfo), "price"))
  ) {
    return (
      <Navigate to="/airtime?link=c458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a" />
    );
  }

  return (
    <Container sx={{ minHeight: "50svh", py: 4 }}>
      <Back />

      <Typography variant="h4"> PAYMENT INFORMATION</Typography>
      <Typography variant="body2">
        Verify your payment details to complete the transaction.
      </Typography>

      <Container
        maxWidth="sm"
        sx={{
          py: 4,
          mt: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#fff",
          gap: 2,
          boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
          borderRadius: 2,
        }}
      >
        <Stack bgcolor="secondary.main" color="#fff" width="100%" p={2} mb={4}>
          <div
            style={{
              paddingBlock: "16px",
              borderBottom: "1px solid lightgray",
            }}
          >
            <Typography variant="caption" color="primary">
              Recipients
            </Typography>
            {pricingList.map((item) => {
              return (
                <VoucherPlaceHolderItem
                  key={item?.id}
                  title={`${item?.type} (${item?.recipient})`}
                  value={currencyFormatter(item?.price)}
                />
              );
            })}
          </div>
        </Stack>
        <Formik
          initialValues={initialValues}
          validationSchema={bulkAirtimeValidationSchema(
            paymentMethod === "momo"
          )}
          enableReinitialize={true}
          onSubmit={onSubmit}
        >
          {({ errors, touched, handleSubmit }) => {
            return (
              <>
                <TextField
                  variant="filled"
                  type="number"
                  inputMode="numeric"
                  placeholder="Total Amount"
                  label="Total Amount"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">GH¢</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">p</InputAdornment>
                    ),
                    readOnly: true,
                    style: { fontWeight: "bold", fontSize: "2.5em" },
                  }}
                  value={sessionStorage.getItem("value-x")}
                  error={Boolean(touched.amount && errors.amount)}
                  helperText={touched.amount && errors.amount}
                />

                <TextField
                  // size=''
                  fullWidth
                  type="email"
                  variant="outlined"
                  label="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(touched.email && errors.email)}
                  helperText={touched.email && errors.email}
                />
                <PaymentOption
                  showWallet={user?.id}
                  showMomo
                  setPaymentMethod={setPaymentMethod}
                  error={Boolean(touched.paymentMethod && errors.paymentMethod)}
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
                  size="large"
                  variant="contained"
                  onClick={handleSubmit}
                  fullWidth
                >
                  Confirm Details
                </LoadingButton>
              </>
            );
          }}
        </Formik>
      </Container>
    </Container>
  );
}

export default BulkAirtimeBuy;
