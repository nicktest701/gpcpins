import _ from "lodash";
import {
  Button,
  Chip,
  ListItemText,
  Stack,
  Typography,
  LinearProgress,
} from "@mui/material";
import { currencyFormatter, IMAGES } from "../constants";
import moment from "moment";

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
          color: "info.main",
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
          color: "primary.main",
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
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
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
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    },
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

export const transactionsColumns = (type, airtimeType) => [
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
    render: ({ domain, status, isProcessed }) =>
      domain === "Airtime" ? (
        <Button
          size="small"
          label={
            status === "completed" && Boolean(isProcessed)
              ? "Completed"
              : "Pending"
          }
          sx={{
            color:
              status === "completed" && Boolean(isProcessed)
                ? "success.darker"
                : "warning.darker",
            bgcolor:
              status === "completed" && Boolean(isProcessed)
                ? "success.light"
                : "warning.light",
          }}
        >
          {status === "completed" && Boolean(isProcessed)
            ? "Completed"
            : "Pending"}
        </Button>
      ) : (
        <Button
          size="small"
          label={status === "pending" ? "Pending" : "Completed"}
          sx={{
            color: status === "pending" ? "warning.darker" : "success.darker",
            bgcolor:
              status === "pending" ? "warning.lighter" : "success.lighter",
          }}
        >
          {status === "pending" ? "Pending" : "Completed"}
        </Button>
      ),
  },
  {
    title: "Id",
    field: "_id",
    // hidden: true,
    width: 100,
  },
  {
    title: "Payment Reference ID",
    field: "reference",
    width: 100,
    cellStyle: {
      width: 100,
    },
  },
  ["All", "Airtime"].includes(type) && {
    title: "Kind",
    field: "kind",
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
  {
    title: type || "Recipient",
    field: "voucherType",
    render: (row) =>
      row?.domain === "Airtime" ? (
        row?.recipient?.length > 20 ? (
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
        ) : (
          row?.recipient
        )
      ) : (
        row?.voucherType || row?.meter
      ),
  },

  {
    title: "Type",
    field: "type",
  },

  {
    title: "Email",
    field: "email",
    hidden: true,
  },
  {
    title: "Telephone Number",
    field: "phonenumber",
    hidden: true,
  },

  {
    title: "Contact Info.",
    field: null,
    searchable: true,
    customFilterAndSearch: (data, { email, phonenumber }) => {
      return (
        email.toLowerCase().lastIndexOf(data.toLowerCase()) > -1 ||
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

export const airtimeTransactionsColumns = [
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
            : "Failed"
        }
        sx={{
          color: "white",
          bgcolor:
            status === "completed"
              ? "success.darker"
              : status === "refunded"
              ? "#000"
              : "error.darker",
          borderRadius: 1,
          p: 1,
        }}
      >
        {status === "completed"
          ? "Completed"
          : status === "refunded"
          ? "Refunded"
          : "Failed"}
      </Button>
    ),
  },
  {
    title: "Id",
    field: "_id",
    // hidden: true,
  },
  {
    title: "Payment Reference",
    field: "reference",
    // hidden: true,
  },
  {
    title: "Recipient",
    field: "recipient",
  },
  {
    title: "Provider",
    field: "provider",
  },
  {
    title: "Type",
    field: "type",
  },
  {
    title: "Details",
    field: "info.plan_name",
    export: true,
    render: ({ info }) => {
      return `
      ${info?.type || "N/A"}
      ${info?.plan_name || ""}
      ${info?.volume || ""}

      `;
    },
  },
  {
    title: "Total Amount",
    field: "amount",
    type: "currency",
    align: "center",
    cellStyle: {
      textAlign: "center",
    },
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    },
  },
  {
    title: "Commission",
    field: "commission",
    type: "currency",
    align: "center",
    cellStyle: {
      textAlign: "center",
    },
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    },
  },
  {
    title: "Payable Amount",
    field: "amt",
    type: "currency",
    align: "center",
    cellStyle: {
      textAlign: "center",
    },
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
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
    label: "Vodafone Cash",
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
    code: "4",
  },

  {
    id: "7827eb37-6b8c-40da-9503-8f3fc75a0daf",
    label: "Vodafone",
    value: "Vodafone",
    image: IMAGES.vodafone,
    code: "6",
  },
  {
    id: "915f26e2-e329-4f8c-9378-92cd90b0b4a2",
    label: "AirtelTigo",
    value: "AirtelTigo",
    image: IMAGES.airtel,
    code: "1",
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
    title: "Status",
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
    title: "TRANSACTION ID",
    field: "_id",
    export: true,
  },
  {
    title: "TYPE",
    field: null,
    render: (data) => _.capitalize(data?.type) || "Deposit",
  },
  {
    title: "Comment",
    field: "comment",
  },
  {
    title: "AMOUNT",
    field: "amount",
    type: "currency",
    currencySetting: {
      currencyCode: "GHS",
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    },
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
        sx={{
          color: "white",
          bgcolor: `${severity}.main`,
          borderRadius: 1,
          p: 1,
          textTransform: "uppercase",
        }}
      >
        {severity}
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
        email.toLowerCase().lastIndexOf(data.toLowerCase()) > -1 ||
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
