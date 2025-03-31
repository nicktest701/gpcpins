import {
  Avatar,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { currencyFormatter, IMAGES } from "../constants";
import moment from "moment";
import {
  ArrowDownward,
  ArrowDropDown,
  ArrowUpward,
  CircleRounded,
} from "@mui/icons-material";
import ClientMenu from "../components/menu/ClientMenu";
import _ from "lodash";
import MainDropdown from "../components/dropdowns/MainDropdown";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const PAGES = [
  {
    title: "Waec & SHS Placement Checker",
    category: "Waec Checker",
    note: "Note",
    type: "waec",
    route: "add-waec-checker",
  },
  {
    title: "University & Polytechnic Forms",
    category: "University",
    note: "Note",
    type: "university",
    route: "add-university-forms",
  },
  {
    title: "Security Service Forms",
    category: "Security Service",
    note: "Note",
    type: "security",
    route: "add-security-service",
  },
  {
    title: "Cinema/Event Tickets",
    category: "Cinema Ticket",
    note: "Note",
    type: "cinema",
    route: "add-cinema-tickets",
  },
  {
    title: "Stadium Tickets",
    category: "Stadium Ticket",
    note: "Note",
    type: "stadium",
    route: "add-stadia-tickets",
  },
  {
    title: "Bus Tickets",
    category: "Bus Ticket",
    note: "Note",
    type: "bus",
    route: "add-bus-tickets",
  },
];

export const MATCH_TYPE = [
  "FRIENDLY MATCH",
  "LEAGUE MATCH",
  "LEAGUE CUP",
  "LEAGUE CUP FINAL",
  "CUP FINAL",
  "CHARITY MATCH",
];

export const STADIUM_STANDS = [
  "RED STAND",
  "YELLOW STAND",
  "GREEN STAND",
  "VIP STAND",
  "VVIP STAND",
  "POPULAR STAND",
  "NORTH STAND",
  "SOUTH STAND",
  "EAST STAND",
  "WEST STAND",
];

export const CINEMA_TICKET_TYPE = [
  "REGULAR",
  "VIP",
  "VVIP",
  "STANDARD",
  "PREMIUM",
  "ECONOMY",
  "EXECUTIVE",
  "GOLD",
  "LUXURY",
  "ANNEX",
  "SOFA",
  "GALLERY",
  "BALCONY",
  "CHILD",
  "TEENS",
  "ADULT",
  "FAMILY",
  "STUDENT",
  "SENIOR",
];
export const WAEC_VOUCHER_PRICING = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
];

export const UNIVERSITY_FORM_TYPE = [
  "Undergraduate",
  "Postgraduate",
  "Distance Education",
  "Sandwich",
  "Evening",
  "Diploma",
  "Diploma Top Up",
];

export const shopRows = [
  {
    id: 1,
    title: "WAEC & SHS PLACEMENT CHECKERS",
    img: IMAGES.waec2,
    content:
      "Buy BECE,SSCE,NOV-DEC,GCE, School Placement,etc Checkers with ease and just a single click.",
    path: "waec-checker",
    delay: 50,
  },

  {
    id: 2,
    title: "UNIVERSITY,NURSING & POLYTECHNIC FORMS",
    img: IMAGES.university2,
    content:
      "Buy your application form and pursue your academic dreams and opportunities.",
    path: "university-form",
    delay: 100,
  },
  {
    id: 3,
    title: "SECURITY SERVICE FORMS",
    img: IMAGES.security_service2,
    content:
      "Step in a rewarding career in security with our comprehensive application forms.",
    path: "security-service",
    delay: 150,
  },
  {
    id: 4,
    title: "CINEMA & EVENT TICKETS",
    img: IMAGES.cinema_ticket,
    content: "Enjoy the latest movies,music shows,awards,etc with our tickets.",
    path: "cinema-ticket",
    delay: 200,
  },

  {
    id: 5,
    title: "BUS & TRAIN TICKETS",
    img: IMAGES.bus_ticket,
    content:
      "Buy your bus tickets and embark on a comfortable and a convenient journey.",
    path: "bus-ticket",
    delay: 200,
  },
  {
    id: 6,
    title: "STADIUM TICKETS",
    img: IMAGES.stadia_ticket,
    content:
      "Elevate  your sporting experiences with our exclusive stadium tickets.",
    path: "stadia-ticket",
    delay: 250,
  },
];

