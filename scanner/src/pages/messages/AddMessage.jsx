import { Dialog, DialogContent, Stack, TextField } from "@mui/material";
import { useContext } from "react";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { postBroadcastMessage } from "../../api/broadcastMessageAPI";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";

function AddMessage({ open, setOpen }) {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const initialValues = {
    title: "",
    message: "",
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postBroadcastMessage,
  });
  const onSubmit = (values) => {
    mutateAsync(values, {
      onSettled: () => {
        queryClient.invalidateQueries(["broadcast-messages"]);
        queryClient.invalidateQueries(["notifications"]);
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

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} maxWidth="md" fullWidth>
      <CustomDialogTitle
        title="New Message"
        subtitle="Enter your message details here"
        onClose={handleClose}
      />
      <DialogContent>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {({ values, errors, touched, handleChange, handleSubmit }) => {
            return (
              <Stack rowGap={2} py={2}>
                <TextField
                  label="Message Title"
                  fullWidth
                  value={values.title}
                  onChange={handleChange("title")}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                />

                <>
                  <TextField
                    multiline
                    rows={5}
                    label="Message here"
                    fullWidth
                    value={values.message}
                    onChange={handleChange("message")}
                    error={Boolean(touched.message && errors.message)}
                    helperText={touched.message && errors.message}
                  />
                </>

                <LoadingButton
                  loading={isLoading}
                  // color='secondary'
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                  sx={{ alignSelf: "flex-end" }}
                >
                  Send
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default AddMessage;
