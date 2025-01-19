import {
  Autocomplete,
  Avatar,
  Box,
  Container,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListSubheader,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { IMAGES } from '../../constants';
import { CATEGORY_LIST, ORGANIZATION_PRODUCTS } from '../../mocks/columns';
import { globalAlertType } from '../../components/alert/alertType';
import { CustomContext } from '../../context/providers/CustomProvider';
import { Formik } from 'formik';
import CustomFormControl from '../../components/inputs/CustomFormControl';
import { LoadingButton } from '@mui/lab';
import { postOrganizationMessage } from '../../api/messageAPI';
import { organizationMessageValidationSchema } from '../../config/validationSchema';

const Organisation = () => {
  const { customDispatch } = useContext(CustomContext);

  const initialValues = {
    firstname: '',
    lastname: '',
    email: '',
    phonenumber: '',
    businessname: '',
    location: '',
    category: { id: '', name: '' },
    description: '',
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postOrganizationMessage,
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

  const listStyles = {
    backgroundColor: '#fff',
    borderRadius: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
    transition: 'all 250ms ease-in-out',
  };
  return (
    <>
      <Helmet>
        <title>Business | Gab Powerful Consult</title>
        <meta
          name='description'
          content='Work with us. We provide you with services you can ever imagine!'
        />
        <link rel='canonical' href='https://www.gpcpins.com/business' />
      </Helmet>
      <>
        <div
          style={{
            background: `linear-gradient(to top right,var(--secondary),rgba(0,0,0,0.8)),url(${IMAGES.bgImage1})`,
            backgroundSize: 'cover',
            width: '100%',
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
          }}
        >
          <h1 className='hero-title'>Welcome</h1>
          <Typography
            color='white'
            textAlign='center'
            className='content-text'
            sx={{ mb: 4 }}
          >
            Be Part of something incredible! We looking for to work with you.
          </Typography>
          <a href='#contact' className='home-btn'>
            Create an account
          </a>
        </div>

        <Container
          id='contact'
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'center' },
            gap: { xs: '4rem', md: '6rem' },
            py: 10,
          }}
        >
          <Container maxWidth='md'>
            <Typography paragraph variant='h3' py={2}>
              We offer services like
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
                gap: 5,
                py: 2,
              }}
            >
              {ORGANIZATION_PRODUCTS.map((product) => (
                <List
                  key={product.id}
                  sx={listStyles}
                  subheader={
                    <ListSubheader color='primary'>
                      {product.header}
                    </ListSubheader>
                  }
                >
                  {product.products.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{
                        cursor: 'pointer',
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={item.img} sx={{ width: 30, height: 30 }} />
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontWeight: 'bold',
                          color: 'secondary',
                        }}
                        secondary={item.content}
                      />
                    </ListItem>
                  ))}
                </List>
              ))}
            </Box>
          </Container>

          <Container maxWidth='sm'>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Formik
                initialValues={initialValues}
                validationSchema={organizationMessageValidationSchema}
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
                      <Stack spacing={2} paddingY={2}>
                        <Typography
                          paragraph
                          color='#fff'
                          bgcolor='secondary.main'
                          p={1}
                        >
                          Fill the form
                        </Typography>
                        <CustomFormControl>
                          <TextField
                            variant='filled'
                            label='First Name'
                            fullWidth
                            value={values.firstname}
                            onChange={handleChange('firstname')}
                            error={Boolean(
                              touched.firstname && errors.firstname
                            )}
                            helperText={touched.firstname && errors.firstname}
                          />

                          <TextField
                            variant='filled'
                            label='Last Name'
                            fullWidth
                            value={values.lastname}
                            onChange={handleChange('lastname')}
                            error={Boolean(touched.lastname && errors.lastname)}
                            helperText={touched.lastname && errors.lastname}
                          />
                        </CustomFormControl>

                        <TextField
                          variant='filled'
                          label='Email Address'
                          fullWidth
                          value={values.email}
                          onChange={handleChange('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                        <TextField
                          variant='filled'
                          type='tel'
                          inputMode='tel'
                          label='Telephone No.'
                          fullWidth
                          value={values.phonenumber}
                          onChange={handleChange('phonenumber')}
                          error={Boolean(
                            touched.phonenumber && errors.phonenumber
                          )}
                          helperText={touched.phonenumber && errors.phonenumber}
                        />

                        <TextField
                          variant='filled'
                          label='Business Name'
                          value={values.businessname}
                          onChange={handleChange('businessname')}
                          error={Boolean(
                            touched.businessname && errors.businessname
                          )}
                          helperText={
                            touched.businessname && errors.businessname
                          }
                        />
                        <TextField
                          variant='filled'
                          label='Location'
                          value={values.location}
                          onChange={handleChange('location')}
                          error={Boolean(touched.location && errors.location)}
                          helperText={touched.location && errors.location}
                        />

                        <Autocomplete
                          options={CATEGORY_LIST}
                          disableClearable
                          clearText=' '
                          value={values.category}
                          defaultValue={values.category}
                          onChange={(e, value) =>
                            setFieldValue('category', value)
                          }
                          noOptionsText='No Category available'
                          isOptionEqualToValue={(option, value) =>
                            value.id === undefined ||
                            value.id === '' ||
                            value.id === null ||
                            option.id === value.id
                          }
                          getOptionLabel={(option) => option.name || ''}
                          renderInput={(params) => (
                            <TextField
                              variant='filled'
                              {...params}
                              label='Which of our products are you interested?'
                              error={Boolean(
                                touched.category?.name && errors.category?.name
                              )}
                              helperText={
                                touched.category?.name && errors.category?.name
                              }
                            />
                          )}
                        />

                        <TextField
                          variant='filled'
                          label='A short description about your business'
                          required
                          fullWidth
                          value={values.description}
                          onChange={handleChange('description')}
                          error={Boolean(
                            touched.description && errors.description
                          )}
                          helperText={touched.description && errors.description}
                          multiline
                          rows={5}
                          sx={{ bgcolor: '#fff' }}
                        />

                        <LoadingButton
                          variant='contained'
                          onClick={handleSubmit}
                          loading={isLoading}
                        >
                          Create account
                        </LoadingButton>
                      </Stack>
                    </>
                  );
                }}
              </Formik>
            </Paper>
          </Container>
        </Container>
      </>
    </>
  );
};

export default Organisation;
