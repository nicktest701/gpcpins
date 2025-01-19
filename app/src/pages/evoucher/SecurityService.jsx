import { useMemo, useState, useContext } from "react";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import { Formik } from "formik";
import { Helmet } from "react-helmet-async";
import { currencyFormatter } from "../../constants";
import { CustomContext } from "../../context/providers/CustomProvider";
import { universityValidationSchema } from "../../config/validationSchema";
import CustomWrapper from "../../components/custom/CustomWrapper";
import { useGetCategoryByType } from "../../hooks/useGetCategoryByType";
import { AuthContext } from "../../context/providers/AuthProvider";
import PayLoading from "../../components/PayLoading";
import { LoadingButton } from "@mui/lab";
import DOMPurify from "dompurify";
// import MobilePartner from "../../components/MobilePartner";
import PaymentOption from "../../components/PaymentOption";

function SecurityService() {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);

  const [categoryType, setCategoryType] = useState({
    id: "",
    voucherType: "",
    price: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("");
  const [mobilePartner, setMobilePartner] = useState("");
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhonenumber, setConfirmPhonenumber] = useState("");
  ///Get All waec categories
  const { categories, loading } = useGetCategoryByType("security");

  ///Service Provider Info
  // const getServiceProviderInfo = useMemo(() => {
  //   return getCode(phoneNumber);
  // }, [phoneNumber]);

  //Calculate total amount
  const grandTotal = useMemo(() => {
    const total = Number(categoryType?.price || 0) * Number(quantity);
    return total;
  }, [categoryType, quantity]);

  const initialValues = {
    category: "security",
    categoryType,
    quantity,
    totalAmount: grandTotal,
    fullName,
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
      price: values?.categoryType?.price,
      quantity: Number(values?.quantity),
      totalAmount: values.totalAmount,
      user: {
        name: DOMPurify.sanitize(values.fullName),
        email: DOMPurify.sanitize(email),
        phoneNumber: DOMPurify.sanitize(phoneNumber)||user?.phonenumber,
        provider: values?.mobilePartner,
      },
      isWallet: paymentMethod === "wallet",
    };

    customDispatch({
      type: "getVoucherPaymentDetails",
      payload: { open: true, data: paymentInfo },
    });
  };

  if (loading) {
    return <PayLoading />;
  }

  // if (isError) {
  //   showBoundary(error);
  // }
  return (
    <>
      <Helmet>
        <title>Security Service Forms | Gab Powerful Consult</title>
        <meta
          name="description"
          content="Step in a rewarding career in security with our comprehensive application forms."
        />
        <link
          rel="canonical"
          href="https://gpcpins.com/evoucher/security-service"
        />
      </Helmet>
      <CustomWrapper
        img={null}
        title="SECURITY SERVICE"
        item="Security Service"
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
                <Grid container spacing={3} py={3}>
                  <Grid item xs={12} sm={12}>
                    <Stack spacing={3}>
                      <Typography
                        paragraph
                        color="#fff"
                        bgcolor="secondary.main"
                        p={1}
                      >
                        Forms Details
                      </Typography>

                      <Autocomplete
                        options={categories}
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
                            : `${option.voucherType} -${currencyFormatter(
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
                                label="Select Security Form"
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
                      {/* <MobilePartner
                        value={mobilePartner}
                        setValue={setMobilePartner}
                        error={Boolean(
                          touched.mobilePartner && errors.mobilePartner
                        )}
                        helperText={
                          touched.mobilePartner && errors.mobilePartner
                        }
                      />
                      <TextField
                        size='small'
                        type='tel'
                        inputMode='tel'
                        label='Mobile Money Number'
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        error={Boolean(
                          touched.phoneNumber && errors.phoneNumber
                        )}
                        helperText={touched.phoneNumber && errors.phoneNumber}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position='start'>
                              <Avatar
                                variant='square'
                                src={getServiceProviderInfo?.image}
                                sx={{ width: 25, height: 20, marginRight: 1 }}
                              />
                            </InputAdornment>
                          ),
                        }}
                      /> */}
                    </Stack>
                  </Grid>
                </Grid>

                <div style={{ display: "flex" }}>
                  <LoadingButton
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{ marginInline: "auto", width: "100%", maxWidth: 300 }}
                  >
                    Proceed to Buy
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

export default SecurityService;
