import { useContext, useMemo, useState } from "react";
import {
  Container,
  TextField,
  Typography,
  Stack,
  Avatar,
  InputAdornment,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { Formik } from "formik";
import Back from "../../components/Back";
import { getCode } from "../../constants";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, Navigate } from "react-router-dom";
import {
  airtimeValidationSchema,
  bundleValidationSchema,
} from "../../config/validationSchema";
import BundleList from "./BundleList";
import { CustomContext } from "../../context/providers/CustomProvider";
import PaymentOption from "../../components/PaymentOption";
import { AuthContext } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { generateRandomCode } from "../../config/generateRandomCode";

function AirtimeBuy() {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mobilePartner, setMobilePartner] = useState("");
  const [phonenumber, setPhonenumber] = useState(user?.phonenumber);
  const [selectedBundle, setSelectedBundle] = useState({
    price: 0,
    plan_id: "",
    plan_name: "",
  });

  const initialValues = {
    recipient: searchParams.get("recipient"),
    amount,
    paymentMethod,
    phonenumber,
    mobilePartner,
  };

  const onSubmit = (values) => {
    const walletBalance = queryClient.getQueryData(
      ["wallet-balance", user?.id],
      {
        exact: true,
      }
    );

    if (
      Number(walletBalance) < Number(values.amount) ||
      Number(walletBalance) < Number(selectedBundle?.price)
    ) {
      customDispatch(
        globalAlertType(
          "error",
          "Insufficient Wallet Balance.Please request for a top up."
        )
      );
      return;
    }

    if (searchParams.get("type") === "Bundle") {
      sessionStorage.setItem("value-x", selectedBundle?.price);
    } else {
      sessionStorage.setItem("value-x", values.amount);
    }

    setSearchParams((params) => {
      params.set("WijWSJ", generateRandomCode(200));
      params.set("recipient", values.recipient);
      params.set("phonenumber", values.phonenumber);
      params.set("provider", values.mobilePartner);
      params.set(
        "amount",
        searchParams.get("type") === "Bundle"
          ? selectedBundle?.price
          : values.amount
      );
      params.set("preload", "3e6810ec81036d2f7088231351b3097b");
      params.set("open-preview", true);

      return params;
    });
  };

  ///Service Provider Info

  const getServiceProviderInfo = useMemo(() => {
    return getCode(searchParams.get("recipient"));
  }, [searchParams]);

  // console.log(Number(airtime_bundle_amount));
  // console.log(Number(searchParams.get("plan_price")));

  if (
    !searchParams.get("recipient") ||
    !["Airtime", "Bundle"].includes(searchParams.get("type"))
  ) {
    return (
      <Navigate to="/airtime?link=6b1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5" />
    );
  }

  return (
    <Container sx={{ minHeight: "50svh", py: 4 }}>
      <Back />

      <Typography variant="h4">TOP UP INFORMATION</Typography>
      {searchParams.get("type") === "Airtime" && (
        <Typography variant="body2" paragraph>
          NOTE: Mininum amount of airtime you can transfer is <b>GHS 1</b> and
          the maximum is <b>GHS 100.</b>
        </Typography>
      )}
      <Container
        maxWidth="xs"
        sx={{
          py: 4,
          mt: 4,
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
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="secondary.main"
          color="#fff"
          width="100%"
          p={2}
          mb={4}
        >
          <Avatar
            variant="square"
            src={getServiceProviderInfo.image}
            style={{
              objectFit: "contain",
              width: 60,
              height: 40,
            }}
          />
          <Stack alignItems="flex-end">
            {searchParams.get("type") === "Bundle" && (
              <Typography variant="caption" color="success.main">
                {`${selectedBundle?.plan_name}(${selectedBundle?.volume})`}
              </Typography>
            )}
            <Typography variant="body2">
              {searchParams.get("recipient")}
            </Typography>

            <Typography variant="body2" color="primary">
              Recipient Number
            </Typography>
          </Stack>
        </Stack>
        <Formik
          initialValues={initialValues}
          validationSchema={
            searchParams.get("type") === "Bundle"
              ? bundleValidationSchema
              : airtimeValidationSchema
          }
          enableReinitialize={true}
          onSubmit={onSubmit}
        >
          {({ errors, touched, handleSubmit }) => {
            return (
              <>
                {searchParams.get("type") === "Bundle" ? (
                  <TextField
                    variant="filled"
                    type="number"
                    inputMode="numeric"
                    placeholder="Amount"
                    label="Top Up Amount"
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
                    value={Number(selectedBundle?.price)}
                  />
                ) : (
                  <TextField
                    variant="filled"
                    type="number"
                    inputMode="numeric"
                    placeholder="Amount"
                    label="Top Up Amount"
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">GH¢</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">p</InputAdornment>
                      ),
                      style: { fontWeight: "bold", fontSize: "2.5em" },
                    }}
                    value={amount}
                    focused
                    onChange={(e) => setAmount(e.target.value)}
                    error={Boolean(touched.amount && errors.amount)}
                    helperText={touched.amount && errors.amount}
                  />
                )}

                <PaymentOption
                  showWallet
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
                    phonenumber,
                    setPhonenumber,
                    phonenumberErr: Boolean(
                      touched.phonenumber && errors.phonenumber
                    ),
                    phonenumberHelperText: errors.phonenumber,
                  }}
                />

                <LoadingButton
                  size="large"
                  variant="contained"
                  onClick={handleSubmit}
                  fullWidth
                  disabled={paymentMethod === ""}
                >
                  Confirm Details
                </LoadingButton>
              </>
            );
          }}
        </Formik>
      </Container>

      <BundleList
        selectedBundle={selectedBundle}
        setSelectedBundle={setSelectedBundle}
      />
    </Container>
  );
}

export default AirtimeBuy;
