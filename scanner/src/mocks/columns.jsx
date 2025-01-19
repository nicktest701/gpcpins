import {
  Avatar,
  Button,
  Chip,
  ListItemText,
  Stack,
  Typography,
  LinearProgress,
  Box,
  IconButton,
} from "@mui/material";
import moment from "moment";
import { ChevronRight } from "@mui/icons-material";

import Active from "../components/Active";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";

export const ContactInfo = ({ email, phonenumber }) => {
  return (
    <Stack>
      <Typography variant="body2" color="info.main">
        {email}
      </Typography>
      <Typography variant="body2">{phonenumber}</Typography>
    </Stack>
  );
};

export const PAGES = [
  {
    title: "Cinema Tickets",
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

export const SALES_VOUCHERS = [
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

export const busTicketColumns = [
  {
    field: "id",
    title: "ID",
    hidden: true,
  },
  {
    field: "companyName",
    title: "Company",
    hidden: true,
  },
  {
    title: "Logo",
    field: "logo",
    hidden: true,
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
    hidden: true,
  },
  {
    title: "No. of Seats",
    field: "noOfSeats",
    type: "numeric",
    hidden: true,
  },
  {
    title: "Vehicle No.",
    field: "vehicleNo",
    hidden: true,
  },
  {
    field: "price",
    title: "Fare",
    hidden: true,
    searchable: true,
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
    cellStyle: {
      color: "green",
    },
  },
  {
    title: "Available Tickets",
    field: "movie",
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      return rowData?.movie.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (data) => {
      return (
        <Stack
          direction={{ xs: "column", md: "row" }}
          bgcolor="#fff"
          boxShadow="0 1px 2px rgba(0,0,0,0.1)"
          sx={{
            cursor: "pointer",
            p: 1,
            // animation: "all 300ms ease-in-out",
          }}
          alignItems="center"
        >
          <Avatar
            variant="square"
            src={data?.logo}
            sx={{ width: 80, height: 80 }}
          />
          <Stack
            p={2}
            width="100%"
            direction="row"
            justifyContent={{ xs: "flex-start", md: "space-between" }}
          >
            {/* text */}
            <Box>
              {/* <small>{data?.id}</small> */}
              <Typography variant="h6">{data?.journey}</Typography>
              <Typography
                variant="caption"
                color="success.dark"
                textTransform="uppercase"
                fontStyle="italic"
              >
                {data?.companyName}
              </Typography>
              <Typography variant="body2">
                <span> {data.vehicleNo}</span> |{" "}
                <span style={{ color: "var(--primary)" }}>
                  {data.noOfSeats} Seats
                </span>
              </Typography>
              <Typography variant="body2">
                {moment(new Date(data.date)).format("dddd,LL")} |
                <span style={{ color: "var(--primary)" }}>
                  {" "}
                  {moment(new Date(data.time)).format("h:mm a")}
                </span>
              </Typography>

              <Typography
                variant="body2"
                color="#aaa"
                width={{ xs: "40ch", md: "100%" }}
              >
                {data?.details?.description}
              </Typography>
            </Box>
            <Box>
              <Box alignSelf="flex-end">
                <Active active={data?.active} />
              </Box>
            </Box>
          </Stack>
        </Stack>
      );
    },
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
    hidden: true,
  },
  {
    field: null,
    title: "Movie Title",
    hidden: true,
  },
  {
    field: "theatre",
    title: "Theatre",
    hidden: true,
  },
  {
    field: "date",
    title: "Date/Time",
    hidden: true,
  },

  {
    title: "Available Tickets",
    field: "movie",
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      return rowData?.movie.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (data) => {
      return (
        <Stack
          direction={{ xs: "column", md: "row" }}
          bgcolor="#fff"
          boxShadow="0 1px 2px rgba(0,0,0,0.1)"
          sx={{
            cursor: "pointer",
            p: 1,
            // animation: "all 300ms ease-in-out",
          }}
          alignItems="center"
        >
          <Avatar
            variant="square"
            src={data?.details?.cinema}
            sx={{ width: 80, height: 80 }}
          />
          <Stack
            p={2}
            width="100%"
            direction="row"
            justifyContent={{ xs: "flex-start", md: "space-between" }}
          >
            {/* text */}
            <Box>
              {/* <small>{data?.id}</small> */}
              <Typography variant="h6">{data?.movie}</Typography>
              <Typography variant="body2">
                {moment(new Date(data.date)).format("dddd,LL")} |
                <span style={{ color: "var(--primary)" }}>
                  {" "}
                  {moment(new Date(data.time)).format("h:mm a")}
                </span>
              </Typography>
              <Typography
                variant="body2"
                color="#aaa"
                width={{ xs: "40ch", md: "100%" }}
              >
                {data?.details?.description}
              </Typography>
            </Box>
            <Box>
              {/* <Box alignSelf="flex-end">
                <ActionMenu>
                  <MenuItem
                    sx={{ fontSize: 13 }}
                    // onClick={() => handleOpenViewCategory(id)}
                  >
                    Assign Ticket
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: 13 }}
                    // onClick={() => handleOpenViewCategory(id)}
                  >
                    View Details
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: 13 }}
                    // onClick={() => removeCategory(id)}
                  >
                    Remove
                  </MenuItem>
                </ActionMenu>
              </Box> */}

              <Box alignSelf="flex-end">
                <Active
                  active={data?.active}
                  // handleOnClick={() => handleActivateCategory(id, active)}
                />
              </Box>
            </Box>
          </Stack>
        </Stack>
      );
    },
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
    hidden: true,
  },

  {
    field: "matchType",
    title: "Type",
    hidden: true,
  },

  {
    field: "venue",
    title: "Venue",
    hidden: true,
  },
  {
    field: "date",
    title: "Date/Time",
    hidden: true,
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
        primaryTypographyProps={{ color: "primary.main" }}
        secondaryTypographyProps={{ color: "info.main" }}
      />
    ),
  },

  {
    title: "Available Tickets",
    field: "match",
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      return rowData?.match.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
    },
    render: (data) => {
      return (
        <Stack
          direction={{ xs: "column", md: "row" }}
          bgcolor="#fff"
          boxShadow="0 1px 2px rgba(0,0,0,0.1)"
          sx={{
            cursor: "pointer",
            p: 1,
            // animation: "all 300ms ease-in-out",
          }}
          alignItems="center"
        >
          <Stack rowGap={1} justifyContent="flex-start" alignItems="flex-start">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={data?.details?.homeImage}
                sx={{ width: 80, height: 80 }}
              />
              <Typography>VS</Typography>
              <Avatar
                src={data?.details?.awayImage}
                sx={{ width: 80, height: 80 }}
              />
            </Stack>
          </Stack>
          <Stack
            p={2}
            width="100%"
            direction="row"
            justifyContent={{ xs: "flex-start", md: "space-between" }}
          >
            {/* text */}
            <Box>
              {/* <small>{data?.id}</small> */}
              <Typography variant="h6">{data?.match}</Typography>
              <Typography
                variant="caption"
                color="success.dark"
                textTransform="uppercase"
                fontStyle="italic"
              >
                {data?.companyName}
              </Typography>
              <Typography variant="body2">
                {moment(new Date(data.date)).format("dddd,LL")} |
                <span style={{ color: "var(--primary)" }}>
                  {" "}
                  {moment(new Date(data.time)).format("h:mm a")}
                </span>
              </Typography>
              <Typography
                variant="body2"
                color="#aaa"
                width={{ xs: "40ch", md: "100%" }}
              >
                {data?.details?.message}
              </Typography>
            </Box>

            <Box alignSelf="flex-end">
              <Active active={data?.active} />
            </Box>
          </Stack>
        </Stack>
      );
    },
  },
];

export const ROLE_LIST = ["Administrator", "Verifier"];

export const CATEGORY_LIST = [
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
          color: "primary.main",
          fontSize: 14,
        }}
        secondaryTypographyProps={{
          color: "info.main",
          fontSize: 14,
        }}
      />
    ),
  },
  {
    title: "Ticket",
    field: "voucherType",
  },
  {
    title: "Type",
    field: "type",
  },

  {
    title: "Verified By",
    field: "verifierName",
  },
];

