import { useMemo, useState } from "react";
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
import { currencyFormatter } from "@/constants";
import { universityValidationSchema } from "@/config/validationSchema";
import CustomWrapper from "@/components/custom/CustomWrapper";
import { useGetCategoryByType } from "@/hooks/useGetCategoryByType";
import { LoadingButton } from "@mui/lab";
import { useNavigate, useLocation } from "react-router-dom";

function SecurityService() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [categoryType, setCategoryType] = useState({
    id: "",
    name: "",
    price: 0,
  });
  const [quantity, setQuantity] = useState(0);

  ///Get All waec categories
  const { categories, loading } = useGetCategoryByType("security");

  //Calculate total amount
  const grandTotal = useMemo(() => {
    const total = Number(categoryType?.price || 0) * Number(quantity);
    return total;
  }, [categoryType, quantity]);

  const initialValues = {
    type: "security",
    categoryType,
    quantity,
    totalAmount: grandTotal,
  };

  const onSubmit = (values) => {
    const paymentInfo = {
      category: values?.type,
      categoryId: values?.categoryType?.id,
      voucherName: values?.categoryType?.name,
      price: values?.categoryType?.price,
      quantity: Number(values?.quantity),
      totalAmount: values.totalAmount,
    };

    navigate(`/evoucher/voucher-payment`, {
      state: {
        data: paymentInfo,
        path: pathname,
      },
      replace: true,
    });
  };

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
          validationSchema={universityValidationSchema}
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
                maxWidth="sm"
              >
                <Grid container spacing={3} py={2}>
                  <Grid item xs={12} sm={12}>
                    <Stack spacing={3}>
                      <Typography
                        width="100%"
                        paragraph
                  color="secondary"
                  bgcolor="whitesmoke"
                        p={1.2}
                      >
                        Select Form Type
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
                            ? option.name || ""
                            : `${option.name} -${currencyFormatter(
                                option?.price,
                              )}` || "";
                        }}
                        renderInput={(params) => {
                          return (
                            <Tooltip
                              title={currencyFormatter(categoryType.price)}
                            >
                              <TextField
                                {...params}
                                label="Security Form"
                                size="small"
                                error={Boolean(
                                  touched?.categoryType?.name &&
                                  errors?.categoryType?.name,
                                )}
                                helperText={
                                  touched?.categoryType?.name &&
                                  errors?.categoryType?.name
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
                        fullWidth
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
                  {/* <Grid item xs={12} sm={12}>
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
                        inputMode="text"
                        fullWidth
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        error={Boolean(touched.fullName && errors.fullName)}
                        helperText={touched.fullName && errors.fullName}
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
                        fullWidth
                      />
                    </Stack>
                  </Grid> */}
                </Grid>

                <div style={{ display: "flex" }}>
                  <LoadingButton
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
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
