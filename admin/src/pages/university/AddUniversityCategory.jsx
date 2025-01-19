import { useContext, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';

import { CustomContext } from '../../context/providers/CustomProvider';
import { postCategory } from '../../api/categoryAPI';
import Transition from '../../components/Transition';
import { UNIVERSITY_FORM_TYPE } from '../../mocks/columns';
import { globalAlertType } from '../../components/alert/alertType';
import { CATEGORY } from '../../constants';
import CustomYearPicker from '../../components/inputs/CustomYearPicker';
import moment from 'moment';
import { addUniversityValidationSchema } from '../../config/validationSchema';
import Compressor from 'compressorjs';
import DOMPurify from 'dompurify';

const AddUniversityCategory = () => {
  //context
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  //state
  const [logo, setLogo] = useState(null);
  const [voucherType, setVoucherType] = useState('');
  const [voucherURL, setVoucherURL] = useState('');
  const [formType, setFormType] = useState('');
  const [price, setPrice] = useState(Number(0));
  const [year, setYear] = useState(moment().format('YYYY'));

  const initialValues = {
    category: 'university',
    voucherType,
    formType,
    price,
    voucherURL,
  };
  const handleUploadFile = (e) => {
    e.preventDefault();
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

  const { mutateAsync, isLoading } = useMutation({ mutationFn: postCategory });
  //
  const onSubmit = (values) => {
    const isProtocolPresent = values.voucherURL?.includes('http');
    const newUniversityCategory = {
      category: values.category,
      voucherType: values.voucherType,
      price: DOMPurify.sanitize(values.price),
      details: {
        formType: DOMPurify.sanitize(values.formType),
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        logo,
      },
      year,
    };

    mutateAsync(newUniversityCategory, {
      onSettled: () => {
        queryClient.invalidateQueries(['category']);
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

  ///Close Add Category
  const handleClose = () => {
    customDispatch({
      type: 'openAddUniversityCategory',
      payload: { open: false },
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
            open={customState.universityCategory.open}
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
                  value={price}
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
                  label={`University Website URL`}
                  value={voucherURL}
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
                Add Voucher
              </LoadingButton>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default AddUniversityCategory;
