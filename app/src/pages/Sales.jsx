import {
  Autocomplete,
  Button,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Formik } from 'formik';
import _ from 'lodash';
import { useContext, useMemo, useState } from 'react';
import { CustomContext } from '../context/providers/CustomProvider';
import { SALES_VOUCHERS } from '../mocks/columns';
import { useQuery } from '@tanstack/react-query';
import { getCategoryByType } from '../api/categoryAPI';
import { currencyFormatter } from '../constants';
import { getCategoryData } from '../config/getCategoryData';
import { salesValidationSchema } from '../config/validationSchema';
import { getAvailbleBusSeats } from '../api/voucherAPI';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/providers/AuthProvider';
import CustomTitle from '../components/custom/CustomTitle';
import { MoneyRounded } from '@mui/icons-material';

const Sales = () => {
  const { user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const { customDispatch } = useContext(CustomContext);
  const [category, setCategory] = useState(SALES_VOUCHERS[0]);
  const [price, setPrice] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [pricingErr, setPricingErr] = useState('');

  const [pricingType, setPricingType] = useState({
    id: '',
    type: '',
    quantity: '',
    price: '',
  });
  const [voucherType, setVoucherType] = useState({
    id: '',
    voucherType: '',
    price: 0,
    pricing: [],
  });
  const [quantity, setQuantity] = useState(0);

  const vouchers = useQuery({
    queryKey: ['category', category.type],
    queryFn: () => getCategoryByType(category.type),
    enabled: !!category.type,
    select: (vouchers) => {
      if (vouchers?.length === 0) {
        return [];
      }

      return getCategoryData(vouchers);
    },
  });

  const availableBusSeats = useQuery({
    queryKey: ['available-seats', voucherType?.id],
    queryFn: () => getAvailbleBusSeats(voucherType?.id),
    enabled: category.type === 'bus' && !!voucherType?.id,
  });

  //Calculate total amount
  const grandTotal = useMemo(() => {
    let total = 0;
    if (['stadium', 'cinema'].includes(category.type)) {
      total = Number(pricingType?.price || 0) * Number(quantity);
      setPrice([
        {
          type: pricingType.type,
          price: pricingType.price,
          quantity: Number(quantity),
          total,
        },
      ]);
    } else if (category.type === 'waec') {
      total = Number(pricingType?.price);
    } else {
      total = Number(voucherType?.price || 0) * Number(quantity);
    }
    return total;
  }, [voucherType, pricingType, quantity, category]);

  const initialValues = {
    category: category.type,
    voucherType,
    pricing: price,
    quantity,
    totalAmount: grandTotal,
  };

  const onSubmit = (values) => {
    setPricingErr('');
    if (
      ['waec', 'cinema', 'stadium'].includes(values?.category) &&
      pricingType.id === ''
    ) {
      setPricingErr('No pricing selected!');
      return;
    }
    let paymentInfo = {};
    if (['waec', 'university', 'security'].includes(values?.category)) {
      paymentInfo = {
        category: values?.category,
        categoryId: values?.voucherType?.id,
        voucherType: values?.voucherType?.voucherType,
        price: values?.voucherType?.price,
        quantity:
          category.type === 'waec'
            ? pricingType.type
            : Number(values?.quantity),
        totalAmount: values?.totalAmount,
        user: {
          name: user?.name || 'Gabs',
          phoneNumber: user?.phonenumber,
          email: user?.email,
        },
        sales: true,
        path: pathname,
      };

      customDispatch({
        type: 'getVoucherPaymentDetails',
        payload: { open: true, data: paymentInfo },
      });
    }

    if (['cinema', 'stadium', 'bus'].includes(values?.category)) {
      let tickets = price;
      if (values?.category === 'bus') {
        tickets = _.map(
          _.take(availableBusSeats.data, values.quantity),
          'seatNo'
        );
      }

      paymentInfo = {
        category: values?.category,
        categoryId: values?.voucherType?.id,
        voucherType: values?.voucherType?.voucherType,
        paymentDetails: {
          tickets,
          quantity: Number(values?.quantity),
          totalAmount: values?.totalAmount,
        },
        totalAmount: values.totalAmount,
        quantity: Number(values?.quantity),
        user: {
          name: user?.name || 'Gabs',
          phoneNumber: user?.phonenumber,
          email: user?.email,
        },
        sales: true,
        path: pathname,
      };

      customDispatch({
        type: 'getTicketPaymentDetails',
        payload: { open: true, data: paymentInfo },
      });
    }
  };

  return (
    <>
      <Container sx={{ py: 2 }}>
        <CustomTitle
          icon={<MoneyRounded sx={{ width: 50, height: 50 }} color='primary' />}
          title='Sales'
          subtitle=' Explore,Book and Gift your tickets and vouchers into memorable
            moments by buying from us.'
        />

        <Container
          maxWidth='md'
          sx={{
            py: 5,
          }}
        >
          <Formik
            initialValues={initialValues}
            validationSchema={salesValidationSchema}
            enableReinitialize={true}
            onSubmit={onSubmit}
          >
            {({ errors, values, touched, handleSubmit, setFieldValue }) => {
              return (
                <Stack
                  spacing={2}
                  sx={{
                    bgcolor: '#fff',
                  }}
                >
                  <Typography
                    width='100%'
                    paragraph
                    color='#fff'
                    bgcolor='secondary.main'
                    p={1}
                  >
                    Choose Voucher & Ticket Type
                  </Typography>
                  <Autocomplete
                    options={SALES_VOUCHERS}
                    size='small'
                    disableClearable
                    clearText=' '
                    value={category}
                    onChange={(e, value) => {
                      setCategory(value);
                      setQuantity(1);
                      setVoucherType({
                        id: '',
                        voucherType: '',
                        price: 0,
                      });
                      setPricingType({ id: '', type: '', price: '' });
                      setPricing([]);
                      setPrice([]);
                    }}
                    noOptionsText='No Category available'
                    isOptionEqualToValue={(option, value) =>
                      value.type === undefined ||
                      value.type === '' ||
                      option.type === value.type
                    }
                    getOptionLabel={(option) => option.title || ''}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          label='Select Voucher Type'
                          size='small'
                          error={Boolean(touched?.category && errors?.category)}
                          helperText={touched?.category && errors?.category}
                        />
                      );
                    }}
                  />

                  <Autocomplete
                    options={vouchers?.data ? vouchers.data : []}
                    loading={vouchers.isLoading}
                    loadingText='loading Vouchers.Please wait...'
                    size='small'
                    disableClearable
                    clearText=' '
                    value={voucherType}
                    onChange={(e, value) => {
                      setQuantity(1);
                      setVoucherType(value);
                      setPricingType({ id: '', type: '', price: '' });

                      if (
                        ['waec', 'stadium', 'cinema'].includes(category.type)
                      ) {
                        setPricing(value?.pricing);
                      }
                    }}
                    noOptionsText='No Voucher available'
                    isOptionEqualToValue={(option, value) =>
                      value?.id === undefined ||
                      value?.id === '' ||
                      option?.id === value?.id
                    }
                    getOptionLabel={(option) => {
                      return ['cinema', 'stadium'].includes(category.type)
                        ? `${option?.voucherType}` || ''
                        : `${option?.voucherType} ${
                            option?.price
                              ? currencyFormatter(option?.price)
                              : ''
                          }` || '';
                    }}
                    renderInput={(params) => {
                      return (
                        <TextField
                          {...params}
                          label='Select Voucher / Ticket'
                          size='small'
                          error={Boolean(
                            touched?.voucherType?.id && errors?.voucherType?.id
                          )}
                          helperText={
                            touched?.voucherType?.id && errors?.voucherType?.id
                          }
                        />
                      );
                    }}
                  />

                  {['waec', 'stadium', 'cinema'].includes(category.type) && (
                    <Autocomplete
                      options={pricing}
                      size='small'
                      disableClearable
                      clearText=' '
                      value={pricingType}
                      onChange={(e, value) => {
                        setPricingType(value);
                        if (category.type === 'waec') {
                          setFieldValue('quantity', value.type);
                          setQuantity(value.type);
                        }
                        // console.log(value);
                      }}
                      noOptionsText='No Price available'
                      isOptionEqualToValue={(option, value) =>
                        value.id === undefined ||
                        value.id === '' ||
                        option.id === value.id
                      }
                      getOptionLabel={(option) =>
                        category.type === 'waec'
                          ? `${option?.type} ----- ${
                              option?.price
                                ? currencyFormatter(option?.price)
                                : ''
                            }` || ''
                          : `${option?.type} ----- ${
                              option?.price
                                ? currencyFormatter(option?.price)
                                : ''
                            }` || ''
                      }
                      renderInput={(params) => {
                        return (
                          <>
                            <TextField
                              {...params}
                              label='Pricing'
                              size='small'
                              error={Boolean(
                                touched?.category && errors?.category
                              )}
                              helperText={touched?.category && errors?.category}
                            />
                            {pricingErr && (
                              <small style={{ fontSize: 11, color: 'darkred' }}>
                                {pricingErr}
                              </small>
                            )}
                          </>
                        );
                      }}
                    />
                  )}

                  <TextField
                    size='small'
                    type='number'
                    inputMode='numeric'
                    variant='outlined'
                    label='Quantity'
                    InputProps={{
                      inputProps: { min: 1, max: 1000, maxLength: 4 },
                      readOnly: category?.type === 'waec',
                    }}
                    required
                    fullWidth
                    value={values.quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    error={Boolean(touched.quantity && errors.quantity)}
                    helperText={touched.quantity && errors.quantity}
                  />

                  <TextField
                    size='small'
                    variant='outlined'
                    placeholder='Total Amount'
                    label='Total Amount'
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position='start'>GH¢</InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position='end'>p</InputAdornment>
                      ),
                      readOnly: true,
                    }}
                    value={values.totalAmount}
                  />

                  <Stack spacing={1} paddingY={1}>
                    <Button
                      variant='contained'
                      onClick={handleSubmit}
                      sx={{ paddingY: '12px' }}
                    >
                      Purchase Now
                    </Button>
                  </Stack>
                </Stack>
              );
            }}
          </Formik>
        </Container>
      </Container>
      {/* Payment  */}
    </>
  );
};

export default Sales;
