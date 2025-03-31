import { LoadingButton } from "@mui/lab";
import { Box, Container, TextField, Typography, MenuItem } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../../constants";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
// import ServiceNotAvaialble from "../ServiceNotAvaialble";
// import { serviceAvailable } from "../../config/serviceAvailable";
import { Formik } from "formik";
import DOMPurify from "dompurify";
import { prepaidMeterValidationSchema } from "../../config/validationSchema";

function Prepaid() {
  const navigate = useNavigate();

  const initialValues = {
    number: "",
    confirmNumber: "",
    name: "",
    district: "ASHANTI REGION",
    type: "IMES",
  };

  const onSubmit = (values) => {
    const meterInfo = {
      number: DOMPurify.sanitize(values?.number?.toUpperCase()),
      name: DOMPurify.sanitize(values?.name?.toUpperCase()),
      district: DOMPurify.sanitize(values?.district?.toUpperCase()),
      type: values?.type?.toUpperCase(),
    };

    sessionStorage.setItem("meter", JSON.stringify(meterInfo));
    sessionStorage.setItem("meter-location", values.district);
    navigate(
      `verify/${values.number.toUpperCase()}/${values.name?.toUpperCase()}`
    );
  };

  return (
    <Container
      sx={{
        textAlign: "center",
        paddingY: 2,
        backgroundColor: "#fff",
        // width: "95%",
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.7)),url(${IMAGES.ecg}) no-repeat `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: { xs: 60, md: 100 },
          display: "grid",
          placeItems: "center",
        }}
      >
        <Typography variant="h4" color="#fff">
          Prepaid Units
        </Typography>
      </Box>
      <Container sx={{ paddingY: 10 }}>
        <AnimatedContainer>
          <Typography variant="h5" color="secondary" paragraph>
            Buy Your Prepaid Units Online
          </Typography>
          <Typography variant="body2" paragraph>
            We&lsquo;ve simplified things for easy & quick buying of your home
            and office prepaid units.
          </Typography>
        </AnimatedContainer>
        <AnimatedContainer delay={0.3}>
          <Container
            maxWidth="sm"
            sx={{
              // background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
              backgroundColor: "#fff",
              boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              gap: 2,
              p: 2,
              mt: 4,
            }}
          >
            <Typography variant="h5" color="error" fontStyle="italic">
              Please Note!!!
            </Typography>
            <Typography
              variant="caption"
              sx={{ placeSelf: "self-start" }}
              paragraph
            >
              Our prepaid electricity units are exclusively available to
              residents with <b>IMES</b> meter type. Please ensure your location
              eligibility before proceeding with any purchases. Thank you for
              your cooperation.
            </Typography>
            {/* within <b>MENHYIA NORTH AND SOUTH (ASHANTI)</b> */}
            <Formik
              initialValues={initialValues}
              onSubmit={onSubmit}
              // enableReinitialize={true}
              validationSchema={prepaidMeterValidationSchema}
            >
              {({
                isSubmitting,
                errors,
                touched,
                handleSubmit,
                getFieldProps,
              }) => {
                return (
                  <>
                    <TextField
                      id="number"
                      name="number"
                      label="IMES Meter ID"
                      placeholder="e.g.Q788798766"
                      fullWidth
                      {...getFieldProps("number")}
                      error={Boolean(touched.number && errors.number)}
                      helperText={touched.number && errors.number}
                      inputProps={{
                        style: { textTransform: "uppercase" },
                      }}
                    />
                    <TextField
                      id="confirmNumber"
                      name="confirmNumber"
                      label="Confirm Meter ID"
                      placeholder="e.g.Q788798766"
                      fullWidth
                      {...getFieldProps("confirmNumber")}
                      error={Boolean(
                        touched.confirmNumber && errors.confirmNumber
                      )}
                      helperText={touched.confirmNumber && errors.confirmNumber}
                      inputProps={{
                        style: { textTransform: "uppercase" },
                      }}
                    />
                    <TextField
                      id="name"
                      name="name"
                      label="Meter Name"
                      placeholder="Enter Meter Name here"
                      fullWidth
                      {...getFieldProps("name")}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                    <TextField
                      id="type"
                      name="type"
                      select
                      label="Prepaid Meter Type"
                      placeholder="Select Meter Type"
                      fullWidth
                      {...getFieldProps("type")}
                      error={Boolean(touched.type && errors.type)}
                      helperText={touched.type && errors.type}
                    >
                      <MenuItem value="IMES">IMES</MenuItem>
                    </TextField>

                    <TextField
                      id="location"
                      name="location"
                      select
                      label="Meter Location"
                      placeholder="Select Meter Location"
                      fullWidth
                      {...getFieldProps("district")}
                      error={Boolean(touched.district && errors.district)}
                      helperText={touched.district && errors.district}
                    >
                      {/* <MenuItem value="MENHYIA NORTH,ASHANTI">
                        MENHYIA NORTH,ASHANTI
                      </MenuItem>
                      <MenuItem value="MENHYIA SOUTH,ASHANTI">
                        MENHYIA SOUTH,ASHANTI
                      </MenuItem> */}
                      <MenuItem value="ASHANTI REGION">ASHANTI REGION</MenuItem>
                    </TextField>

                    <LoadingButton
                      loading={isSubmitting}
                      variant="contained"
                      fullWidth
                      onClick={handleSubmit}
                      sx={{ my: 2, py: 2 }}
                    >
                      Verify
                    </LoadingButton>
                  </>
                );
              }}
            </Formik>
          </Container>
        </AnimatedContainer>
      </Container>

      {/* <ServiceNotAvaialble open={serviceAvailable()} /> */}
    </Container>
  );
}

export default Prepaid;
