import { useMemo, useState, useContext } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import InputAdornment from "@mui/material/InputAdornment";
import LoadingButton from "@mui/lab/LoadingButton";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import Container from "@mui/material/Container";
import { Formik } from "formik";
import { IMAGES, currencyFormatter } from "../../constants";
import { CustomContext } from "../../context/providers/CustomProvider";
import { universityValidationSchema } from "../../config/validationSchema";
import CustomWrapper from "../../components/custom/CustomWrapper";
import { Helmet } from "react-helmet-async";
import { useGetCategoryByType } from "../../hooks/useGetCategoryByType";
import { AuthContext } from "../../context/providers/AuthProvider";
import PayLoading from "../../components/PayLoading";
import { Tooltip } from "@mui/material";
import DOMPurify from "dompurify";
import PaymentOption from "../../components/PaymentOption";
import { useNavigate } from "react-router-dom";

function UniversityForms() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);

  const [categoryType, setCategoryType] = useState({
    id: "",
    voucherType: "",
    price: 0,
  });
  const [mobilePartner, setMobilePartner] = useState("");
  const [fullName, setFullName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [email, setEmail] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  ///Get All waec categories
  const { categories, loading } = useGetCategoryByType("university");

  //Calculate total amount
  const grandTotal = useMemo(() => {
    const total = Number(categoryType?.price || 0) * Number(quantity);
    return total;
  }, [categoryType, quantity]);

  const initialValues = {
    category: "university",
    categoryType,
    quantity,
    totalAmount: grandTotal,
    fullName,
    email,
    paymentMethod,
    phoneNumber,
    confirmPhonenumber,
    mobilePartner,
  };

  const onSubmit = (values) => {
    const paymentInfo = {
      category: values?.category,
      categoryId: values?.categoryType?.id,
      voucherType: values?.categoryType?.voucherType,
      price: values?.categoryType?.price,
      quantity: Number(values?.quantity),
      totalAmount: values.totalAmount,
      user: {
        name: DOMPurify.sanitize(values.fullName),
        email: DOMPurify.sanitize(email),
        phoneNumber: DOMPurify.sanitize(phoneNumber) || user?.phonenumber,
        provider: values?.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    customDispatch({
      type: "getVoucherPaymentDetails",
      payload: { data: paymentInfo },
    });

    navigate(`/evoucher/voucher-payment`, {
      replace: true,
    });
  };


  return (
    <>
      <Helmet>
        <title>University Forms | Gab Powerful Consult</title>
        <meta
          name="description"
          content="Buy WAEC  and School Placement Checkers with ease and just a single click."
        />
        <link
          rel="canonical"
          href="https://www.gpcpins.com/evoucher/university-form"
        />
      </Helmet>

      <CustomWrapper
        img={IMAGES.bgImage4}
        title="UNIVERSITY FORM"
        item=" University"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={universityValidationSchema(
            paymentMethod === "momo"
          )}
          enableReinitialize={true}
          onSubmit={onSubmit}
        >
          {({ errors, values, touched, handleSubmit }) => {
            return (
              <Container
                sx={{
                  padding: 2,
                  bgcolor: "#fff",
                  borderRadius: 2,
                }}
                maxWidth="md"
              >
                <Grid container spacing={3} py={2}>
                  <Grid item xs={12} sm={12}>
                    <Stack spacing={3}>
                      <Typography
                        paragraph
                        color="#fff"
                        bgcolor="secondary.main"
                        p={1}
                      >
                        Choose Form Type
                      </Typography>

                      <Autocomplete
                        options={categories}
                        loading={loading}
                        loadingText="Loading Forms.Please Wait.."
                        size="small"
                        disableClearable
                        clearText=" "
                        value={categoryType}
                        onChange={(e, value) => setCategoryType(value)}
                        noOptionsText="No Voucher available"
                        isOptionEqualToValue={(option, value) =>
                          value.id === undefined ||
                          value.id === "" ||
                          option.id === value.id
                        }
                        getOptionLabel={(option) => {
                          return !option.id
                            ? option.voucherType || ""
                            : `${option.voucherType} - ${currencyFormatter(
                                option?.price
                              )}` || "";
                        }}
                        renderInput={(params) => {
                          return (
                            <Tooltip
                              title={currencyFormatter(categoryType.price)}
                            >
                              <TextField
                                {...params}
                                label="Select University,Nursing,Polytechnic.."
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
                            </Tooltip>
                          );
                        }}
                      />

                      <TextField
                        size="small"
                        type="number"
                        inputMode="numeric"
                        label="Quantity"
                        required
                        fullWidth
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        error={Boolean(touched.quantity && errors.quantity)}
                        helperText={touched.quantity && errors.quantity}
                      />
                      <TextField
                        size="small"
                        placeholder="Total Amount"
                        label="Total Amount"
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
                          readOnly: true,
                        }}
                        value={values.totalAmount}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Stack spacing={3}>
                      <Typography
                        paragraph
                        color="#fff"
                        bgcolor="secondary.main"
                        p={1}
                      >
                        Personal Details
                      </Typography>

                      <TextField
                        size="small"
                        placeholder="Enter your Name"
                        label="Full Name"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        error={Boolean(touched.fullName && errors.fullName)}
                        helperText={touched.fullName && errors.fullName}
                      />

                      <TextField
                        size="small"
                        type="email"
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
                          confirmPhonenumberHelperText:
                            errors.confirmPhonenumber,
                        }}
                      />
                    </Stack>
                  </Grid>
                </Grid>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <LoadingButton
                    variant="contained"
                    // fullWidth
                    onClick={handleSubmit}
                    sx={{ marginInline: "auto", width: "100%", maxWidth: 300 }}
                  >
                    Proceed to buy
                  </LoadingButton>
                </div>
              </Container>
            );
          }}
        </Formik>
      </CustomWrapper>
    </>
  );
}

export default UniversityForms;
