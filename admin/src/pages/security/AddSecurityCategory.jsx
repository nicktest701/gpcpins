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
import { globalAlertType } from '../../components/alert/alertType';
import { CATEGORY } from '../../constants';
import moment from 'moment';
import CustomYearPicker from '../../components/inputs/CustomYearPicker';
import { addWaecValidationSchema } from '../../config/validationSchema';
import Compressor from 'compressorjs';
import DOMPurify from 'dompurify';

const AddSecurityCategory = () => {
  //context
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  //state
  const [logo, setLogo] = useState(null);
  const [voucherType, setVoucherType] = useState('');
  const [year, setYear] = useState(moment().format('YYYY'));

  const initialValues = {
    category: 'security',
    voucherType,
    price: 0,
    voucherURL: '',
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
  const onSubmit = (values, option) => {
    const isProtocolPresent = values.voucherURL?.includes('http');

    const newCategory = {
      category: values.category,
      voucherType: values.voucherType,
      price: DOMPurify.sanitize(values.price),
      details: {
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        logo,
      },
      year,
    };

    // console.log(newCategory);
    mutateAsync(newCategory, {
      onSettled: () => {
        option.setSubmitting(false);

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

  //Close Add Category
  const handleClose = () => {
    customDispatch({
      type: 'openAddSecurityCategory',
      payload: { open: false },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addWaecValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => {
        return (
          <Dialog
            maxWidth='xs'
            fullWidth
            TransitionComponent={Transition}
            open={customState.securityCategory.open}
            onClose={handleClose}
          >
            <DialogTitle>New Security Service </DialogTitle>
            <DialogContent>
              <div>
                <label htmlFor='cinema'>Upload Logo</label>
                <input
                  type='file'
                  id='profile'
                  accept='.png,.jpg,.jpeg,.webp'
                  onChange={handleUploadFile}
                />
              </div>
              <Stack rowGap={2} paddingY={2}>
                <Autocomplete
                  options={CATEGORY.security}
                  freeSolo
                  noOptionsText='No option avaiable'
                  value={voucherType || null}
                  onInputChange={(e, value) => setVoucherType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label='Security Service'
                      error={Boolean(touched.voucherType && errors.voucherType)}
                      helperText={touched.voucherType && errors.voucherType}
                    />
                  )}
                />

                <CustomYearPicker label='Year' year={year} setYear={setYear} />
                <TextField
                  type='number'
                  inputMode='decimal'
                  label='Price'
                  placeholder='Price here'
                  value={values.price}
                  onChange={handleChange('price')}
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
                  label='Security Service Website URL'
                  value={values.voucherURL}
                  onChange={handleChange('voucherURL')}
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

export default AddSecurityCategory;
