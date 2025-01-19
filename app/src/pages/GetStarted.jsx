import { Box, Stack, TextField, Typography } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik } from "formik";
import moment from "moment";
import CustomFormControl from "../components/inputs/CustomFormControl";
import CustomDatePicker from "../components/inputs/CustomDatePicker";
import { putUser } from "../api/userAPI";
import { CustomContext } from "../context/providers/CustomProvider";
import { AuthContext } from "../context/providers/AuthProvider";
import { globalAlertType } from "../components/alert/alertType";
import GlobalSpinner from "../components/GlobalSpinner";

function GetStarted() {
  const { user, login } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
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

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putUser,
  });
  const onSubmit = (values) => {
    mutateAsync(
      {
        ...values,
        dob: date,
        name: `${values?.firstname} ${values?.lastname}`,
        phonenumber: values?.phonenumber,
        google: state?.google,
        register: true,
      },

      {
        onSettled: () => {
          navigate("/");
        },
        onSuccess: (data) => {
          login(data?.accessToken);
          queryClient.invalidateQueries(["user"]);
          customDispatch(
            globalAlertType(
              "info",
              `Welcome,${values?.firstname} ${values?.lastname}`
            )
          );
        },
        onError: (error) => {
          customDispatch(globalAlertType("error", error));
        },
      }
    );
  };

  return (
    <Box
      sx={{
        display: "grid",
        placeItems: "center",
        height: "100svh",
        width: "100%",
        bgcolor: "primary.main",
      }}
    >
      <Box sx={{ minWidth: 300 }}>
        <Formik
          initialValues={initValues}
          //   validationSchema={}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {({ touched, values, errors, handleSubmit, handleChange }) => {
            return (
              <Stack
                spacing={3}
                width="100%"
                sx={{
                  backgroundColor: "#fff",
                  boxShadow: "2px 2px 5px #d9d9d9",
                  //   boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
                  borderRadius: 2,

                  p: 4,
                }}
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
                <CustomFormControl>
                  <TextField
                    size="small"
                    label="First Name"
                    fullWidth
                    required
                    value={values?.firstname}
                    onChange={handleChange("firstname")}
                    error={Boolean(touched?.firstname && errors?.firstname)}
                    helperText={touched?.firstname && errors?.firstname}
                  />

                  <TextField
                    size="small"
                    label="Last Name"
                    fullWidth
                    required
                    value={values?.lastname}
                    onChange={handleChange("lastname")}
                    error={Boolean(touched?.lastname && errors?.lastname)}
                    helperText={touched?.lastname && errors?.lastname}
                  />
                </CustomFormControl>

                <CustomDatePicker
                  label="Date Of Birth"
                  format="Do MMMM,YYYY"
                  value={date}
                  setValue={setDate}
                  error={Boolean(touched.date && errors.date)}
                  helperText={touched.date && errors.date}
                  minDate={moment("1900-01-01")}
                  disableFuture={true}
                />
                {!state.phonenumber && (
                  <TextField
                    size="small"
                    type="tel"
                    inputMode="tel"
                    variant="outlined"
                    label="Phone Number"
                    fullWidth
                    required
                    value={values?.phonenumber}
                    onChange={handleChange("phonenumber")}
                    error={Boolean(touched?.phonenumber && errors?.phonenumber)}
                    helperText={touched?.phonenumber && errors?.phonenumber}
                  />
                )}

                <TextField
                  size="small"
                  label="National ID Number"
                  fullWidth
                  value={values?.nid}
                  onChange={handleChange("nid")}
                  error={Boolean(touched?.nid && errors?.nid)}
                  helperText={touched?.nid && errors?.nid}
                />

                <LoadingButton
                  disabled={isLoading}
                  loading={isLoading}
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
        {isLoading && <GlobalSpinner />}
      </Box>
    </Box>
  );
}

export default GetStarted;