export const SALES_VOUCHERS = [
  {
    title: "WAEC & SHS Placement Checker",
    type: "waec",
  },
  {
    title: "University & Polytechnic Forms",
    type: "university",
  },
  {
    title: "Security Service Forms",
    type: "security",
  },
  {
    title: "Cinema Tickets",
    type: "cinema",
  },
  {
    title: "Stadium Tickets",
    type: "stadium",
  },
  {
    title: "Bus Tickets",
    type: "bus",
  },
];

export const SALES_TICKETS = [
  {
    title: "Cinema Tickets",
    type: "cinema",
  },
  {
    title: "Stadium Tickets",
    type: "stadium",
  },
  {
    title: "Bus Tickets",
    type: "bus",
  },
];

export const ORGANIZATION_PRODUCTS = [
  {
    id: 1,
    header: "Selling of Vouchers",
    products: [
      {
        id: 1,
        title: "WAEC &  PLACEMENT CHECKERS",
        img: IMAGES.waec2,
        content:
          "Buy WAEC  and School Placement Checkers with ease and just a single click.",
      },

      {
        id: 2,
        title: "UNIVERSITY & POLYTECHNIC FORMS",
        img: IMAGES.university2,
        content:
          "Buy your application form and ursue your academic dreams and opportunities.",
      },
      {
        id: 3,
        title: "SECURITY SERVICE FORMS",
        img: IMAGES.security_service2,
        content:
          "Step in a rewarding career in security with our comprehensive application forms.",
      },
    ],
  },
  {
    id: 2,
    header: "Selling of Tickets",
    products: [
      {
        id: 4,
        title: "CINEMA TICKETS",
        img: IMAGES.cinema_ticket,
        content:
          "Enjoy the latest GallyHood,Nollyhood,etc movies with our tickets.",
      },

      {
        id: 5,
        title: "BUS TICKETS",
        img: IMAGES.bus_ticket,
        content:
          "Buy your bus tickets and embark on a comfortable and a convenient journey.",
      },
      {
        id: 6,
        title: "STADIUM TICKETS",
        img: IMAGES.stadia_ticket,
        content: `Elevate  your sporting experiences with our exclusive stadium tickets.`,
      },
    ],
  },
];

export const checkerColumns = [
  {
    title: "ID",
    field: "id",
  },
  {
    title: "Voucher",
    field: "voucher",
  },
  {
    title: "Total",
    field: "total",
    type: "numeric",
  },
  {
    title: "New",
    field: "new",
    type: "numeric",
  },
  {
    title: "Sold",
    field: "sold",
    type: "numeric",
  },
  {
    title: "Used",
    field: "used",
    type: "numeric",
  },
  {
    title: "Expired",
    field: "expired",
    type: "numeric",
  },
];

