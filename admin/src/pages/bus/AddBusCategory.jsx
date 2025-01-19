import { useContext, useState } from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Dompurify from 'dompurify';
import { Formik } from 'formik';
import { CustomContext } from '../../context/providers/CustomProvider';
import { postCategory } from '../../api/categoryAPI';
import CustomTimePicker from '../../components/inputs/CustomTimePicker';
import CustomDatePicker from '../../components/inputs/CustomDatePicker';
import moment from 'moment';
import { globalAlertType } from '../../components/alert/alertType';
import { TOWNS } from '../../mocks/towns';
import { addBusValidationSchema } from '../../config/validationSchema';
import CustomDialogTitle from '../../components/dialogs/CustomDialogTitle';
import Compressor from 'compressorjs';
import { Container } from '@mui/material';

const AddBusCategory = () => {
  //context
  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);
 
  const [logo, setLogo] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [price, setPrice] = useState(Number(0));
  const [report, setReport] = useState(moment());
  const [time, setTime] = useState(moment());
  const [date, setDate] = useState(moment());
  const [vehicleNo, setVehicleNo] = useState('');
  const [noOfSeats, setNoOfSeats] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [message, setMessage] = useState('');

  const initialValues = {
    category: 'bus',
    price,
    origin,
    destination,
    vehicleNo,
    noOfSeats,
    date,
    report,
    time,
    message,
    companyName,
  };

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
    mutationFn:  postCategory,
  });
  const onSubmit = (values, option) => {
    const newBusTicket = {
      category: values.category,
      voucherType: `${origin} to ${destination}`,
      price: values.price,
      details: {
        origin: Dompurify.sanitize(origin),
        destination: Dompurify.sanitize(destination),
        vehicleNo: Dompurify.sanitize(values?.vehicleNo?.toUpperCase()),
        noOfSeats: parseInt(Dompurify.sanitize(values.noOfSeats)),
        date: values.date,
        report: values.report,
        time: values.time,
        message: Dompurify.sanitize(values.message),
        companyName: Dompurify.sanitize(values.companyName),
        logo,
      },
    };

   
    mutateAsync(newBusTicket, {
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
    option.setSubmitting(false);
  };

  ///Close Add Category
  const handleClose = () => {
    customDispatch({ type: 'openAddBusCategory', payload: { open: false } });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addBusValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, handleSubmit }) => {
        return (
          <Dialog maxWidth='md' fullWidth open={customState.busCategory.open}>
            <CustomDialogTitle title='New Bus Ticket' onClose={handleClose} />
            <DialogContent>
              <Container maxWidth='md'>
                <Stack rowGap={2} paddingY={2}>
                  <TextField
                    size='small'
                    label='Company'
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    error={Boolean(touched.companyName && errors.companyName)}
                    helperText={touched.companyName && errors.companyName}
                  />
                  <div>
                    <label htmlFor='cinema'>Upload Bus Image</label>
                    <input
                      type='file'
                      id='profile'
                      accept='.png,.jpg,.jpeg,.webp'
                      onChange={handleUploadFile}
                    />
                  </div>
                  <Autocomplete
                    options={TOWNS}
                    freeSolo
                    closeText=''
                    disableClearable
                    fullWidth
                    loadingText='Please wait...'
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === null ||
                      value === '' ||
                      option === value
                    }
                    getOptionLabel={(option) => option || ''}
                    value={origin}
                    onChange={(e, value) => setOrigin(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size='small'
                        label='Origin(From)'
                        error={Boolean(touched.origin && errors.origin)}
                        helperText={
                          touched.origin && errors.origin
                            ? errors.origin
                            : 'eg. Kumasi'
                        }
                      />
                    )}
                  />

                  {/* Destination  */}
                  <Autocomplete
                    options={TOWNS}
                    freeSolo
                    closeText=''
                    disableClearable
                    fullWidth
                    loadingText='Please wait...'
                    isOptionEqualToValue={(option, value) =>
                      value === undefined ||
                      value === null ||
                      value === '' ||
                      option === value
                    }
                    getOptionLabel={(option) => option || ''}
                    value={destination}
                    onChange={(e, value) => setDestination(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size='small'
                        label='Destination(To)'
                        error={Boolean(
                          touched.destination && errors.destination
                        )}
                        helperText={
                          touched.destination && errors.destination
                            ? errors.destination
                            : 'eg. Cape Coast'
                        }
                      />
                    )}
                  />
                  <Stack direction='row' spacing={2}>
                    <TextField
                      size='small'
                      label='Vehicle Registration Number'
                      value={vehicleNo}
                      fullWidth
                      onChange={(e) => setVehicleNo(e.target.value)}
                      error={Boolean(touched.vehicleNo && errors.vehicleNo)}
                      helperText={touched.vehicleNo && errors.vehicleNo}
                    />
                    <TextField
                      size='small'
                      label='Number Of Seats'
                      value={noOfSeats}
                      fullWidth
                      onChange={(e) => setNoOfSeats(e.target.value)}
                      error={Boolean(touched.noOfSeats && errors.noOfSeats)}
                      helperText={touched.noOfSeats && errors.noOfSeats}
                    />
                  </Stack>

                  <TextField
                    size='small'
                    type='number'
                    inputMode='decimal'
                    label='Fare'
                    fullWidth
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

                  <CustomDatePicker
                    label='Departure Date'
                    value={date}
                    setValue={setDate}
                    error={Boolean(touched.date && errors.date)}
                    helperText={touched.date && errors.date}
                  />
                  <Stack direction='row' spacing={2}>
                    <CustomTimePicker
                      label='Boarding Time'
                      value={report}
                      setValue={setReport}
                      error={Boolean(touched.report && errors.report)}
                      helperText={touched.report && errors.report}
                    />
                    <CustomTimePicker
                      label='Departure Time'
                      value={time}
                      setValue={setTime}
                      error={Boolean(touched.time && errors.time)}
                      helperText={touched.time && errors.time}
                    />
                  </Stack>
                  <TextField
                    size='small'
                    label='Message'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    error={Boolean(touched.message && errors.message)}
                    helperText={touched.message && errors.message}
                  />
                </Stack>
              </Container>
            </DialogContent>
            <DialogActions sx={{ padding: 1 }}>
              <Container
                maxWidth='md'
                sx={{ display: 'flex', justifyContent: 'flex-end' }}
              >
                <Button onClick={handleClose}>Cancel</Button>
                <LoadingButton
                  variant='contained'
                  loading={isLoading}
                  onClick={handleSubmit}
                >
                  Add Ticket
                </LoadingButton>
              </Container>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default AddBusCategory;
