import {
  Container,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
// import Transition from '../../components/Transition';
import CustomFormControl from "../../../components/inputs/CustomFormControl";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import moment from "moment";
import { useSearchParams, useParams } from "react-router-dom";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";
import CustomDatePicker from "../../../components/inputs/CustomDatePicker";
import {
  agentBusinessValidationSchema,
  agentContactValidationSchema,
  agentPersonalValidationSchema,
  agentValidationSchema,
} from "../../../config/validationSchema";
import { getAgent, putAgent } from "../../../api/agentAPI";

const EditAgent = () => {
  const { id } = useParams();
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profileImage, setProfileImage] = useState(null);
  const [dob, setDob] = useState(moment());

  const { data } = useQuery({
    queryKey: ["agent", id],
    queryFn: () => getAgent(id),
    enabled: !!id,
    initialData: () => {
      return queryClient
        .getQueryData(["agents"])
        .find((agent) => agent?._id === id);
    },
  });

  const agentValues = {
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

  const personalValues = {
    _id: data?._id,
    firstname: data?.firstname,
    lastname: data?.lastname,
    username: data?.username,
    dob: moment(data?.dob),
    nid: data?.nid,
  };
  const contactValues = {
    _id: data?._id,
    residence: data?.residence,
    email: data?.email,
    phonenumber: data?.phonenumber,
  };
  const businessValues = {
    agent_id: data?._id,
    business_name: data?.business_name,
    business_location: data?.business_location,
    business_description: data?.business_description,
    business_email: data?.business_email,
    business_phonenumber: data?.business_phonenumber,
  };


  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("personal");
      params.delete("business");
      params.delete("contact");
      return params;
    });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: putAgent,
  });
  const onSubmit = (values) => {
    // console.log(values);
    values.dob = dob;
    mutateAsync(values, {
      onSettled: () => {
        queryClient.invalidateQueries(["agents"]);
        queryClient.invalidateQueries(["agent", id]);
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

  const initialValues = searchParams.get("personal")
    ? personalValues
    : searchParams?.get("contact")
    ? contactValues
    : searchParams?.get("business")
    ? businessValues
    : agentValues;

  const validationSchema = searchParams.get("personal")
    ? agentPersonalValidationSchema
    : searchParams?.get("contact")
    ? agentContactValidationSchema
    : searchParams?.get("business")
    ? agentBusinessValidationSchema
    : agentValidationSchema;

  const open =
    searchParams.get("personal") ||
    searchParams.get("contact") ||
    searchParams.get("business");
  return (
    <Dialog
      open={Boolean(open)}
      maxWidth="md"
      fullWidth
      // fullScreen
      // TransitionComponent={Transition}
    >
      <CustomDialogTitle
        title="Edit Agent"
        subtitle="Make Changes to business"
      />
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
        enableReinitialize
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
              <DialogContent>
                <Container>
                  {searchParams.get("personal") && (
                    <Stack spacing={2}>
                      <Typography
                        variant="caption"
                        paragraph
                        bgcolor="primary.main"
                        color="secondary.main"
                        textTransform="uppercase"
                        p={1}
                      >
                        Personal Details
                      </Typography>
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
                      />
                      <CustomFormControl>
                        <CustomDatePicker
                           format='Do MMMM,YYYY'
                          label="Date Of Birth"
                          value={values.dob}
                          setValue={setDob}
                          error={Boolean(touched.date && errors.date)}
                          helperText={touched.date && errors.date}
                          minDate={moment("1900-01-01")}
                          disableFuture={true}
                          size="small"
                        />
                        <TextField
                          label="National ID / Voter's ID Number"
                          size="small"
                          required
                          fullWidth
                          value={values.nid}
                          onChange={handleChange("nid")}
                          error={Boolean(touched.nid && errors.nid)}
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
                      </CustomFormControl>
                    </Stack>
                  )}
                  {searchParams.get("contact") && (
                    <Stack spacing={2}>
                      <Typography
                        variant="body1"
                        paragraph
                        bgcolor="primary.main"
                        color="secondary.main"
                        p={2}
                        mt={1}
                      >
                        Contact Details
                      </Typography>

                      <CustomFormControl>
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
                          InputProps={{
                            readOnly: true,
                          }}
                          disabled
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
                    </Stack>
                  )}
                  {searchParams.get("business") && (
                    <Stack spacing={2}>
                      <Typography
                        variant="body1"
                        paragraph
                        bgcolor="primary.main"
                        color="secondary.main"
                        p={2}
                        mt={4}
                        fullWidth
                      >
                        Business Information
                      </Typography>
                      <TextField
                        size="small"
                        label="Business Name"
                        required
                        value={values.business_name}
                        onChange={handleChange("business_name")}
                        error={Boolean(
                          touched.business_name && errors.business_name
                        )}
                        helperText={
                          touched.business_name && errors.business_name
                        }
                        fullWidth
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
                        fullWidth
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
                  )}
                </Container>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  loading={isLoading}
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
    </Dialog>
  );
};

export default EditAgent;