export const voucherCategoryColumns = [
  {
    title: "#",
    field: "id",
    hidden: true,
  },
  {
    title: "Logo",
    field: "logo",
    render: ({ logo }) => {
      return (
        <Avatar
          variant="square"
          src={logo || null}
          sx={{ width: 30, height: 30 }}
        />
      );
    },
  },
  {
    title: "Voucher",
    field: "voucherType",
  },
  {
    title: "Category",
    field: "category",
  },
  {
    title: "Price",
    field: "price",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];
export const waecCategoryColumns = [
  {
    title: "#",
    field: "id",
    hidden: true,
  },
  {
    title: "Logo",
    field: "logo",
    render: ({ logo }) => {
      return (
        <Avatar variant="square" src={logo} sx={{ width: 30, height: 30 }} />
      );
    },
  },
  {
    title: "Voucher",
    field: "voucherType",
  },

  {
    title: "Category",
    field: "category",
    hidden: true,
  },
  {
    title: "Selling Price",
    field: "price",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  {
    field: "pricing",
    title: "Pricing",
    textAlign: "center",
    render: ({ pricing }) => (
      <Button
        size="small"
        className="dropdown-trigger"
        sx={{
          position: "relative",
        }}
        endIcon={<ArrowDropDown />}
      >
        Pricing
        <MainDropdown>
          <List sx={{ minWidth: 500 }}>
            {pricing?.length !== 0
              ? pricing?.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.type} checker(s) for ${currencyFormatter(
                        item?.price
                      )}`}
                      primaryTypographyProps={{
                        fontSize: 10,
                        color: "primary.main",
                        fontWeight: "bolder",
                      }}
                    />
                  </ListItem>
                ))
              : null}
          </List>
        </MainDropdown>
      </Button>
    ),
  },
];

export const VOUCHER_COLUMNS = [
  {
    title: "#",
    field: "_id",
    hidden: true,
  },
  {
    title: "Status",
    field: "status",
    render: ({ status }) => (
      <Chip
        variant="filled"
        color={
          status === "new" ? "success" : status === "sold" ? "info" : "error"
        }
        size="small"
        label={_.capitalize(status)}
        sx={{ color: "white" }}
      />
    ),
  },
  {
    title: "Voucher",
    field: "voucher",
  },
  {
    title: "Pin",
    field: "pin",
  },
  {
    title: "Serial",
    field: "serial",
  },
];

export const TICKETS_COLUMNS = [
  {
    title: "#",
    field: "_id",
    hidden: true,
  },
  {
    title: "Status",
    field: "status",
    render: ({ status }) => (
      <Chip
        variant="filled"
        color={
          status === "new"
            ? "success"
            : status === "sold"
            ? "info"
            : status === "used"
            ? "error"
            : "warning"
        }
        size="small"
        label={_.capitalize(status)}
        sx={{ color: "white" }}
      />
    ),
  },
  {
    title: "Voucher",
    field: "voucher",
  },
  {
    title: "Pin/Serial",
    field: "pin",
  },
  {
    title: "Type/Seat No.",

    render: ({ category, details }) => {
      return category === "bus"
        ? details?.seatNo
        : ["stadium", "cinema"].includes(category)
        ? details?.type
        : null;
    },
  },
];

export const universityCategoryColumns = [
  {
    title: "#",
    field: "id",
    hidden: true,
  },
  {
    title: "Logo",
    field: "logo",
    render: ({ logo }) => {
      return (
        <Avatar
          variant="square"
          src={logo || null}
          sx={{ width: 30, height: 30 }}
        />
      );
    },
  },
  {
    title: "University ",
    field: "voucherType",
  },
  {
    title: "Form Type",
    field: "formType",
    // hidden: true,
  },
  {
    title: "Category",
    field: "category",
  },
  {
    title: "Price",
    field: "price",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];

export const busTicketColumns = [
  {
    field: "id",
    title: "ID",
    hidden: true,
  },
  {
    field: "companyName",
    title: "Company",
  },
  {
    title: "Logo",
    field: "logo",
    render: ({ logo }) => {
      return (
        <Avatar
          variant="square"
          src={logo || null}
          sx={{ width: 30, height: 30 }}
        />
      );
    },
  },
  {
    field: "journey",
    title: "Route",
  },
  {
    title: "No. of Seats",
    field: "noOfSeats",
    type: "numeric",
  },
  {
    title: "Vehicle No.",
    field: "vehicleNo",
  },
  {
    field: "date",
    title: "Date/Time",
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      const date = moment(new Date(rowData.date)).format("dddd,LL");
      return date.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.date)).format("dddd,LL")}
        secondary={moment(new Date(rowData.time)).format("h:mm a")}
        primaryTypographyProps={{ fontSize: 12, color: "primary.main" }}
        secondaryTypographyProps={{ fontSize: 12, color: "error.main" }}
      />
    ),
  },
  {
    field: "price",
    title: "Fare",
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      const price = currencyFormatter(rowData.price);
      return price.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (rowData) => currencyFormatter(rowData.price),
  },
];
export const cinemaTicketColumns = [
  {
    field: "id",
    title: "ID",
    hidden: true,
  },
  {
    field: "companyName",
    title: "Company",
  },
  {
    field: null,
    title: "Movie Title",
    cellStyle: {
      textAlign: "left",
    },
    customFilterAndSearch: (data, rowData) => {
      return rowData?.movie.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (rowData) => {
      return (
        <Stack rowGap={1} justifyContent="flex-start" alignItems="flex-start">
          <Avatar
            variant="square"
            src={rowData?.details?.cinema}
            sx={{ width: 60, heignht: 60 }}
          />
          <p style={{ whiteSpace: "nowrap", fontSize: 12, fontWeight: "bold" }}>
            {rowData.movie}
          </p>
        </Stack>
      );
    },
  },
  {
    field: "theatre",
    title: "Theatre",
    render: (rowData) => (
      <ListItemText
        primary={rowData?.theatre}
        secondary={rowData?.location}
        primaryTypographyProps={{ fontSize: 12, color: "info.main" }}
        secondaryTypographyProps={{ fontSize: 12, color: "secondary.main" }}
      />
    ),
  },
  {
    field: "date",
    title: "Date/Time",
    customFilterAndSearch: (data, rowData) => {
      const date = moment(new Date(rowData.date)).format("dddd,LL");
      return date.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.date)).format("dddd,LL")}
        secondary={moment(new Date(rowData.time)).format("h:mm a")}
        primaryTypographyProps={{ fontSize: 12, color: "primary.main" }}
        secondaryTypographyProps={{ fontSize: 12, color: "error.main" }}
      />
    ),
  },
  {
    field: "pricing",
    title: "Pricing",
    textAlign: "center",
    render: ({ pricing }) => (
      <Button
        size="small"
        className="dropdown-trigger"
        sx={{
          position: "relative",
        }}
        endIcon={<ArrowDropDown />}
      >
        Pricing
        <MainDropdown>
          <List>
            {pricing?.length !== 0
              ? pricing?.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.type} (${item.quantity})`}
                      primaryTypographyProps={{
                        fontSize: 10,
                        color: "primary.main",
                        fontWeight: "bolder",
                      }}
                      secondary={currencyFormatter(item?.price)}
                      secondaryTypographyProps={{
                        fontSize: 10,
                      }}
                    />
                  </ListItem>
                ))
              : null}
          </List>
        </MainDropdown>
      </Button>
    ),
  },
];
export const stadiumTicketColumns = [
  {
    field: "id",
    title: "ID",
    hidden: true,
  },
  {
    field: "companyName",
    title: "Company",
  },
  {
    field: null,
    title: "Match",
    searchable: true,
    width: 300,
    customFilterAndSearch: (data, rowData) => {
      return rowData?.match.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (rowData) => {
      return (
        <Stack rowGap={1} justifyContent="flex-start" alignItems="flex-start">
          <Stack direction="row" spacing={2}>
            <Avatar
              src={rowData?.details?.homeImage}
              sx={{ width: 30, height: 30 }}
            />
            <Avatar
              src={rowData?.details?.awayImage}
              sx={{ width: 30, height: 30 }}
            />
          </Stack>
          <p style={{ whiteSpace: "wrap", fontSize: 14, fontWeight: "bold" }}>
            {rowData.match}
          </p>
        </Stack>
      );
    },
  },
  {
    field: "matchType",
    title: "Type",
  },

  {
    field: "stand",
    title: "Stands",
    textAlign: "center",
    render: ({ pricing }) => (
      <Button
        size="small"
        className="dropdown-trigger"
        sx={{
          position: "relative",
        }}
        endIcon={<ArrowDropDown className="main-dropdown-arrow" />}
      >
        Pricing
        <MainDropdown>
          <List>
            {pricing?.length !== 0
              ? pricing?.map((item) => (
                  <ListItem key={item.id}>
                    <ListItemText
                      primary={`${item.type} (${item.quantity})`}
                      primaryTypographyProps={{
                        fontSize: 10,
                        color: "primary.main",
                        fontWeight: "bolder",
                      }}
                      secondary={currencyFormatter(item?.price)}
                      secondaryTypographyProps={{
                        fontSize: 10,
                      }}
                    />
                  </ListItem>
                ))
              : null}
          </List>
        </MainDropdown>
      </Button>
    ),
  },
  {
    field: "venue",
    title: "Venue",
  },
  {
    field: "date",
    title: "Date/Time",
    searchable: true,
    cellStyle: {
      fontSize: 10,
    },
    customFilterAndSearch: (data, rowData) => {
      const date = moment(new Date(rowData.date)).format("dddd,LL");
      return date.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.date)).format("dddd,LL")}
        secondary={moment(new Date(rowData.time)).format("h:mm a")}
        primaryTypographyProps={{ fontSize: 12, color: "primary.main" }}
        secondaryTypographyProps={{ fontSize: 12, color: "error.main" }}
      />
    ),
  },
];

