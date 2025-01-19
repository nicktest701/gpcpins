import { Avatar, Chip, Container, ListItemText, Stack } from '@mui/material';
import { currencyFormatter } from '../constants';
import moment from 'moment';

export const MATCH_TYPE = [
  'FRIENDLY MATCH',
  'LEAGUE MATCH',
  'LEAGUE CUP',
  'LEAGUE CUP FINAL',
  'CUP FINAL',
  'CHARITY MATCH',
];

export const STADIUM_STANDS = [
  'RED STAND',
  'YELLOW STAND',
  'GREEN STAND',
  'VIP STAND',
  'VVIP STAND',
  'POPULAR STAND',
  'NORTH STAND',
  'SOUTH STAND',
  'EAST STAND',
  'WEST STAND',
];

export const UNIVERSITY_FORM_TYPE = [
  'Undergraduate',
  'Postgraduate',
  'Distance Education',
  'Sandwich',
  'Evening',
  'Diploma',
  'Diploma Top Up',
];

export const checkerColumns = [
  {
    title: '#',
    field: 'id',
  },
  {
    title: 'Checker',
    field: 'checker',
  },
  {
    title: 'Price',
    field: 'price',
  },
  {
    title: 'Total',
    field: 'total',
    type: 'numeric',
  },
  {
    title: 'Used',
    field: 'used',
    type: 'numeric',
  },
  {
    title: 'Available',
    field: 'available',
    type: 'numeric',
  },
];

export const VOUCHER_COLUMNS = [
  {
    title: '#',
    field: '_id',
    hidden: true,
  },
  {
    title: 'Voucher',
    field: 'voucher',
  },
  {
    title: 'Pin',
    field: 'pin',
  },
  {
    title: 'Serial',
    field: 'serial',
  },

  {
    title: 'Status',
    field: 'active',
    render: (rowData) => (
      <Chip
        variant='filled'
        color={rowData.active ? 'success' : 'error'}
        size='small'
        label={rowData.active ? 'Active' : 'Used'}
      />
    ),
  },
];

export const TICKETS_COLUMNS = [
  {
    title: '#',
    field: '_id',
    hidden: true,
  },
  {
    title: 'Voucher',
    field: 'voucher',
  },
  {
    title: 'Pin/Serial',
    field: 'pin',
  },

  {
    title: 'Status',
    field: 'active',
    render: (rowData) => (
      <Chip
        variant='filled'
        color={rowData.active ? 'success' : 'error'}
        size='small'
        label={rowData.active ? 'Active' : 'Used'}
      />
    ),
  },
];
export const MAIN_CATEGORY_COLUMNS = [
  {
    title: '#',
    field: '_id',
    hidden: true,
  },
  {
    title: 'Voucher Type',
    field: 'voucherType',
  },
  {
    title: 'Category',
    field: 'category',
  },
  {
    title: 'Year',
    field: 'year',
  },
  {
    title: 'Price',
    field: 'price',
    type: 'currency',
    currencySetting: {
      currencyCode: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];

export const CLIENT_UNIV_CATEGORY_COLUMNS = [
  {
    title: '#',
    field: '_id',
    hidden: true,
  },
  {
    title: 'Voucher Type',
    field: 'voucherType',
  },
  {
    title: 'Form Type',
    field: 'formType',
    hidden: true,
  },
  {
    title: 'Category',
    field: 'category',
  },
  {
    title: 'Year',
    field: 'year',
  },

  {
    title: 'Price',
    field: 'price',
    type: 'currency',
    currencySetting: {
      currencyCode: 'GHS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];

export const CLIENT_BUS_COLUMNS = [
  {
    field: 'id',
    title: 'ID',
    hidden: true,
  },
  {
    field: 'journey',
    title: 'Journey',
  },
  {
    field: 'date',
    title: 'Date/Time',
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.date)).format('dddd,Do MMMM YYYY')}
        secondary={moment(new Date(rowData.time)).format('h:mm a')}
      />
    ),
  },
  {
    field: 'price',
    title: 'Fare',
    render: (rowData) => currencyFormatter(rowData.price),
  },
];
export const CLIENT_CINEMA_COLUMNS = [
  {
    field: 'id',
    title: 'ID',
    hidden: true,
  },
  {
    field: 'movie',
    title: 'Movie Title',
    render: (rowData) => (
      <Stack
        // direction='row'
        rowGap={1}
        justifyContent='flex-start'
        alignItems='center'
      >
        <Avatar
          variant='square'
          src={
            rowData.profile === undefined || rowData.profile === ''
              ? null
              : `${import.meta.env.VITE_BASE_URL}/images/client/cinema/${
                  rowData.profile
                }`
          }
          sx={{
            width: 80,
            height: 80,
          }}
        />
        {rowData.movie}
      </Stack>
    ),
  },
  {
    field: 'theatre',
    title: 'Theatre',
    render: (rowData) => (
      <ListItemText primary={rowData?.theatre} secondary={rowData?.location} />
    ),
  },
  {
    field: 'date',
    title: 'Date',
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.date)).format('dddd,Do MMMM YYYY')}
        secondary={moment(new Date(rowData.time)).format('h:mm a')}
      />
    ),
  },
  {
    field: 'price',
    title: 'Price',
    render: (rowData) => currencyFormatter(rowData.price),
  },
];
export const CLIENT_STADIUM_COLUMNS = [
  {
    field: 'id',
    title: 'ID',
    hidden: true,
  },
  {
    field: 'matchType',
    title: 'Type',
  },
  {
    field: 'match',
    title: 'Match',
  },
  {
    field: 'stand',
    title: 'Stand',
    textAlign: 'center',
    render: ({ stands }) => {
      return (
        <Container
          maxWidth='sm'
          sx={{
            // display: { xs: 'none', sm: 'flex' },
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {stands !== undefined && stands?.length !== 0
            ? stands.map((item) => (
                <Chip
                  key={item?.id}
                  variant='outlined'
                  color='primary'
                  label={`${item?.stand}-${currencyFormatter(item?.price)}`}
                  size='small'
                  sx={{
                    fontSize: 10,
                  }}
                />
              ))
            : null}
        </Container>
      );
    },
  },
  {
    field: 'venue',
    title: 'Venue',
  },
  {
    field: 'date',
    title: 'Date',
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.date)).format('dddd,Do MMMM YYYY')}
        secondary={moment(new Date(rowData.time)).format('h:mm a')}
      />
    ),
  },
  // {
  //   field: "price",
  //   title: "Price",
  //   render: (rowData) => currencyFormatter(rowData.price),
  // },
];

export const CATEGORY_LIST = [
  { id: 'waec', name: 'WAEC Checkers & SHS Placement' },
  {
    id: 'university',
    name: 'University  Vouchers',
  },
  {
    id: 'security',
    name: 'Security Service Vouchers',
  },
  {
    id: 'bus',
    name: 'Bus Tickets',
  },
  {
    id: 'stadium',
    name: 'Stadium Tickets',
  },
  {
    id: 'cinema',
    name: 'Cinema Tickets',
  },
];

export const CLIENT_COLUMNS = [
  {
    title: 'id',
    field: '_id',
    hidden: true,
  },
  {
    title: 'Organization',
    field: 'name',
  },
  {
    title: 'Location',
    field: 'location',
  },
  {
    title: 'Email Address',
    field: 'email',
  },
  {
    title: 'Telephone No.',
    field: 'phonenumber',
  },
  {
    title: 'Category',
    field: 'category.name',
  },
];
