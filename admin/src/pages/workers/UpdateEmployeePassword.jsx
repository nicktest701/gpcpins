import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  TextField,
} from "@mui/material";
import Transition from "../../components/Transition";
import CustomFormControl from "../../components/inputs/CustomFormControl";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { Formik } from "formik";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { updateEmployee } from "../../api/employeeAPI";
import { useContext } from "react";
import { globalAlertType } from "../../components/alert/alertType";
import { updateEmployeeValidationSchema } from "../../config/validationSchema";
import { CustomContext } from "../../context/providers/CustomProvider";

const UpdateEmployeePassword = () => {
  const queryClient = useQueryClient();
  const {
    customState: {
      updateEmployee: { open, data },
    },
    customDispatch,
  } = useContext(CustomContext);

  const handleClose = () =>
    customDispatch({
      type: "updateEmployee",
      payload: {
        open: false,
        data: {},
      },
    });

  const { mutateAsync } = useMutation({
    mutationFn: updateEmployee,
  });
  const onSubmit = (values, options) => {
    delete values.confirmPassword;
    values._id = data?._id;

    Swal.fire({
      title: "Updating Employee",
      text: "Employee information modified.Save Changes?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(values, {
          onSettled: () => {
            queryClient.invalidateQueries(["employee-info", data?._id]);
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
      open={open}
      maxWidth="md"
      fullWidth
      // hideBackdrop
      TransitionComponent={Transition}
    >
      <CustomDialogTitle
        title="Edit Employee"
        subtitle="Update organiastion information"
      />
      <Formik
        initialValues={queryClient.getQueryData(["employee-info", data?._id])}
        validationSchema={updateEmployeeValidationSchema}
        onSubmit={onSubmit}
      >
        {({ errors, values, touched, handleChange, handleSubmit }) => {
          return (
            <>
              <DialogContent>
                <Stack spacing={2} paddingY={2}>
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

export default UpdateEmployeePassword;
