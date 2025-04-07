import {
  Paper,
  Stack,
  TextField,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { Formik } from "formik";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { LoadingButton } from "@mui/lab";
import { useContext } from "react";
import CustomDatePicker from "../../../../admin/src/components/inputs/CustomDatePicker";
import moment from "moment";
import { useState } from "react";
import { agentRegistrationValidationSchema } from "../../config/validationSchema";
import { createNewAgent } from "../../api/userAPI";

function Distributor() {
  const { customDispatch } = useContext(CustomContext);
  const [dob, setDob] = useState(moment());

  const initialValues = {
    firstname: "",
    lastname: "",
    dob,
    nid: "",
    residence: "",
    email: "",
    phonenumber: "",
    business_name: "",
    business_location: "",
    business_description: "",
    business_email: "",
    business_phonenumber: "",
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: createNewAgent,
  });
  const onSubmit = (values, options) => {
    values.dob = dob;

    mutateAsync(values, {
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        options.resetForm();
      },
      onError: () => {
        customDispatch(globalAlertType("error", "An error has occurred!"));
      },
    });
  };

  return (
    <Box>
      <Typography variant="body2" textAlign="right" paragraph>
        Already have an account?{" "}
        <a target="_blank" href="https://agent.gpcpins.com" rel="noreferrer">
          Login here
        </a>
      </Typography>

      <Typography paragraph variant="h3">
       Freelance Agent Registration Form
      </Typography>
      <Divider />
      <Box sx={{ pt: 4 }}>
        <Paper>
          <Formik
            initialValues={initialValues}
            validationSchema={agentRegistrationValidationSchema}
            onSubmit={onSubmit}
          >
            {({
              errors,
              values,
              touched,

              handleChange,
              handleSubmit,
            }) => {
              return (
                <>
                  <Stack spacing={2} paddingY={2}>
                    <Typography
                      paragraph
                      color="#fff"
                      bgcolor="secondary.main"
                      p={1}
                    >
                      Fill out the form below{" "}
                    </Typography>
                    <CustomFormControl>
                      <TextField
                        // variant="filled"
                        label="First Name"
                        fullWidth
                        required
                        value={values.firstname}
                        onChange={handleChange("firstname")}
                        error={Boolean(touched.firstname && errors.firstname)}
                        helperText={touched.firstname && errors.firstname}
                      />

                      <TextField
                        // variant="filled"
                        label="Last Name"
                        fullWidth
                        required
                        value={values.lastname}
                        onChange={handleChange("lastname")}
                        error={Boolean(touched.lastname && errors.lastname)}
                        helperText={touched.lastname && errors.lastname}
                      />
                    </CustomFormControl>
                    <CustomFormControl>
                      <CustomDatePicker
                        label="Date Of Birth"
                        value={dob}
                        setValue={setDob}
                        error={Boolean(touched.date && errors.date)}
                        helperText={touched.date && errors.date}
                        minDate={moment("1900-01-01")}
                        disableFuture={true}
                        size="medium"
                        format='Do MMMM YYYY'
                      />
                      <TextField
                        // variant="filled"
                        type="tel"
                        inputMode="tel"
                        label="Telephone No."
                        fullWidth
                        required
                        value={values.phonenumber}
                        onChange={handleChange("phonenumber")}
                        error={Boolean(
                          touched.phonenumber && errors.phonenumber
                        )}
                        helperText={touched.phonenumber && errors.phonenumber}
                      />
                    </CustomFormControl>

                    <TextField
                      //   variant="filled"
                      label="Residential Address"
                      required
                      fullWidth
                      value={values.residence}
                      onChange={handleChange("residence")}
                      error={Boolean(touched.residence && errors.residence)}
                      helperText={touched.residence && errors.residence}
                      multiline
                      sx={{ bgcolor: "#fff" }}
                    />
                    <TextField
                      //   variant="filled"
                      label="Email Address"
                      type="email"
                      inputMode="email"
                      fullWidth
                      required
                      value={values.email}
                      onChange={handleChange("email")}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />

                    <TextField
                      //   variant="filled"
                      label="National ID / Voter's ID Number"
                      required
                      fullWidth
                      value={values.nid}
                      onChange={handleChange("nid")}
                      error={Boolean(touched.nid && errors.nid)}
                      helperText={touched.nid && errors.nid}
                      // helperText={
                      //   touched.nid && errors.nid ? (
                      //     errors.nid
                      //   ) : (
                      //     <ul style={{ display: "flex", gap: "4rem" }}>
                      //       <li>National ID</li>
                      //       <li>Voter&apos;s ID</li>
                      //     </ul>
                      //   )
                      // }
                    />

                    <TextField
                      //   variant="filled"
                      label="Business Name"
                      required
                      fullWidth
                      value={values.business_name}
                      onChange={handleChange("business_name")}
                      error={Boolean(
                        touched.business_name && errors.business_name
                      )}
                      helperText={touched.business_name && errors.business_name}
                    />
                    <TextField
                      //   variant="filled"
                      required
                      label="Location"
                      fullWidth
                      value={values.business_location}
                      onChange={handleChange("business_location")}
                      error={Boolean(
                        touched.business_location && errors.business_location
                      )}
                      helperText={
                        touched.business_location && errors.business_location
                      }
                    />

                    <TextField
                      //   variant="filled"
                      label="A short description about your business"
                      fullWidth
                      value={values.business_description}
                      onChange={handleChange("business_description")}
                      error={Boolean(
                        touched.business_description &&
                          errors.business_description
                      )}
                      helperText={
                        touched.business_description &&
                        errors.business_description
                      }
                      multiline
                      rows={5}
                      sx={{ bgcolor: "#fff" }}
                    />
                    <CustomFormControl>
                      <TextField
                        label="Business Email Address"
                        fullWidth
                        value={values.business_email}
                        onChange={handleChange("business_email")}
                        error={Boolean(
                          touched.business_email && errors.business_email
                        )}
                        helperText={
                          touched.business_email && errors.business_email
                        }
                      />
                      <TextField
                        type="tel"
                        inputMode="tel"
                        label="Business Telephone No."
                        fullWidth
                        value={values.business_phonenumber}
                        onChange={handleChange("business_phonenumber")}
                        error={Boolean(
                          touched.business_phonenumber &&
                            errors.business_phonenumber
                        )}
                        helperText={
                          touched.business_phonenumber &&
                          errors.business_phonenumber
                        }
                      />
                    </CustomFormControl>

                    <LoadingButton
                      variant="contained"
                      onClick={handleSubmit}
                      loading={isLoading}
                    >
                      Register Account
                    </LoadingButton>
                  </Stack>
                </>
              );
            }}
          </Formik>
        </Paper>
      </Box>
    </Box>
  );
}

export default Distributor;
