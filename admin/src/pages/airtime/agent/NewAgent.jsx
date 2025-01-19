import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
// import Transition from '../../components/Transition';
import CustomFormControl from "../../../components/inputs/CustomFormControl";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";
import CustomDatePicker from "../../../components/inputs/CustomDatePicker";
import { agentValidationSchema } from "../../../config/validationSchema";
import { postAgent } from "../../../api/agentAPI";

const NewAgent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [dob, setDob] = useState(moment());
  const initialValues = {
    firstname: "",
    lastname: "",
    username: "",
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

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("add_agent");
      return params;
    });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postAgent,
  });
  const onSubmit = (values) => {
    mutateAsync(values, {
      onSettled: () => {
        queryClient.invalidateQueries(["agents"]);
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
    <Dialog
      open={Boolean(searchParams.get("add_agent"))}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle title="New Agent" subtitle="Add new agent to list" />
      <Formik
        initialValues={initialValues}
        validationSchema={agentValidationSchema}
        onSubmit={onSubmit}
      >
        {({ errors, values, touched, handleChange, handleSubmit }) => {
          return (
            <>
              <DialogContent>
                <Container
                  sx={{
                    border: "1px solid lightgray",
                    borderRadius: 1,
                    bgcolor: "#fff",
                    p: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    paragraph
                    bgcolor="primary.main"
                    color="secondary.main"
                    p={2}
                    mt={1}
                  >
                    Personal Details
                  </Typography>
                  <Stack spacing={2}>
                    <CustomFormControl>
                      <TextField
                        // variant="filled"
                        label="First Name"
                        fullWidth
                        size="small"
                        required
                        value={values.firstname}
                        onChange={handleChange("firstname")}
                        error={Boolean(touched.firstname && errors.firstname)}
                        helperText={touched.firstname && errors.firstname}
                      />

                      <TextField
                        // variant="filled"
                        label="Last Name"
                        size="small"
                        fullWidth
                        required
                        value={values.lastname}
                        onChange={handleChange("lastname")}
                        error={Boolean(touched.lastname && errors.lastname)}
                        helperText={touched.lastname && errors.lastname}
                      />
                    </CustomFormControl>
                    <TextField
                      // variant="filled"
                      label="Username"
                      size="small"
                      fullWidth
                      required
                      value={values.username}
                      onChange={handleChange("username")}
                      error={Boolean(touched.username && errors.username)}
                      helperText={touched.username && errors.username}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography
                              style={{
                                backgroundColor: "lightgray",
                                cursor: "pointer",
                              }}
                            >
                              @gpc
                            </Typography>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <CustomFormControl>
                      <CustomDatePicker
                         format='Do MMMM,YYYY'
                        label="Date Of Birth"
                        value={dob}
                        setValue={setDob}
                        error={Boolean(touched.date && errors.date)}
                        helperText={touched.date && errors.date}
                        minDate={moment("1900-01-01")}
                        disableFuture={true}
                        size="small"
                      />
                      <TextField
                        // variant="filled"
                        type="tel"
                        inputMode="tel"
                        label="Telephone No."
                        size="small"
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
                      sx={{ bgcolor: "#fff" }}
                    />
                    <TextField
                      size="small"
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
                      label="National ID / Voter's ID Number"
                      size="small"
                      required
                      value={values.nid}
                      onChange={handleChange("nid")}
                      error={Boolean(touched.nid && errors.nid)}
                      helperText={
                        touched.nid && errors.nid ? (
                          errors.nid
                        ) : (
                          <ul style={{ display: "flex", gap: "4rem" }}>
                            <li>National ID</li>
                            <li>Voter&apos;s ID</li>
                          </ul>
                        )
                      }
                    />
                  </Stack>

                  <Typography
                    variant="body1"
                    paragraph
                    bgcolor="primary.main"
                    color="secondary.main"
                    p={2}
                    mt={4}
                  >
                    Business Information
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      size="small"
                      label="Business Name"
                      required
                      value={values.business_name}
                      onChange={handleChange("business_name")}
                      error={Boolean(
                        touched.business_name && errors.business_name
                      )}
                      helperText={touched.business_name && errors.business_name}
                    />
                    <TextField
                      size="small"
                      required
                      label="Location"
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
                      size="small"
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
                        size="small"
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
                        size="small"
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
                  </Stack>
                </Container>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  sx={{
                    paddingX: 4,
                  }}
                  onClick={handleSubmit}
                >
                  Add Agent
                </LoadingButton>
              </DialogActions>
            </>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default NewAgent;
