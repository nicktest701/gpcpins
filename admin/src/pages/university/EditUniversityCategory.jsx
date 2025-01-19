import { useContext, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import { CustomContext } from '../../context/providers/CustomProvider';
import { editCategory, getCategory } from '../../api/categoryAPI';
import Transition from '../../components/Transition';
import { UNIVERSITY_FORM_TYPE } from '../../mocks/columns';
import { globalAlertType } from '../../components/alert/alertType';
import { CATEGORY } from '../../constants';
import moment from 'moment';
import CustomYearPicker from '../../components/inputs/CustomYearPicker';
import { addUniversityValidationSchema } from '../../config/validationSchema';
import Compressor from 'compressorjs';
import DOMPurify from 'dompurify';

const EditUniversityCategory = () => {
  //context
  const queryClient = useQueryClient();
  const {
    customState: {
      editUniversityCategory: { open, id },
    },
    customDispatch,
  } = useContext(CustomContext);

  const [logo, setLogo] = useState(null);
  const [voucherType, setVoucherType] = useState('');
  const [voucherURL, setVoucherURL] = useState('');
  const [formType, setFormType] = useState('');
  const [price, setPrice] = useState(Number(0));
  const [year, setYear] = useState(moment().format('YYYY'));

  const initialValues = {
    category: 'university',
    voucherType,
    voucherURL,
    formType,
    price,
  };

  const university = useQuery({
    queryKey: ['category', id],
    queryFn: () => getCategory(id),
    initialData: queryClient
      .getQueryData(['all-category'])
      ?.find((item) => item?._id === id),
    enabled: !!id,
    onSuccess: (university) => {
      setVoucherType(university.voucherType);
      setFormType(university?.details?.formType);
      setVoucherURL(university?.details?.voucherURL);
      setPrice(university.price);
      setYear(university.year);
    },
  });

  const handleUploadFile = (e) => {
    // e.preventDefault();
    if (e.target.files) {
      const image = e.target.files[0];

      new Compressor(image, {
        height: 200,
        width: 200,
        quality: 0.6,

        success(data) {
          const reader = new FileReader();
          reader.onload = function (event) {
            const ImageURL = event.target.result;
            setLogo(ImageURL);
          };

          reader.readAsDataURL(data);
        },
      });
    }
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: editCategory,
  });

  const onSubmit = (values, option) => {
    const isProtocolPresent = values.voucherURL?.includes('http');

    const newUniversityForm = {
      id: university.data?._id,
      category: values.category,
      voucherType: values.voucherType,
      price: DOMPurify.sanitize(values.price),
      details: {
        formType: DOMPurify.sanitize(values.formType),
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        logo: logo || university?.data?.details?.logo,
      },
      year,
    };

    mutateAsync(newUniversityForm, {
      onSettled: () => {
        option.setSubmitting(false);
        queryClient.invalidateQueries(['category']);
     
      },
      onSuccess: (data) => {
        customDispatch(globalAlertType('info', data));
        option.resetForm();
        handleClose();
      },
      onError: (error) => {
        customDispatch(globalAlertType('error', error));
      },
    });
  };

  ///Close Add Category
  const handleClose = () => {
    customDispatch({
      type: 'openEditUniversityCategory',
      payload: {
        open: false,
        id: '',
      },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addUniversityValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, handleSubmit }) => {
        return (
          <Dialog
            maxWidth='xs'
            fullWidth
            TransitionComponent={Transition}
            open={open}
            onClose={handleClose}
          >
            <DialogTitle>New University</DialogTitle>
            <DialogContent>
              <Stack rowGap={2} paddingY={2}>
                <div>
                  <label htmlFor='cinema'>Upload Logo</label>
                  <input
                    type='file'
                    id='profile'
                    accept='.png,.jpg,.jpeg,.webp'
                    onChange={handleUploadFile}
                  />
                </div>
                <Autocomplete
                  options={CATEGORY.university}
                  freeSolo
                  noOptionsText='No form available'
                  value={voucherType || null}
                  onInputChange={(e, value) => setVoucherType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label='University'
                      error={Boolean(touched.voucherType && errors.voucherType)}
                      helperText={touched.voucherType && errors.voucherType}
                    />
                  )}
                />
                <Autocomplete
                  options={UNIVERSITY_FORM_TYPE}
                  freeSolo
                  noOptionsText='No option available'
                  value={formType || null}
                  onInputChange={(e, value) => setFormType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label='Form Type'
                      error={Boolean(touched.formType && errors.formType)}
                      helperText={touched.formType && errors.formType}
                    />
                  )}
                />

                <CustomYearPicker label='Year' year={year} setYear={setYear} />

                <TextField
                  type='number'
                  inputMode='decimal'
                  label='Price'
                  placeholder='Price here'
                  value={price || 0}
                  onChange={(e) => setPrice(e.target.value)}
                  error={Boolean(touched.price && errors.price)}
                  helperText={touched.price && errors.price}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <Typography>GHS</Typography>
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position='end'>
                        <Typography>p</Typography>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  type='url'
                  inputMode='url'
                  label='University Website URL'
                  value={voucherURL || ''}
                  onChange={(e) => setVoucherURL(e.target.value)}
                  error={Boolean(touched.voucherURL && errors.voucherURL)}
                  helperText={
                    errors.voucherURL
                      ? errors.voucherURL
                      : 'eg. www.example.com'
                  }
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ padding: 1 }}>
              <Button onClick={handleClose}>Cancel</Button>
              <LoadingButton
                variant='contained'
                loading={isLoading}
                onClick={handleSubmit}
              >
                Save Changes
              </LoadingButton>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default EditUniversityCategory;