export const ROLE_LIST = ["Administrator", "Employee"];
export const CATEGORY_LIST = [
  { id: "waec", name: "WAEC Checkers & SHS Placement" },
  {
    id: "university",
    name: "University  Vouchers",
  },
  {
    id: "security",
    name: "Security Service Vouchers",
  },
  {
    id: "bus",
    name: "Bus Tickets",
  },
  {
    id: "stadium",
    name: "Stadium Tickets",
  },
  {
    id: "cinema",
    name: "Cinema Tickets",
  },
];

export const CLIENT_COLUMNS = [
  {
    title: "id",
    field: "_id",
    hidden: true,
  },
  {
    title: "Organization",
    field: "name",
  },
  {
    field: "active",
    title: "Status",
    export: false,
    render: ({ active }) => (
      <Button
        startIcon={
          <CircleRounded
            sx={{ color: active ? "green" : "red", width: 10, height: 10 }}
          />
        }
        sx={{
          backgroundColor: `color-mix(in oklab,${
            active ? "green" : "red"
          },white 85%)`,
          color: `color-mix(in oklab,${active ? "green" : "red"},black 15%)`,
        }}
      >
        {active ? "Active" : "Disabled"}
      </Button>
    ),
  },
  {
    title: "Location",
    field: "location",
  },
  {
    title: "Email Address",
    field: "email",
  },
  {
    title: "Telephone No.",
    field: "phonenumber",
  },
  {
    title: "Category",
    field: "category.name",
  },
  {
    field: "status",
    title: "Activation",
    export: false,
    render: ({ status }) => (
      <Chip
        variant="filled"
        color={status === "granted" ? "success" : "error"}
        size="small"
        label={status === "granted" ? "Granted" : "Pending"}
        sx={{ color: "#fff" }}
      />
    ),
  },
  {
    field: "",
    title: "",
    export: false,
    width: 40,
    render: (rowData) => <ClientMenu rowData={rowData} />,
  },
];

