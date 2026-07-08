import {
  Box,
  Stack,
  TextField,
  Typography,
  Paper,
  Fade,
  Container,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import moment from "moment";
import CustomDatePicker from "../components/inputs/CustomDatePicker";
import { putUser } from "../api/userAPI";
import { useCustomContext } from "../context/providers/CustomProvider";
import { useAuth } from "../context/providers/AuthProvider";
import { globalAlertType } from "../components/alert/alertType";
import GlobalSpinner from "../components/GlobalSpinner";
import { getStartedValidationSchema } from "../config/validationSchema";

function GetStarted() {
  const { user } = useAuth();
  const { customDispatch } = useCustomContext();
  const navigate = useNavigate();
  const { state } = useLocation();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(moment());

  const initValues = {
    id: user?.id,
    nid: "",
    lastname: "",
    firstname: "",
    dob: null,
    phonenumber: state?.phonenumber,
  };

  const { mutateAsync, isPending } = useMutation({
    mutationFn: putUser,
  });
  const onSubmit = (values) => {
    mutateAsync(
      {
        ...values,
        dob: moment(date).format('YYYY-MM-DD'),
        firstname:values?.firstname,
        lastname:values?.lastname,
        phonenumber: values?.phonenumber,
        google: state?.google,
        register: true,
      },

      {
        onSettled: () => {
          navigate("/");
        },
        onSuccess: (data) => {
          queryClient.invalidateQueries(["user"]);
          customDispatch(
            globalAlertType(
              "info",
              `Welcome,${values?.firstname} ${values?.lastname}`,
            ),
          );
        },
        onError: (error) => {
          customDispatch(globalAlertType("error", error));
        },
      },
    );
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        py: 4,
      }}
    >
      <Fade in timeout={800}>
        <Paper
          elevation={1}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
          }}
        >
          <Formik
            initialValues={initValues}
            validationSchema={getStartedValidationSchema}
            onSubmit={onSubmit}
            enableReinitialize={true}
          >
            {({ touched, values, errors, handleSubmit, handleChange }) => {
              return (
                <Stack
                  spacing={3}
                  width="100%"
           
                >
                  <div>
                    <Typography variant="h4" color="primary">
                      Welcome
                    </Typography>
                    <Typography
                      variant="body2"
                      fontStyle="italic"
                      fontWeight="bold"
                    >
                      Just a few more steps to go
                    </Typography>
                  </div>

                  <TextField
                    label="First Name"
                    fullWidth
                    required
                    value={values?.firstname}
                    onChange={handleChange("firstname")}
                    error={Boolean(touched?.firstname && errors?.firstname)}
                    helperText={touched?.firstname && errors?.firstname}
                  />

                  <TextField
                    label="Last Name"
                    fullWidth
                    required
                    value={values?.lastname}
                    onChange={handleChange("lastname")}
                    error={Boolean(touched?.lastname && errors?.lastname)}
                    helperText={touched?.lastname && errors?.lastname}
                  />

                  <CustomDatePicker
                    label="Date Of Birth"
                    format="Do MMMM,YYYY"
                    value={date}
                    setValue={setDate}
                    error={Boolean(touched.date && errors.date)}
                    helperText={touched.date && errors.date}
                    minDate={moment("1900-01-01")}
                    disableFuture={true}
                    size="lg"
                  />
                  {!state.phonenumber && (
                    <TextField
                      type="tel"
                      inputMode="tel"
                      variant="outlined"
                      label="Phone Number"
                      fullWidth
                      required
                      value={values?.phonenumber}
                      onChange={handleChange("phonenumber")}
                      error={Boolean(
                        touched?.phonenumber && errors?.phonenumber,
                      )}
                      helperText={touched?.phonenumber && errors?.phonenumber}
                    />
                  )}

                  <TextField
                    label="National ID Number"
                    fullWidth
                    value={values?.nid}
                    onChange={handleChange("nid")}
                    error={Boolean(touched?.nid && errors?.nid)}
                    helperText={touched?.nid && errors?.nid}
                  />

                  <LoadingButton
                    disabled={isPending}
                    loading={isPending}
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{ py: 2 }}
                  >
                    Get Started
                  </LoadingButton>
                </Stack>
              );
            }}
          </Formik>
          {isPending && <GlobalSpinner />}
        </Paper>
      </Fade>
    </Container>
  );
}

export default GetStarted;
