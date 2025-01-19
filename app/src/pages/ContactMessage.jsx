import { LoadingButton } from '@mui/lab';
import { Card, Container, Paper, Stack, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { Formik } from 'formik';
import { useContext } from 'react';
import { messageValidationSchema } from '../config/validationSchema';
import AnimatedContainer from '../components/animations/AnimatedContainer';
import { CustomContext } from '../context/providers/CustomProvider';
import { globalAlertType } from '../components/alert/alertType';
import { postMessage } from '../api/messageAPI';

const ContactMessage = () => {
  const { customDispatch } = useContext(CustomContext);

  const initValues = {
    name: '',
    email: '',
    body: '',
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postMessage,
  });

  const onSubmit = (values, options) => {
    // console.log(values);

    mutateAsync(values, {
      onSuccess: () => {
        customDispatch(globalAlertType('info', 'Message sent!'));
        options.resetForm();
      },
      onError: () => {
        customDispatch(globalAlertType('error', 'Message not sent!'));
      },
    });
  };

  return (
    <Paper elevation={2} sx={{p:2}}>
      <Formik
        initialValues={initValues}
        validationSchema={messageValidationSchema}
        onSubmit={onSubmit}
      >
        {({ touched, values, errors, handleSubmit, handleChange }) => {
          return (
            <Stack spacing={3} width='100%'>
              <TextField
                variant='filled'
                label='Full name'
                size='small'
                required
                fullWidth
                value={values.name}
                onChange={handleChange('name')}
                error={Boolean(touched.name && errors.name)}
                helperText={touched.name && errors.name}
                sx={{ bgcolor: '#fff' }}
              />
              <TextField
                variant='filled'
                label='Email Address'
                size='small'
                required
                fullWidth
                value={values.email}
                onChange={handleChange('email')}
                error={Boolean(touched.email && errors.email)}
                helperText={touched.email && errors.email}
                sx={{ bgcolor: '#fff' }}
              />

              <TextField
                variant='filled'
                label='Message here'
                size='small'
                required
                fullWidth
                value={values.body}
                onChange={handleChange('body')}
                error={Boolean(touched.body && errors.body)}
                helperText={touched.body && errors.body}
                multiline
                rows={3}
                sx={{ bgcolor: '#fff' }}
              />

              <LoadingButton
                loading={isLoading}
                variant='contained'
                size='small'
                fullWidth
                onClick={handleSubmit}
              >
                Send Message
              </LoadingButton>
            </Stack>
          );
        }}
      </Formik>
    </Paper>
  );
};

export default ContactMessage;
