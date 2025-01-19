import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { Formik } from "formik";
import { useParams, useSearchParams } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { getEmployee, updateEmployee } from "../../api/employeeAPI";
import { useContext, useState } from "react";
import { globalAlertType } from "../../components/alert/alertType";
import { ROLE_LIST } from "../../mocks/columns";
import { updateEmployeeValidationSchema } from "../../config/validationSchema";
import { CustomContext } from "../../context/providers/CustomProvider";
import moment from "moment";
import CustomDatePicker from "../../components/inputs/CustomDatePicker";

const UpdateEmployee = () => {
  const queryClient = useQueryClient();
  const [dob, setDob] = useState(moment());
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);

  const { data } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
    initialData: queryClient
      .getQueryData(["employees"])
      ?.find((employee) => employee?._id === id),
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
    setSearchParams((params) => {
      params.delete("update_employee");
      return params;
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: updateEmployee,
  });
  const onSubmit = (values, options) => {
    values._id = data?._id;
    values.dob = dob;

    Swal.fire({
      title: "Updating Employee",
      text: "Employee information modified.Save Changes?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        
        mutateAsync(values, {
          onSettled: () => {
            queryClient.invalidateQueries(["employee", id]);
            queryClient.invalidateQueries(["employees"]);
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
      }
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("update_employee"))}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle
        title="Edit Employee"
        subtitle="Make changes to employee information"
      />
      <Formik
        initialValues={initialValues}
        validationSchema={updateEmployeeValidationSchema}
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
              <DialogContent>
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
                    sx={{ bgcolor: "#fff" }}
                  />
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Close</Button>
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
    </Dialog>
  );
};

export default UpdateEmployee;
