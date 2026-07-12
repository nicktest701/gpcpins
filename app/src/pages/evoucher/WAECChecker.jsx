import { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { Formik } from "formik";
//components

import { currencyFormatter, IMAGES } from "@/constants";
import { useGetCategoryByType } from "@/hooks/useGetCategoryByType";
import { waecValidationSchema } from "@/config/validationSchema";
import CustomWrapper from "@/components/custom/CustomWrapper";
import { Helmet } from "react-helmet-async";
import { Container, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

function WAECChecker() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pricingType, setPricingType] = useState({
    id: "",
    type: "",
    price: 0,
  });
  const [pricingList, setPricingList] = useState([]);
  const [categoryType, setCategoryType] = useState({
    id: "",
    name: "",
    price: 0,
    image: "",
    year: "",
  });

  ///Get All waec categories
  const { categories, loading, fetching } = useGetCategoryByType("waec");

  const initialValues = {
    type: "waec",
    categoryType,
    pricingType,
  };
  // console.log(categories)

  const onSubmit = (values) => {
    const paymentInfo = {
      category: values?.type,
      categoryId: values?.categoryType?.id,
      voucherName: values?.categoryType?.name,
      price: values?.categoryType?.details?.price,
      quantity: Number(values?.pricingType.type),
      totalAmount: values?.pricingType.price,
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
      <CustomWrapper img={IMAGES.checker2} title="WAEC CHECKERS" item=" WAEC">
        <Formik
          initialValues={initialValues}
          validationSchema={waecValidationSchema}
          enableReinitialize={true}
          onSubmit={onSubmit}
        >
          {({ errors, touched, handleSubmit }) => {
            return (
              <Container
                maxWidth="sm"
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#fff",
                  gap: 2,
                  borderRadius: 2,
                  mt:{ xs: 2, md: 8 },
                }}
              >
                <Typography
                  width="100%"
                  paragraph
                  color="secondary"
                  bgcolor="whitesmoke"
                  p={1}
                  // borderRadius={1}
                >
                  Choose your preferred voucher / checker yype
                </Typography>
                <Autocomplete
                  loading={loading || fetching}
                  loadingText="Loading Vouchers...."
                  options={categories}
                  limitTags={3}
                  fullWidth
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
                  getOptionLabel={(option) =>
                    `${option?.name}${option?.year ? ` (${option.year})` : ""}` ||
                    "Select Type"
                  }
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        // size="small"
                        label="Voucher"
                        error={Boolean(
                          touched?.categoryType?.name &&
                          errors?.categoryType?.name,
                        )}
                        helperText={
                          touched?.categoryType?.name &&
                          errors?.categoryType?.name
                        }
                      />
                    );
                  }}
                />

                <Autocomplete
                  options={pricingList}
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
                          option?.price,
                        )}`
                      : "" || ""
                  }
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                          //  size="small"
                        label="Quantity"
                        error={Boolean(
                          touched?.pricingType?.type &&
                          errors?.pricingType?.type,
                        )}
                        helperText={
                          touched?.pricingType?.type &&
                          errors?.pricingType?.type
                        }
                      />
                    );
                  }}
                />

                <Button variant="contained" size='large' onClick={handleSubmit} fullWidth>
                  Proceed to buy
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
