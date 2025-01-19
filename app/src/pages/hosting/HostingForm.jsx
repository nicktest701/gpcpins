import { LoadingButton } from '@mui/lab';
import { Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { Formik } from 'formik';
import { useContext } from 'react';
import { globalAlertType } from '../../components/alert/alertType';
import { useMutation } from '@tanstack/react-query';
import { CustomContext } from '../../context/providers/CustomProvider';
import { postHostingMessage } from '../../api/messageAPI';
import { hostingMessageValidationSchema } from '../../config/validationSchema';

function HostingForm() {
  const { customDispatch } = useContext(CustomContext);

  const initValues = {
    name: '',
    email: '',
    phonenumber: '',
    description: '',
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postHostingMessage,
  });

  const onSubmit = (values, options) => {
    mutateAsync(values, {
      onSuccess: (data) => {
        customDispatch(globalAlertType('info', data));
        options.resetForm();
      },
      onError: () => {
        customDispatch(globalAlertType('error', 'An error has occurred!'));
      },
    });
  };

  return (
    <Container maxWidth='sm'>
      <div style={{ backgroundColor: 'var(--secondary)', padding: '16px' }}>
        <Typography className='content-text' textAlign='center' color='#fff'>
          Fill the form below and let&apos;s get started!
        </Typography>
      </div>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Formik
          initialValues={initValues}
          validationSchema={hostingMessageValidationSchema}
          onSubmit={onSubmit}
        >
          {({ touched, values, errors, handleSubmit, handleChange }) => {
            return (
              <Stack spacing={3} width='100%'>
                <TextField
                  variant='filled'
                  label='Business Name'
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
                  type='email'
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
                  label='Telepone Number'
                  size='small'
                  inputMode='tel'
                  required
                  fullWidth
                  value={values.phonenumber}
                  onChange={handleChange('phonenumber')}
                  error={Boolean(touched.phonenumber && errors.phonenumber)}
                  helperText={touched.phonenumber && errors.phonenumber}
                  sx={{ bgcolor: '#fff' }}
                />

                <TextField
                  variant='filled'
                  label='Short description about your business'
                  size='small'
                  required
                  fullWidth
                  value={values.description}
                  onChange={handleChange('description')}
                  error={Boolean(touched.description && errors.description)}
                  helperText={touched.description && errors.description}
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
                  Send Request
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </Paper>
    </Container>
  );
}

export default HostingForm;
