import { useState, useContext } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

import Autocomplete from "@mui/material/Autocomplete";
import DOMPurify from "dompurify";
import { Formik } from "formik";
//components

import { currencyFormatter, IMAGES } from "../../constants";
import { CustomContext } from "../../context/providers/CustomProvider";
import { useGetCategoryByType } from "../../hooks/useGetCategoryByType";
import { waecValidationSchema } from "../../config/validationSchema";
import CustomWrapper from "../../components/custom/CustomWrapper";
import { Helmet } from "react-helmet-async";
import { Container, Typography } from "@mui/material";
import { AuthContext } from "../../context/providers/AuthProvider";
import PaymentOption from "../../components/PaymentOption";
import { useNavigate } from "react-router-dom";

function WAECChecker() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [pricingType, setPricingType] = useState({
    id: "",
    type: "",
    price: 0,
  });
  const [pricingList, setPricingList] = useState([]);
  const [categoryType, setCategoryType] = useState({
    id: "",
    voucherType: "",
    price: 0,
    image: "",
  });

  const [mobilePartner, setMobilePartner] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  ///Get All waec categories
  const { categories, loading, fetching } = useGetCategoryByType("waec");

  ///Service Provider Info
  // const getServiceProviderInfo = useMemo(() => {
  //   return getCode(phoneNumber);
  // }, [phoneNumber]);

  const initialValues = {
    category: "waec",
    categoryType,
    pricingType,
    email,
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
    paymentMethod,
  };

  const onSubmit = (values) => {
    const paymentInfo = {
      category: values?.category,
      categoryId: values?.categoryType?.id,
      voucherType: values?.categoryType?.voucherType,
      price: values?.categoryType?.details?.price,
      quantity: Number(values?.pricingType.type),
      totalAmount: values?.pricingType.price,
      user: {
        name: user?.name?.split(" ")[0] || "GPC",
        email: DOMPurify.sanitize(email),
        phoneNumber: DOMPurify.sanitize(phoneNumber) || user?.phonenumber,
        provider: values?.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };
    

    customDispatch({
      type: "getVoucherPaymentDetails",
      payload: { data: paymentInfo },
      // payload: { open: true, data: paymentInfo },
    });

    navigate(`/evoucher/voucher-payment`, {
      replace: true,
    });
  };

  // if (loading) {
  //   return <PayLoading />;
  // }

  return (
    <>
      <Helmet>
        <title>WAEC & School Placement Checkers | Gab Powerful Consult</title>
        <meta
          name="description"
          content="Buy WAEC and School Placement Checkers with ease and just a single click."
        />

        <link
          rel="canonical"
          href="https://www.gpcpins.com/evoucher/waec-checker"
        />
      </Helmet>
      <CustomWrapper img={IMAGES.main} title="WAEC CHECKERS" item=" WAEC">
        <Formik
          initialValues={initialValues}
          validationSchema={waecValidationSchema(paymentMethod === "momo")}
          enableReinitialize={true}
          onSubmit={onSubmit}
        >
          {({ errors, touched, handleSubmit }) => {
            return (
              <Container
                maxWidth="xs"
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#fff",
                  gap: 2,
                  borderRadius: 2,
                  // boxShadow: '20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff',
                }}
              >
                <Typography
                  width="100%"
                  paragraph
                  color="#fff"
                  bgcolor="secondary.main"
                  p={1}
                >
                  Choose Checker Type
                </Typography>
                <Autocomplete
                  loading={loading || fetching}
                  loadingText="Loading Vouchers...."
                  options={categories}
                  limitTags={3}
                  fullWidth
                  size="small"
                  disableClearable
                  clearText=" "
                  value={categoryType}
                  onChange={(e, value) => {
                    setPricingType({
                      id: "",
                      type: "",
                      price: "",
                    });
                    setCategoryType(value);
                    setPricingList(value?.pricing);
                  }}
                  noOptionsText="No Voucher available"
                  isOptionEqualToValue={(option, value) =>
                    value.id === undefined ||
                    value.id === "" ||
                    option.id === value.id
                  }
                  getOptionLabel={(option) => option.voucherType || ""}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        label="Select Checker"
                        size="small"
                        error={Boolean(
                          touched?.categoryType?.voucherType &&
                            errors?.categoryType?.voucherType
                        )}
                        helperText={
                          touched?.categoryType?.voucherType &&
                          errors?.categoryType?.voucherType
                        }
                      />
                    );
                  }}
                />

                <Autocomplete
                  options={pricingList}
                  size="small"
                  fullWidth
                  disableClearable
                  clearText=" "
                  value={pricingType}
                  onChange={(e, value) => setPricingType(value)}
                  noOptionsText="No Pricing available"
                  isOptionEqualToValue={(option, value) =>
                    value?.id === undefined ||
                    value?.id === "" ||
                    option?.id === value?.id
                  }
                  getOptionLabel={(option) =>
                    option?.id
                      ? `${option?.type} checker(s) for ${currencyFormatter(
                          option?.price
                        )}`
                      : "" || ""
                  }
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        label="Quantity"
                        size="small"
                        error={Boolean(
                          touched?.pricingType?.type &&
                            errors?.pricingType?.type
                        )}
                        helperText={
                          touched?.pricingType?.type &&
                          errors?.pricingType?.type
                        }
                      />
                    );
                  }}
                />

                <TextField
                  size="small"
                  type="email"
                  inputMode="email"
                  variant="outlined"
                  label="Email Address(optional)"
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

                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSubmit}
                  fullWidth
                >
                  Buy
                </Button>
              </Container>
            );
          }}
        </Formik>
      </CustomWrapper>
    </>
  );
}

export default WAECChecker;