export const topSoldColumns = [
  {
    title: "Type",
    field: null,
    render: ({ type, count }) => {
      return (
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <span>{type}</span>
            <span style={{ fontWeight: "bold", color: "var(--secondary)" }}>
              {count}
            </span>
          </Stack>
          <LinearProgress variant="determinate" value={count} />
        </Stack>
      );
    },
  },
];

export const EMPLOYEES_ROLES = [
  {
    title: "Vouchers & Tickets",
  },
  {
    title: "Pins & Serials",
    roles: [
      { title: "Generate Pins & Serials" },
      { title: "Export Pins & Serials" },
    ],
  },
  {
    title: "WAEC Checkers",
    roles: [
      { title: "Create new checkers" },
      { title: "Edit checkers" },
      { title: "Delete checkers" },
      { title: "Export checkers" },
      { title: "Load checkers pins & serials" },
      { title: "Delete checkers pins & serials" },
      { title: "Export checkers pins & serials" },
    ],
  },
  {
    title: "University & Polytechnic Forms",
    roles: [
      { title: "Create new forms" },
      { title: "Edit forms" },
      { title: "Delete forms" },
      { title: "Export forms" },
      { title: "Load forms pins & serials" },
      { title: "Delete forms pins & serials" },
      { title: "Export forms pins & serials" },
    ],
  },
  {
    title: "Security Service Forms",
    roles: [
      { title: "Create security service forms" },
      { title: "Edit security service forms" },
      { title: "Delete security service forms" },
      { title: "Export security service" },
      { title: "Load security service pins & serials" },
      { title: "Delete security service pins & serials" },
      { title: "Export security service pins & serials" },
    ],
  },
  {
    title: "Cinema Tickets",
    roles: [
      { title: "Create cinema tickets" },
      { title: "Edit cinema tickets" },
      { title: "Delete cinema tickets" },
      { title: "Export cinema tickets" },
      { title: "Load cinema tickets pins & serials" },
      { title: "Delete cinema tickets pins & serials" },
      { title: "Export cinema tickets pins & serials" },
    ],
  },
  {
    title: "Stadium Tickets",
    roles: [
      { title: "Create stadium tickets" },
      { title: "Edit stadium tickets" },
      { title: "Delete stadium tickets" },
      { title: "Export stadium tickets" },
      { title: "Load stadium tickets pins & serials" },
      { title: "Delete stadium tickets pins & serials" },
      { title: "Export stadium tickets pins & serials" },
    ],
  },
  {
    title: "Bus Tickets",
    roles: [
      { title: "Create bus tickets" },
      { title: "Edit bus tickets" },
      { title: "Delete bus tickets" },
      { title: "Export bus tickets" },
      { title: "Load bus tickets pins & serials" },
      { title: "Delete bus tickets pins & serials" },
      { title: "Export bus tickets pins & serials" },
    ],
  },

  {
    title: "Prepaid Units",
    roles: [
      { title: "View Meters" },
      { title: "View Prepaid Transaction" },
      { title: "Process Prepaid Transaction" },
      { title: "Export Prepaid Transaction" },
    ],
  },

  {
    title: "Airtime",
    roles: [
      { title: "View Bulk Airtime Transaction" },
      { title: "Process Bulk Airtime Transaction" },
      { title: "Export Bulk Airtime Transaction" },
    ],
  },

  {
    title: "Agents",
    roles: [
      { title: "Add new agents" },
      { title: "Edit agents" },
      { title: "Delete agents" },
      { title: "Export agents information" },
    ],
  },
  {
    title: "Employees",
    roles: [
      { title: "Add new employees" },
      { title: "Edit employees" },
      { title: "Delete employees" },
      { title: "Manage Roles & Permissions" },
      { title: "Export employees information" },
    ],
  },

  {
    title: "Users",
    roles: [
      { title: "Add new users" },
      { title: "Edit users" },
      { title: "Delete users" },
      { title: "Export users details" },
    ],
  },

  {
    title: "User Wallets",
    roles: [
      { title: "Topup user wallet amount" },
      { title: "View user wallet Transaction" },
      { title: "Export user wallet balance" },
      { title: "Export user wallet Transaction" },
    ],
  },

  {
    title: "Agent Wallets",
    roles: [
      { title: "Topup agent wallet amount" },
      { title: "View agent wallet Transaction" },
      { title: "Export agent wallet balance" },
      { title: "Export agent wallet Transaction" },
    ],
  },
  {
    title: "Messages",
    roles: [
      { title: "Create new messages" },
      { title: "Delete messages" },
      { title: "Export messages" },
    ],
  },

  {
    title: "Summary",
    roles: [
      { title: "View All Tickets & Voucher Transactions" },
      { title: "View All Prepaid Units Transactions" },
      { title: "View All Airtime Transactions" },
      { title: "View All Data Bundle Transactions" },
      { title: "View All Transactions" },
      { title: "Export Transactions" },
      { title: "View All Transactions Report" },
    ],
  },

  {
    title: "Settings",
    roles: [{ title: "Manage Modules" }],
  },
];

