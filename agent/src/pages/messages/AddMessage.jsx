import {
  Autocomplete,
  Dialog,
  DialogContent,
  Stack,
  TextField,
} from '@mui/material';
import { useContext } from 'react';
import { LoadingButton } from '@mui/lab';
import { Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CustomDialogTitle from '../../components/dialogs/CustomDialogTitle';
import { postBroadcastMessage } from '../../api/broadcastMessageAPI';
import { CustomContext } from '../../context/providers/CustomProvider';
import { globalAlertType } from '../../components/alert/alertType';

function AddMessage({ open, setOpen }) {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const initialValues = {
    type: '',
    recipient: '',
    title: '',
    body: '',
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postBroadcastMessage,
  });
  const onSubmit = (values) => {
    console.log(values);

    mutateAsync(values, {
      onSettled: () => {
        queryClient.invalidateQueries(['broadcast-messages']);
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType('info', data));
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType('error', error));
      },
    });
  };

  const handleClose = () => setOpen(false);

  return (
    <Dialog open={open} maxWidth='sm' fullWidth>
      <CustomDialogTitle
        title='New Message'
        subtitle='Enter your message details here'
        onClose={handleClose}
      />
      <DialogContent>
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          enableReinitialize={true}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            setFieldValue,
          }) => {
            return (
              <Stack rowGap={2} padding={2}>
                <Autocomplete
                  size='small'
                  options={['Customers', 'Employees']}
                  freeSolo
                  noOptionsText='No option avaiable'
                  value={values.recipient}
                  onChange={(e, value) => setFieldValue('recipient', value)}
                  getOptionLabel={(option) => option || ''}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label='Recipient'
                      error={Boolean(touched.recipient && errors.recipient)}
                      helperText={touched.recipient && errors.recipient}
                    />
                  )}
                />
                <Autocomplete
                  size='small'
                  options={['Email', 'SMS']}
                  freeSolo
                  noOptionsText='No option avaiable'
                  value={values.type}
                  onChange={(e, value) => setFieldValue('type', value)}
                  getOptionLabel={(option) => option || ''}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label='Type'
                      error={Boolean(touched.type && errors.type)}
                      helperText={touched.type && errors.type}
                    />
                  )}
                />
                <TextField
                  label='Message Title'
                  size='small'
                  fullWidth
                  value={values.title}
                  onChange={handleChange('title')}
                  error={Boolean(touched.title && errors.title)}
                  helperText={touched.title && errors.title}
                />

                <TextField
                  multiline
                  rows={5}
                  size='small'
                  label='Message here'
                  fullWidth
                  value={values.body}
                  onChange={handleChange('body')}
                  error={Boolean(touched.body && errors.body)}
                  helperText={touched.body && errors.body}
                />

                <LoadingButton
                  loading={isLoading}
                  // color='secondary'
                  variant='contained'
                  fullWidth
                  onClick={handleSubmit}
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