export const EMPLOYEES_COLUMNS = [
  {
    title: "id",
    field: "_id",
    hidden: true,
  },
  {
    field: "active",
    title: "Status",
    export: false,
    render: ({ active }) => (
      <Button
        startIcon={
          <CircleRounded
            sx={{ color: active ? "green" : "red", width: 10, height: 10 }}
          />
        }
        sx={{
          backgroundColor: `color-mix(in oklab,${
            active ? "green" : "red"
          },white 85%)`,
          color: `color-mix(in oklab,${active ? "green" : "red"},black 15%)`,
        }}
      >
        {active ? "Active" : "Disabled"}
      </Button>
    ),
  },

  {
    title: "Name",
    field: "fullname",
    hidden: true,
  },

  {
    title: "Employee",
    field: "",
    render: ({ fullname, profile }) => {
      return (
        <Stack justifyContent="center" alignItems="center" spacing={1}>
          <Avatar
            src={`${BASE_URL}/images/users/${profile}`}
            sx={{ width: 30, height: 30 }}
          />
          <Typography
            color="primary.main"
            textTransform="uppercase"
            whiteSpace="nowrap"
            variant="body2"
          >
            {fullname}
          </Typography>
        </Stack>
      );
    },
    customFilterAndSearch: (data, { fullname }) => {
      return fullname.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
  },
  {
    title: "Username",
    field: "username",
  },

  {
    title: "Email Address",
    field: "email",
  },
  {
    title: "Telephone No.",
    field: "phonenumber",
  },
  {
    title: "Role",
    field: "role",
  },
  // {
  //   field: '',
  //   title: 'Action',
  //   export: false,
  //   width: 40,
  //   render: (rowData) => <EmployeeMenu rowData={rowData} />,
  // },
];

export const BROADCAST_MESSAGES_COLUMNS = [
  {
    title: "ID",
    field: "_id",
    hidden: true,
  },
  {
    field: "createdAt",
    title: "Date of Issue",
    render: (rowData) => {
      const date = new Date(rowData?.createdAt).toDateString();
      const time = new Date(rowData?.createdAt).toLocaleTimeString();
      return (
        <ListItemText
          primary={date}
          primaryTypographyProps={{
            fontSize: 13,
            color: "primary.main",
          }}
          secondary={time}
          secondaryTypographyProps={{
            fontSize: 11,
          }}
        />
      );
    },
  },
  {
    title: "Recipient",
    field: "recipient",
  },

  {
    field: "type",
    title: "Type",
    export: true,
    render: ({ type }) => (
      <Chip
        label={type === "Email" ? "Email" : "SMS"}
        color={type === "Email" ? "primary" : "secondary"}
        size="small"
      />
    ),
  },

  {
    title: "Message",
    field: "body",
    render: (rowData) => {
      return (
        <ListItemText
          primary={rowData?.title}
          primaryTypographyProps={{
            fontSize: 13,
            color: "primary.main",
            fontWeight: "700",
          }}
          secondary={rowData?.body}
          secondaryTypographyProps={{
            fontSize: 12,
            width: "50ch",
          }}
        />
      );
    },
  },
];

export const recentTransactionColumns = [
  {
    title: "ID",
    field: "_id",
    hidden: true,
  },
  {
    title: "Date",
    field: "date",
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.createdAt)).format("Do MMM,YYYY")}
        secondary={moment(new Date(rowData.createdAt)).format("h:mm a")}
        primaryTypographyProps={{
          fontSize: 12,
          color: "primary.main",
        }}
        secondaryTypographyProps={{
          fontSize: 12,
          color: "error.main",
        }}
      />
    ),
  },
  {
    title: "Personal Info",
    field: "quantity",
    render: (rowData) => (
      <ListItemText
        primary={rowData?.email}
        secondary={rowData?.phonenumber}
        primaryTypographyProps={{
          fontSize: 12,
          color: "info.main",
        }}
        secondaryTypographyProps={{
          fontSize: 12,
          color: "secondary.main",
        }}
      />
    ),
  },
  {
    title: "Type",
    field: "domain",
  },
  {
    title: "Amount",
    field: "amount",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];