export const LOGS_COLUMNS = [
  { title: "ID", field: "_id", hidden: true },
  { title: "Modified At", field: "modifiedAt" },
  { title: "Activity", field: "title" },
  {
    title: "Severity",
    field: "severity",
    render: ({ severity }) => (
      <Button
        size="small"
        variant='outlined'
        color={`${severity}`}
        sx={{
          borderRadius: 1,
          p: 1,
          textTransform: "uppercase",
        }}
      >
        {severity === "error" ? "Danger" : severity}
      </Button>
    ),
  },
  { title: "User", field: "name" },
  {
    title: "Contact",
    field: null,
    searchable: true,
    customFilterAndSearch: (data, { email, phonenumber }) => {
      return (
        email?.toLowerCase().lastIndexOf(data.toLowerCase()) > -1 ||
        phonenumber.toLowerCase().lastIndexOf(data.toLowerCase()) > -1
      );
    },
    render: ({ email, phonenumber }) => {
      return (
        <Stack>
          <Typography variant="body2" color="info.main">
            {email}
          </Typography>
          <Typography variant="body2">{phonenumber}</Typography>
        </Stack>
      );
    },
  },

  {
    title: "Email Address",
    field: "email",
    hidden: true,
    export: true,
  },
  {
    title: "Telephone No.",
    field: "phonenumber",
    hidden: true,
    export: true,
  },
];
export const ASSIGNED_TICKET_COLUMNS = [
  { title: "ID", field: "_id", hidden: true },
  // { title: "Title", field: "title" },
  // { title: "Ticket", field: "type" },
  {
    title: "Ticket",
    field: "type",
    render: (data) => {
      return (
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="body2" color="secondary">
              {data?.voucherType}
            </Typography>
            <Typography variant="body2" textTransform="capitalize">
              {data?.categoryType}
            </Typography>
          </Box>
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            justifyContent="space-between"
          >
            <IconButton>
              <ChevronRight />
            </IconButton>
          </Stack>
        </Stack>
      );
    },
  },
];
export const RECENTLY_SCANNED_TICKET_COLUMNS = [
  { title: "Scanned On", field: "createdAt" },
  { title: "Ticket", field: "voucherType" },
  { title: "Type", field: "type" },
  { title: "Scanned By", field: "verifierName" },
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
            fontSize: 12,
          }}
        />
      );
    },
  },

  {
    title: "Message",
    field: "body",
    render: (rowData) => {
      return (
        <>
          {rowData?.type === "SMS" ? (
            <ListItemText
              primary={rowData?.title}
              primaryTypographyProps={{
                fontSize: 13,
                color: "primary.main",
                fontWeight: "700",
              }}
              secondary={rowData?.message}
              secondaryTypographyProps={{
                width: "50ch",
              }}
            />
          ) : (
            <div>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "primary.main",
                  fontWeight: "700",
                  overflow: "hidden", // Ensures the text doesn't overflow the container
                  textOverflow: "ellipsis", // Adds the ellipsis to the truncated text
                  display: "-webkit-box", // Use a flexbox model with block-level boxes
                  WebkitBoxOrient: "vertical", // Ensures that the flexbox layout is vertical          // Hides any text that overflows the container
                  WebkitLineClamp: 2,
                }}
              >
                {rowData?.title}
              </Typography>
              <div
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(rowData?.message),
                }}
                style={{
                  width: "30ch",
                  // whiteSpace: "nowrap", // Prevents the text from wrapping
                  overflow: "hidden", // Ensures the text doesn't overflow the container
                  textOverflow: "ellipsis", // Adds the ellipsis to the truncated text
                  display: "-webkit-box", // Use a flexbox model with block-level boxes
                  WebkitBoxOrient: "vertical", // Ensures that the flexbox layout is vertical          // Hides any text that overflows the container
                  WebkitLineClamp: 3, // Limits the text to 3 lines
                }}
              ></div>
            </div>
          )}
        </>
      );
    },
  },
  {
    title: "Status",
    field: "active",
    export: false,
    render: ({ active }) => (
      <Active
        active={active === 1}
        activeMsg="Delivered"
        inActiveMsg="Not Delivered"
      />
    ),
  },
];

