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
import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Formik } from 'formik';
import Compressor from 'compressorjs';

import { CustomContext } from '../../context/providers/CustomProvider';
import { postCategory } from '../../api/categoryAPI';
import { CATEGORY, currencyFormatter } from '../../constants';
import moment from 'moment';
import { globalAlertType } from '../../components/alert/alertType';
import Transition from '../../components/Transition';
import CustomYearPicker from '../../components/inputs/CustomYearPicker';
import { addWaecValidationSchema } from '../../config/validationSchema';
import { WAEC_VOUCHER_PRICING } from '../../mocks/columns';
import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import { Close } from '@mui/icons-material';

const AddWAECCategory = () => {
  //context
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  //state
  const [voucherType, setVoucherType] = useState('');
  const [logo, setLogo] = useState(null);
  const [year, setYear] = useState(moment().format('YYYY'));
  const [price, setPrice] = useState(0);
  const [pricingList, setPricingList] = useState([]);
  const [pricingError, setPricingError] = useState('');
  const [pricingType, setPricingType] = useState('');

  const initialValues = {
    category: 'waec',
    voucherType,
    sellingPrice: 0,
    voucherURL: '',
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: postCategory,
  });
  const onSubmit = (values, option) => {
    if (pricingList.length === 0) {
      setPricingError('Please add at least one ticket !');
      option.setSubmitting(false);
      return;
    }

    const isProtocolPresent = values.voucherURL?.includes('http');

    const newCategory = {
      category: values.category,
      voucherType: values.voucherType,
      price: values.sellingPrice,
      details: {
        price: values.sellingPrice,
        logo,
        voucherURL: isProtocolPresent
          ? values.voucherURL
          : `https://${values.voucherURL}`,
        pricing: pricingList,
      },
      year,
    };

    option.setSubmitting(false);

    mutateAsync(newCategory, {
      onSettled: () => {
        queryClient.invalidateQueries(['category']);
        queryClient.invalidateQueries(['client-categories']);
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
    customDispatch({ type: 'openAddWaecCategory', payload: { open: false } });
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

  const handleAddTicketType = () => {
    setPricingError('');
    if (pricingType?.trim() === '') {
      setPricingError('Required*');
      return;
    }

    const item = {
      id: uuid(),
      type: pricingType.toUpperCase(),
      price: Number(price),
    };
    setPricingList((prev) => {
      return _.values(_.merge(_.keyBy([...prev, item], 'type')));
    });

    setPricingError(' ');
    setPricingType('');
    setPrice(0);
  };

  const handleRemoveTicketType = (id) => {
    const filteredTickets = pricingList.filter((item) => item.id !== id);
    setPricingList(filteredTickets);
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
            maxWidth='sm'
            fullWidth
            TransitionComponent={Transition}
            open={customState.category.open}
            onClose={handleClose}
          >
            <DialogTitle>New WAEC Checker</DialogTitle>
            <DialogContent>
              <Stack rowGap={2} paddingY={2}>
                <Autocomplete
                  size='small'
                  options={CATEGORY.exams}
                  freeSolo
                  noOptionsText='No option avaiable'
                  value={voucherType || null}
                  onInputChange={(e, value) => setVoucherType(value)}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(props) => (
                    <TextField
                      {...props}
                      label='WAEC Checker'
                      error={Boolean(touched.voucherType && errors.voucherType)}
                      helperText={touched.voucherType && errors.voucherType}
                    />
                  )}
                />

                <CustomYearPicker label='Year' year={year} setYear={setYear} />

                <TextField
                  size='small'
                  type='number'
                  inputMode='decimal'
                  label='Selling Price'
                  placeholder='Price here'
                  value={values.sellingPrice}
                  onChange={handleChange('sellingPrice')}
                  error={Boolean(touched.sellingPrice && errors.sellingPrice)}
                  helperText={touched.sellingPrice && errors.sellingPrice}
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
                {/* Ticket type  */}
                {pricingError && (
                  <small
                    style={{
                      color: 'red',
                    }}
                  >
                    {pricingError}
                  </small>
                )}
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems='center'
                >
                  <Autocomplete
                    options={WAEC_VOUCHER_PRICING}
                    freeSolo
                    closeText=''
                    disableClearable
                    fullWidth
                    size='small'
                    noOptionsText='No Quantity available'
                    value={pricingType || ''}
                    onInputChange={(e, value) => setPricingType(value)}
                    isOptionEqualToValue={(option, value) =>
                      option.toString() === value.toString()
                    }
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        label='Quantity Pricing'
                        error={pricingError.trim() !== ''}
                      />
                    )}
                  />
                  <Typography color='primary'>FOR</Typography>
                  <TextField
                    size='small'
                    type='number'
                    inputMode='numeric'
                    label='Price'
                    placeholder='Price here'
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
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
                    error={Boolean(touched.price && errors.price)}
                    helperText={touched.price && errors.price}
                  />

                  <Button
                    variant='contained'
                    size='small'
                    onClick={handleAddTicketType}
                  >
                    Add
                  </Button>
                </Stack>
                {pricingList.length !== 0 && (
                  <List>
                    {pricingList?.map((item) => (
                      <ListItem key={item.id}>
                        <ListItemText
                          primary={`${
                            item.type
                          } Checker(s) for (${currencyFormatter(item?.price)})`}
                          primaryTypographyProps={{
                            fontSize: 11,
                            color: 'primary.main',
                            fontWeight: 'bolder',
                          }}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            color='primary'
                            size='small'
                            onClick={() => handleRemoveTicketType(item?.id)}
                          >
                            <Close />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}

                <TextField
                  size='small'
                  type='url'
                  inputMode='url'
                  label='WAEC Website URL'
                  value={values.voucherURL}
                  onChange={handleChange('voucherURL')}
                  error={Boolean(touched.voucherURL && errors.voucherURL)}
                  helperText={
                    errors.voucherURL
                      ? errors.voucherURL
                      : 'eg. www.example.com'
                  }
                />
                <div>
                  <label htmlFor='cinema'>Upload Logo</label>
                  <input
                    type='file'
                    id='logo'
                    accept='.png,.jpg,.jpeg,.webp'
                    onChange={handleUploadFile}
                  />
                </div>
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

export default AddWAECCategory;
