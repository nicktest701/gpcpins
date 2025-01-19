import {
  Autocomplete,
  Box,
  Button,
  Container,
  DialogActions,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomFormControl from "../../components/inputs/CustomFormControl";

import { Formik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { getVerifierByID, putVerifier } from "../../api/verifierAPI";
import { useState } from "react";
import { globalAlertType } from "../../components/alert/alertType";
import { ROLE_LIST } from "../../mocks/columns";
import { updateVerifierValidationSchema } from "../../config/validationSchema";
import { useCustomData } from "../../context/providers/CustomProvider";
import moment from "moment";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";
import CustomTitle from "../../components/custom/CustomTitle";
import { parseJwt } from "../../config/sessionHandler";
import { useAuth } from "../../context/providers/AuthProvider";

const UpdateVerifier = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dob, setDob] = useState(moment());
  const { id } = useParams();
  const { customDispatch } = useCustomData();

  const { data } = useQuery({
    queryKey: ["verifier", id],
    queryFn: () => getVerifierByID(id),
    enabled: !!id,
    initialData: queryClient
      .getQueryData(["verifiers"])
      ?.find((verifier) => verifier?._id === id),
  });

  const initialValues = {
    _id: data?._id,
    firstname: data?.firstname,
    lastname: data?.lastname,
    username: data?.username,
    dob: moment(data?.dob),
    nid: data?.nid,
    role: data?.role,
    email: data?.email,
    residence: data?.residence,
    phonenumber: data?.phonenumber,
  };

  const handleClose = () => {
    navigate(`/verifiers/${id}`);
  };

  const { mutateAsync } = useMutation({
    mutationFn: putVerifier,
  });
  const onSubmit = (values, options) => {
    values._id = data?._id;
    values.dob = dob;

    Swal.fire({
      title: "Updating Verifier",
      text: "Verifier information modified.Save Changes?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(values, {
          onSettled: () => {
            queryClient.invalidateQueries(["verifier", id]);
            queryClient.invalidateQueries(["verifiers"]);
            options.setSubmitting(false);
          },
          onSuccess: (data) => {
            login(parseJwt(data?.accessToken));
            customDispatch(globalAlertType("info", "Changes Saved!"));
            handleClose();
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  return (
    <Container>
      <CustomTitle
        title="Edit Verifier"
        subtitle="Make changes to verifier information"
      />
      <Formik
        initialValues={initialValues}
        validationSchema={updateVerifierValidationSchema}
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
          return (
            <>
              <Box>
                <Stack spacing={2} py={2}>
                  <Typography
                    variant="caption"
                    // bgcolor="primary.main"
                    color="secondary.main"
                    textTransform="uppercase"
                    p={1}
                  >
                    Personal Details
                  </Typography>
                  <Stack
                    position="relative"
                    justifyContent="center"
                    alignItems="center"
                  ></Stack>

                  <CustomFormControl>
                    <TextField
                      label="First Name"
                      fullWidth
                      value={values?.firstname}
                      onChange={handleChange("firstname")}
                      error={Boolean(touched.firstname && errors.firstname)}
                      helperText={touched.firstname && errors.firstname}
                    />

                    <TextField
                      label="Last Name"
                      fullWidth
                      value={values?.lastname}
                      onChange={handleChange("lastname")}
                      error={Boolean(touched.lastname && errors.lastname)}
                      helperText={touched.lastname && errors.lastname}
                    />
                  </CustomFormControl>
                  <CustomFormControl>
                    <TextField
                      label="Username"
                      fullWidth
                      value={values?.username}
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
                      disableFuture={true}
                      size="large"
                      format="Do,MMMM,YYYY"
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
                    clearText=" "
                    value={values?.role}
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
                        label="Role"
                        error={Boolean(touched.role && errors.role)}
                        helperText={touched.role && errors.role}
                      />
                    )}
                  />

                  <Typography
                    variant="caption"
                    paragraph
                    // bgcolor="primary.main"
                    color="secondary.main"
                    textTransform="uppercase"
                    p={1}
                  >
                    Contact Details
                  </Typography>
                  <CustomFormControl>
                    <TextField
                      label="Email Address"
                      fullWidth
                      value={values?.email}
                      onChange={handleChange("email")}
                      error={Boolean(touched.email && errors.email)}
                      helperText={touched.email && errors.email}
                    />
                    <TextField
                      type="tel"
                      inputMode="tel"
                      label="Telephone No."
                      fullWidth
                      value={values?.phonenumber}
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
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  variant="contained"
                  sx={{
                    paddingX: 4,
                  }}
                  onClick={handleSubmit}
                >
                  Save Changes
                </LoadingButton>
              </DialogActions>
            </>
          );
        }}
      </Formik>
    </Container>
  );
};

export default UpdateVerifier;