export const TICKETS_COLUMNS = [
  { title: "ID", field: "_id", hidden: true },
  // { title: "Title", field: "title" },
  //  { title: "Ticket", field: "type" },
  {
    title: "Ticket",
    field: "type",
    cellStyle: {
      width: "80%",
      minWidth: 300,
    },
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      return (
        rowData?.voucherType.toLowerCase().lastIndexOf(data.toLowerCase()) >
          -1 ||
        rowData?.categoryType.toLowerCase().lastIndexOf(data.toLowerCase()) > -1
      );
    },
    render: (data) => {
      return (
        <Box>
          <Typography variant="body2" color="secondary">
            {data?.voucherType}
          </Typography>
          <Typography variant="body2" textTransform="capitalize">
            {data?.categoryType}
          </Typography>
          <Stack direction="row">
            {data?.type?.map((item) => (
              <Typography variant="caption" color="success.dark" key={item?.id}>
                -{item?.type}
              </Typography>
            ))}
          </Stack>
        </Box>
      );
    },
  },

  {
    title: "Assigned To",
    field: "verifierName",
    cellStyle: {
      minWidth: 200,
    },
    searchable: true,
    customFilterAndSearch: (data, rowData) => {
      return rowData?.verifierName.toLowerCase()?.includes(data.toLowerCase());
    },
    render: (data) => (
      <Link
        style={{
          color: "var(--primary)",
          // textDecoration: "none",
        }}
        to={`/verifiers/${data?.verifierId}/ticket-details/${data?._id}`}
      >
        {data?.verifierName}
      </Link>
    ),
  },
];
