import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import { Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {  useState } from "react";
import {useCustomData } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { ROLE_LIST } from "../../mocks/columns";
import { addVerifierValidationSchema } from "../../config/validationSchema";
import CustomImageChooser from "../../components/inputs/CustomImageChooser";

import moment from "moment";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import { useNavigate } from "react-router-dom";
import CustomTitle from "../../components/custom/CustomTitle";
import { addVerifier } from "../../api/verifierAPI";
import { PersonAddAlt1Rounded } from "@mui/icons-material";

const NewEmployee = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } =useCustomData()
  const [profileImage, setProfileImage] = useState(null);
  const [dob, setDob] = useState(moment("1900-01-01"));

  const initialValues = {
    profile: null,
    firstname: "",
    lastname: "",
    username: "",
    dob,
    nid: "",
    residence: "",
    email: "",
    phonenumber: "",
    role: "",
  };

  const handleClose = () => navigate("/verifiers");

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: addVerifier,
  });
  const onSubmit = (values, options) => {
    delete values.confirmPassword;
    values.dob = moment(new Date(dob));
    values.isAdmin = values.role === "Administrator";

    mutateAsync(values, {
      onSettled: () => {
        queryClient.invalidateQueries(["verifiers"]);
        options.setSubmitting(false);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType("info", data));
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType("error", error));
      },
    });
  };

  return (
    <>
      <CustomTitle
        title="New Verifier"
        subtitle="Fill in the details below to create a new verifier account."
        icon={
          <PersonAddAlt1Rounded
            color="primary"
            sx={{ width: 80, height: 80 }}
          />
        }
      />

      <Formik
        initialValues={initialValues}
        validationSchema={addVerifierValidationSchema}
        onSubmit={onSubmit}
      >
        {({
          errors,
          values,
          touched,
          setFieldValue,
          handleChange,
          handleSubmit,
        }) => {
          const handleImageUpload = (e) => {
            setFieldValue("profile", e.target.files[0]);
            setProfileImage(URL.createObjectURL(e.target.files[0]));
          };

          return (
            <>
              <Box>
                <Stack spacing={2}>
                  <Typography
                    variant="caption"
                    paragraph
                    // color="secondary.main"
                    bgcolor="whitesmoke"
                    textTransform="uppercase"
                    p={2}
                  >
                    Personal Details
                  </Typography>
                  <Stack
                    position="relative"
                    justifyContent="center"
                    alignItems="center"
                    mb={4}
                  >
                    <Avatar
                      alt="profile"
                      src={profileImage}
                      sx={{ width: 100, height: 100 }}
                    />
                    <CustomImageChooser handleImageUpload={handleImageUpload} />
                  </Stack>

                  <CustomFormControl>
                    <TextField
                      label="First Name"
                      fullWidth
                      value={values.firstname}
                      onChange={handleChange("firstname")}
                      error={Boolean(touched.firstname && errors.firstname)}
                      helperText={touched.firstname && errors.firstname}
                    />

                    <TextField
                      label="Last Name"
                      fullWidth
                      value={values.lastname}
                      onChange={handleChange("lastname")}
                      error={Boolean(touched.lastname && errors.lastname)}
                      helperText={touched.lastname && errors.lastname}
                    />
                  </CustomFormControl>
                  <CustomFormControl>
                    <TextField
                      label="Username"
                      fullWidth
                      value={values.username}
                      onChange={handleChange("username")}
                      error={Boolean(touched.username && errors.username)}
                      helperText={touched.username && errors.username}
                    />

                    <CustomDatePicker
                      label="Date Of Birth"
                      value={values.dob}
                      setValue={setDob}
                      error={Boolean(touched.date && errors.date)}
                      helperText={touched.date && errors.date}
                      minDate={moment("1900-01-01")}
                      format="Do MMMM,YYYY"
                      disableFuture={true}
                      size="large"
                    />
                  </CustomFormControl>

                  <TextField
                    label="National ID / Voter's ID Number"
                    size="large"
                    fullWidth
                    required
                    value={values.nid}
                    onChange={handleChange("nid")}
                    error={Boolean(touched.nid && errors.nid)}
                    helperText={touched.nid && errors.nid}
                  />

                  <Autocomplete
                    options={ROLE_LIST}
                    disableClearable
                    fullWidth
                    clearText=" "
                    autoFocus={false}
                    value={values.role}
                    onChange={(e, value) => setFieldValue("role", value)}
                    noOptionsText="No Role available"
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === "" ||
                      value === null ||
                      option === value
                    }
                    getOptionLabel={(option) => option || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        autoFocus={false}
                        label="Role"
                        error={Boolean(touched.role && errors.role)}
                        helperText={touched.role && errors.role}
                      />
                    )}
                  />

                  <Typography
                    variant="caption"
                    paragraph
                    bgcolor="whitesmoke"
                    textTransform="uppercase"
                    p={2}
                  >
                    Contact Details
                  </Typography>

                  <CustomFormControl>
                    <TextField
                      label="Email Address"
                      fullWidth
                      value={values.email}
                      onChange={handleChange("email")}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    <TextField
                      type="tel"
                      inputMode="tel"
                      label="Telephone No."
                      fullWidth
                      value={values.phonenumber}
                      onChange={handleChange("phonenumber")}
                      error={Boolean(touched.phonenumber && errors.phonenumber)}
                      helperText={touched.phonenumber && errors.phonenumber}
                    />
                  </CustomFormControl>
                  <TextField
                    size="small"
                    label="Residential Address"
                    required
                    fullWidth
                    value={values.residence}
                    onChange={handleChange("residence")}
                    error={Boolean(touched.residence && errors.residence)}
                    helperText={touched.residence && errors.residence}
                    multiline
                    rows={5}
                    // sx={{ bgcolor: "#fff" }}
                  />
                </Stack>
              </Box>
              <DialogActions sx={{ my: 3, p: 0 }}>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  sx={{
                    paddingX: 4,
                  }}
                  onClick={handleSubmit}
                >
                  Add New
                </LoadingButton>
              </DialogActions>
            </>
          );
        }}
      </Formik>
    </>
  );
};

export default NewEmployee;
