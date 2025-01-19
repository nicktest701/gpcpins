import React, { useContext, useState } from 'react';
import moment from 'moment';
import _ from 'lodash';
import { LoadingButton } from '@mui/lab';
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
import { Formik } from 'formik';
import { CustomContext } from '../../context/providers/CustomProvider';
import { postCategory } from '../../api/categoryAPI';
import Transition from '../../components/Transition';
import CustomDatePicker from '../../components/inputs/CustomDatePicker';
import CustomTimePicker from '../../components/inputs/CustomTimePicker';
import { STADIUM_STANDS, MATCH_TYPE } from '../../mocks/columns';
import {
  Container,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
} from '@mui/material';
import { currencyFormatter } from '../../constants';
import { globalAlertType } from '../../components/alert/alertType';

import { Close } from '@mui/icons-material';
import CustomDialogTitle from '../../components/dialogs/CustomDialogTitle';
import { addStadiumValidationSchema } from '../../config/validationSchema';
import Compressor from 'compressorjs';
import { v4 as uuid } from 'uuid';
import DOMPurify from 'dompurify';

const AddStadiumCategory = () => {
  //context

  const queryClient = useQueryClient();
  const { customState, customDispatch } = useContext(CustomContext);

  const [matchType, setMatchType] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [homeTeamImage, setHomeTeamImage] = useState(null);
  const [awayTeamImage, setAwayTeamImage] = useState(null);
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [stand, setStand] = useState('');
  const [standError, setStandError] = useState('');
  const [standsList, setStandsList] = useState([]);
  const [venue, setVenue] = useState('');
  const [time, setTime] = useState(moment());
  const [date, setDate] = useState(moment());
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [message, setMessage] = useState('');

  const initialValues = {
    category: 'stadium',
    matchType,
    home,
    away,
    venue,
    date: date,
    time: time,
    message,
    companyName,
  };
  const handleHomeTeamFile = (e) => {
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
            setHomeTeamImage(ImageURL);
          };

          reader.readAsDataURL(data);
        },
      });
    }
  };

  const handleAwayTeamFile = (e) => {
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
            setAwayTeamImage(ImageURL);
          };

          reader.readAsDataURL(data);
        },
      });
    }
  };

  const handleAddStand = () => {
    if (stand?.trim() === '') {
      setStandError('No stand selected.');
      return;
    }

    const item = {
      id: uuid(),
      type: stand.toUpperCase(),
      quantity: parseInt(DOMPurify.sanitize(quantity)),
      price: DOMPurify.sanitize(price)
    };
    setStandsList((prev) => {
      return _.values(_.merge(_.keyBy([...prev, item], 'type')));
    });
    setStand('');
    setQuantity(0);
    setPrice(0);
  };

  const handleRemoveStand = (id) => {
    const filteredStands = standsList.filter((item) => item.id !== id);
    setStandsList(filteredStands);
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn:  postCategory,
  });
  const onSubmit = (values, options) => {
    setStandError('');
    if (standsList.length === 0) {
      setStandError('No stand selected.');
      options.setSubmitting(false);
      return;
    }

    const newMatchTicket = {
      category: values.category,
      voucherType: DOMPurify.sanitize(
        `${values.home} Vs ${values.away}(${values.matchType})`
      ),
      details: {
        matchType: DOMPurify.sanitize(values.matchType?.toUpperCase()),
        match: DOMPurify.sanitize(`${values.home} Vs ${values.away}`),
        homeImage: homeTeamImage,
        awayImage: awayTeamImage,
        home: DOMPurify.sanitize(values.home),
        away: DOMPurify.sanitize(values.away),
        pricing: standsList,
        venue: DOMPurify.sanitize(values.venue),
        quantity: parseInt(_.sumBy(standsList, 'quantity')),
        date: values.date,
        time: values.time,
        message: DOMPurify.sanitize(values.message),
        companyName: DOMPurify.sanitize(values.companyName),
      },
    };
   

    mutateAsync(newMatchTicket, {
      onSettled: () => {
        options.setSubmitting(false);
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
      type: 'openAddStadiumCategory',
      payload: { open: false },
    });
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={addStadiumValidationSchema}
      onSubmit={onSubmit}
      enableReinitialize={true}
    >
      {({ errors, touched, handleSubmit }) => {
        return (
          <Dialog
            maxWidth='md'
            fullWidth
            TransitionComponent={Transition}
            open={customState.stadiumCategory.open}
          >
            <CustomDialogTitle
              title='New Football Ticket'
              onClose={handleClose}
            />
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
                  <Autocomplete
                    size='small'
                    options={MATCH_TYPE}
                    freeSolo
                    closeText=''
                    disableClearable
                    noOptionsText='No match type available'
                    value={matchType || null}
                    onInputChange={(e, value) => setMatchType(value)}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(props) => (
                      <TextField
                        {...props}
                        label='Select match type'
                        error={Boolean(touched.matchType && errors.matchType)}
                        helperText={
                          touched.matchType && errors.matchType
                            ? errors.matchType
                            : 'eg.Friendly Match,Cup Final,League Match'
                        }
                      />
                    )}
                  />
                  <div>
                    <label htmlFor='homeTeam'>Home Team logo</label>
                    <input
                      type='file'
                      id='homeTeam'
                      onChange={(e) => handleHomeTeamFile(e)}
                      accept='.png,.jpg,.jpeg,.webp'
                    />
                  </div>

                  <TextField
                    size='small'
                    label='Home Team'
                    value={home}
                    onChange={(e) => setHome(e.target.value)}
                    error={Boolean(touched.home && errors.home)}
                    helperText={
                      touched.home && errors.home ? errors.home : 'eg. TeamA'
                    }
                  />
                  <div>
                    <label htmlFor='awayTeam'>Away Team logo</label>
                    <input
                      type='file'
                      id='awayTeam'
                      onChange={(e) => handleAwayTeamFile(e)}
                      accept='.png,.jpg,.jpeg,.webp'
                    />
                  </div>
                  <TextField
                    size='small'
                    label='Away Team'
                    value={away}
                    onChange={(e) => setAway(e.target.value)}
                    error={Boolean(touched.away && errors.away)}
                    helperText={
                      touched.away && errors.away ? errors.away : 'eg. TeamB'
                    }
                  />
                       <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Autocomplete
                      fullWidth
                      size='small'
                      options={STADIUM_STANDS}
                      freeSolo
                      closeText=''
                      disableClearable
                      noOptionsText='No stand available'
                      value={stand || ''}
                      onInputChange={(e, value) => setStand(value)}
                      isOptionEqualToValue={(option, value) => option === value}
                      renderInput={(props) => (
                        <TextField
                          {...props}
                          label='Select a stand'
                          error={standError.trim() !== ''}
                          helperText={standError}
                        />
                      )}
                    />
                    <TextField
                      size='small'
                      type='number'
                      inputMode='numeric'
                      label='Quantity'
                      placeholder='Quantity here'
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      error={Boolean(touched.quantity && errors.quantity)}
                      helperText={touched.quantity && errors.quantity}
                    />
                    <TextField
                      size='small'
                      type='number'
                      inputMode='decimal'
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
                      size='small'
                      variant='contained'
                      onClick={handleAddStand}
                    >
                      Add
                    </Button>
                  </Stack>

                  <List>
                    {standsList.length !== 0
                      ? standsList.map((item) => (
                          <ListItem key={item.id}>
                            <ListItemText
                              primary={`${item.type} (${item.quantity})`}
                              primaryTypographyProps={{
                                fontSize: 12,
                                color: 'primary.main',
                                fontWeight: 'bolder',
                              }}
                              secondary={currencyFormatter(item?.price)}
                            />

                            <ListItemSecondaryAction>
                              <IconButton
                                color='primary'
                                size='small'
                                onClick={() => handleRemoveStand(item?.id)}
                              >
                                <Close />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))
                      : null}
                  </List>

                  <TextField
                    size='small'
                    label='Venue'
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    error={Boolean(touched.venue && errors.venue)}
                    helperText={
                      touched.venue && errors.venue
                        ? errors.venue
                        : 'eg. Kumasi,Ghana'
                    }
                  />
                  <Stack direction='row' spacing={2}>
                    <CustomDatePicker
                      label='Date'
                      value={date}
                      setValue={setDate}
                      error={Boolean(touched.date && errors.date)}
                      helperText={touched.date && errors.date}
                    />
                    <CustomTimePicker
                      label='Time'
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
            <DialogActions>
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
                  Proceed
                </LoadingButton>
              </Container>
            </DialogActions>
          </Dialog>
        );
      }}
    </Formik>
  );
};

export default React.memo(AddStadiumCategory);