export const topCustomersColumns = [
  {
    title: "Telephone Number",
    field: "phonenumber",
  },
  {
    title: "Amount",
    field: "amount",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];

export const topSoldColumns = [
  {
    title: "Type",
    field: "type",
  },

  {
    title: "Sold Out",
    field: "count",
  },
];

export const airtimeTransactionsColumns = (type) => [
  {
    title: "Date",
    field: "createdAt",
    render: ({ createdAt }) => moment(createdAt).format("LLL"),
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      const date = moment(rowData.createdAt).format("LLL");
      return date.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
  },
  {
    title: "Status",
    field: "status",
    customFilterAndSearch: (data, rowData) => {
      return (
        rowData?.status?.toLowerCase().lastIndexOf(data.toLowerCase()) > -1
      );
    },
    render: ({ status, isProcessed }) => (
      <Button
        size="small"
        label={
          status === "completed" && Boolean(isProcessed)
            ? "Completed"
            : status === "refunded" && Boolean(isProcessed)
            ? "Refunded"
            : "Pending"
        }
        sx={{
          color: "#fff",
          bgcolor:
            status === "completed" && Boolean(isProcessed)
              ? "success.darker"
              : status === "refunded" && Boolean(isProcessed)
              ? "secondary.main"
              : "warning.darker",
          borderRadius: 1,
        }}
      >
        {status === "completed" && Boolean(isProcessed)
          ? "Completed"
          : status === "refunded" && Boolean(isProcessed)
          ? "Refunded"
          : "Pending"}
      </Button>
    ),
  },
  {
    title: "TRANSACTION Id",
    field: "_id",
    // hidden: true,
  },
  {
    title: "Domain",
    field: "domain",
  },
  {
    title: "Recipient",
    field: "recipient",
    render: (row) =>
      type === "single" ? (
        row?.recipient
      ) : (
        <Stack>
          {JSON.parse(row?.recipient).map((item) => (
            <small key={item?.recipient}>
              {item?.recipient}{" "}
              <b style={{ color: "var(--secondary)" }}>
                ({currencyFormatter(item?.price)})
              </b>
            </small>
          ))}
        </Stack>
      ),
  },

  {
    title: "Kind",
    field: "kind",
  },
  {
    title: "Email",
    field: "email",
  },
  {
    title: "Telephone Number",
    field: "phonenumber",
  },
  {
    title: "Amount",
    field: "amount",
    type: "currency",
    align: "center",
    cellStyle: {
      textAlign: "center",
    },
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];
export const transactionsColumns = (type) => [
  {
    title: "Date",
    field: "createdAt",
    render: ({ createdAt }) => moment(createdAt).format("LLL"),
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      const date = moment(rowData.createdAt).format("LLL");
      return date.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
  },
  {
    title: "Status",
    field: "status",
    render: ({ status }) => (
      <Button
        size="small"
        label={
          status === "completed"
            ? "Completed"
            : status === "refunded"
            ? "Refunded"
            : "Pending"
        }
        sx={{
          color: "#fff",
          bgcolor:
            status === "completed"
              ? "success.darker"
              : status === "refunded"
              ? "secondary.main"
              : "warning.darker",
          borderRadius: 1,
        }}
      >
        {status === "completed"
          ? "Completed"
          : status === "refunded"
          ? "Refunded"
          : "Pending"}
      </Button>
    ),
  },
  {
    title: "TRANSACTION Id",
    field: "_id",
    // hidden: true,
  },
  {
    title: "Domain",
    field: "domain",
  },
  {
    title: "Link",
    field: "downloadLink",
    hidden: true,
  },

  type === "Prepaid"
    ? {
        title: "Meter",
        field: "voucherType",
        render: (row) => row?.meter,
      }
    : type === "Bundle"
    ? {
        title: "Bundle Name",
        field: "kind",
      }
    : {
        title: "Voucher/Ticket",
        field: "voucherType",
        render: (row) => row?.voucherType,
      },
  type === "Bundle"
    ? { title: "Volume", field: "volume" }
    : {
        title: "Type",
        field: "type",
      },
  {
    title: "Email",
    field: "email",
  },
  {
    title: "Telephone Number",
    field: "phonenumber",
  },
  {
    title: "Amount",
    field: "amount",
    type: "currency",
    align: "center",
    cellStyle: {
      textAlign: "center",
    },
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
];

export const MOBILE_PROVIDER = [
  {
    id: "612db3be-2210-41fc-91d1-06573271df49",
    image: IMAGES.mtn_money,
    label: "MTN Money",
    value: "mtn-gh",
  },

  {
    id: "7827eb37-6b8c-40da-9503-8f3fc75a0daf",
    label: "Telecel Cash",
    value: "vodafone-gh",
    image: IMAGES.vodafone_cash,
  },
  {
    id: "915f26e2-e329-4f8c-9378-92cd90b0b4a2",
    label: "AirtelTigo Money",
    value: "tigo-gh",
    image: IMAGES.airtel_money,
  },
];

export const SERVICE_PROVIDER = [
  {
    id: "612db3be-2210-41fc-91d1-06573271df49",
    image: IMAGES.mtn,
    label: "MTN",
    value: "MTN",
  },

  {
    id: "7827eb37-6b8c-40da-9503-8f3fc75a0daf",
    label: "Telecel",
    value: "Vodafone",
    image: IMAGES.vodafone,
  },
  {
    id: "915f26e2-e329-4f8c-9378-92cd90b0b4a2",
    label: "AirtelTigo",
    value: "AirtelTigo",
    image: IMAGES.airtel,
  },
];

export const WALLET_TOPUP_TRANSACTIONS = [
  {
    title: "DATE",
    field: "createdAt",
    export: true,
    render: (rowData) => (
      <ListItemText
        primary={moment(new Date(rowData.createdAt)).format("Do MMM,YYYY")}
        secondary={moment(new Date(rowData.createdAt)).format("h:mm a")}
        primaryTypographyProps={{
          fontSize: 12,
          color: "primary.main",
        }}
        secondaryTypographyProps={{
          fontSize: 12,
          color: "info.main",
        }}
      />
    ),
  },
  {
    title: "STATUS",
    field: "status",
    render: ({ status }) => (
      <Button
        size="small"
        label={status === "failed" ? "Failed" : "Completed"}
        sx={{
          color: "white",
          bgcolor: status === "completed" ? "success.darker" : "error.darker",
          borderRadius: 1,
          p: 1,
        }}
      >
        {status === "failed" ? "Failed" : "Completed"}
      </Button>
    ),
  },
  {
    title: "ID",
    field: "_id",
    export: true,
  },
  { title: "COMMENT", field: "comment", hidden: true },
  {
    title: "TYPE",
    field: "type",
    render: (data) => {
      return (
        <Button
          startIcon={
            ["deposit", "refund"].includes(data?.type) ? (
              <ArrowUpward color="success" />
            ) : (
              <ArrowDownward color="error" />
            )
          }
          sx={{ color: "secondary.main" }}
        >
          {data?.comment}
        </Button>
      );
    },
  },
  {
    title: "AMOUNT",
    field: "amount",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  {
    title: "Details",
    export: false,
    render: (data) => {
      return (
        <Box>
          <ListItemText
            primary={data?.wallet}
            secondary={`${data?.type === "deposit" ? "+" : "-"} ${
              data?.amount
            }`}
            secondaryTypographyProps={{
              color: data?.type === "deposit" ? "success.main" : "error.main",
              fontWeight: "700",
            }}
          />
        </Box>
      );
    },
  },
];
