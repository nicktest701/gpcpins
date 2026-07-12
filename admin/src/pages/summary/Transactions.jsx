import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  Divider,
  Grid,
  Chip,
  useTheme,
  alpha,
  Collapse,
  IconButton,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { transactionsColumns } from "../../mocks/columns";
import ActionMenu from "../../components/menu/ActionMenu";
import _ from "lodash";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getTransactionReport,
  getTransactions,
} from "../../api/transactionAPI";
import { useContext, useEffect, useMemo, useState } from "react";
import { resendVoucherORReceipt } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { currencyFormatter } from "../../constants";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import CustomTotal from "../../components/custom/CustomTotal";
import { NoteRounded, FilterList, Close } from "@mui/icons-material";
import CustomTitle from "../../components/custom/CustomTitle";
import { getAllEmployees } from "../../api/employeeAPI";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import DateRangePicker from "@/components/pickers/DateRangePicker";
import TransactionPreviewDialog from "@/components/dialogs/TransactionPreviewDialog";
import Swal from "sweetalert2";
import TransactionStatus from "@/components/modals/TransactionStatus";

const startDate = moment("2024-01-01").toDate();
const endDate = moment().toDate();

function Transactions() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);
  const [showRange, setShowRange] = useState(false);
  const [sortValue, setSortValue] = useState("all");
  const [users, setUsers] = useState("All");
  const [type, setType] = useState("All");
  const [airtimeType, setAirtimeType] = useState("single");
  const [date, setDate] = useState([{ startDate, endDate, key: "selection" }]);
  const [filterOpen, setFilterOpen] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Reset sort when range toggled
  useEffect(() => {
    if (showRange) {
      setSortValue("none");
    } else {
      setDate([{ startDate, endDate, key: "selection" }]);
    }
  }, [showRange]);

  // Fetch employees for issuer filter
  // const transactionUsers = useQuery({
  //   queryKey: ["employees"],
  //   queryFn: () => getAllEmployees("search"),
  //   initialData: [],
  // });

  // Fetch transactions
  const transactions = useQuery({
    queryKey: ["products-transactions", sortValue, date[0]],
    queryFn: () => getTransactions({ date: date[0], sort: sortValue }),
    enabled: !!sortValue,
    initialData: [],
  });

  // Filter transactions
  const sortedTransactions = useMemo(() => {
    let modified = transactions.data;

    if (type !== "All") {
      if (type === "airtime") {
        modified = modified?.filter(
          (item) => item.service === type && item.kind === airtimeType,
        );
      } else {
        modified = modified?.filter((item) => item.service === type);
      }
    }

    if (users !== "All" && ["All", "airtime", "prepaid"].includes(type)) {
      modified = modified?.filter((item) => item.issuer === users);
    }

    return modified || [];
  }, [transactions.data, type, airtimeType, users]);

  // Actions
  const handleDownload = async (id, downloadLink) => {
    const link = document.createElement("a");
    link.href = downloadLink;
    link.target = "_blank";
    link.download = `${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { mutateAsync: resendMutate, isLoading: resendLoading } = useMutation({
    mutationFn: resendVoucherORReceipt,
    onSuccess: () => customDispatch(globalAlertType("info", "Done!")),
    onError: () =>
      customDispatch(globalAlertType("error", "An error has occurred!")),
  });

  const handleResend = (data) => {
    Swal.fire({
      title: `Resend ${data?.service}?`,
      text: `Are you sure you want to resend the ${data?.service} to ${data.phonenumber || "the customer"}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, resend it",
      cancelButtonText: "Cancel",
      confirmButtonColor: theme.palette.primary.main,
      cancelButtonColor: theme.palette.grey[500],
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        resendMutate(data);
      }
    });
  };

  const handleCheckStatus = (refId, service) => {
    setSearchParams((params) => {
      params.set("payment_reference", refId);
      params.set("type", service);
      params.set("open", true);
      return params;
    });
  };

  // Report generation
  const reportMutate = useMutation({
    mutationFn: getTransactionReport,
    onSuccess: () => customDispatch(globalAlertType("info", "Done!")),
    onError: () =>
      customDispatch(globalAlertType("error", "An error has occurred!")),
  });

  const handleGenerateReport = () => {
    reportMutate.mutateAsync({
      ...date[0],
      type,
      transactions: { transactions: sortedTransactions },
    });
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setPreviewOpen(true);
  };

  const handlePreviewClose = () => {
    setPreviewOpen(false);
    setSelectedTransaction(null);
  };

  const totalAmount = useMemo(
    () => _.sumBy(sortedTransactions, (item) => Number(item?.amount)),
    [sortedTransactions],
  );

  // Table columns with actions
  const modifiedColumns = [
    ...transactionsColumns(type),
    {
      field: "",
      title: "Action",
      export: false,
      render: (data) => (
        <ActionMenu>
          <MenuItem
            sx={{ fontSize: 13 }}
            onClick={() => handleViewTransaction(data)}
          >
            View
          </MenuItem>
          {data?.mode === "Mobile Money" && (
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => handleCheckStatus(data?.reference, data?.service)}
            >
              Check Status
            </MenuItem>
          )}
          {["voucher", "ticket"].includes(data?.service) &&
            data?.status === "completed" && (
              <>
                <MenuItem
                  sx={{ fontSize: 13 }}
                  onClick={() =>
                    handleResend({
                      id: data.id,
                      service: data?.service,
                      phonenumber: data?.phonenumber,
                    })
                  }
                >
                  Resend
                </MenuItem>
                <MenuItem
                  sx={{ fontSize: 13 }}
                  onClick={() => handleDownload(data.id, data.downloadLink)}
                >
                  Download
                </MenuItem>
              </>
            )}
        </ActionMenu>
      ),
    },
  ];

  // Loading & error alerts
  const showAlert =
    resendLoading ||
    transactions.isLoading ||
    transactions.isError ||
    reportMutate.isLoading ||
    reportMutate.isError ||
    reportMutate.isSuccess;

  return (
    <>
      <CustomTitle
        title="Transactions"
        subtitle="Review and View recent and past transactions and manage your financial records."
      />

      {/* Status Alerts */}
      {showAlert && (
        <Stack spacing={1} sx={{ mb: 2 }}>
          {resendLoading && (
            <Alert severity="info">Resending receipt to customer...</Alert>
          )}
          {transactions.isLoading && (
            <Alert severity="info">Loading Transactions. Please wait...</Alert>
          )}
          {transactions.isError && (
            <Alert severity="error">{transactions.error}</Alert>
          )}
          {reportMutate.isLoading && (
            <Alert severity="info">Generating Report. Please wait...</Alert>
          )}
          {reportMutate.isError && (
            <Alert severity="error">
              Report Generation failed. An error has occurred
            </Alert>
          )}
          {reportMutate.isSuccess && reportMutate.data && (
            <Alert severity="success">
              {reportMutate.data === "No data found" ? (
                "No transactional report found!"
              ) : (
                <>
                  A copy of the report has been sent to your email. Download or
                  View Report{" "}
                  <a href={reportMutate.data} target="_blank" rel="noreferrer">
                    here
                  </a>
                </>
              )}
            </Alert>
          )}
        </Stack>
      )}

      {/* Summary Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", md: "center" },
          gap: 2,
        }}
      >
        <CustomTotal
          title="Total Transactions"
          total={currencyFormatter(totalAmount)}
        />
        <Stack direction="row" spacing={2} alignItems="center">
          <LoadingButton
            variant="contained"
            endIcon={<NoteRounded />}
            onClick={handleGenerateReport}
            loading={reportMutate.isLoading}
            disabled={reportMutate.isLoading || sortedTransactions.length === 0}
            sx={{ borderRadius: 2, textTransform: "none" }}
          >
            Generate Report
          </LoadingButton>
        </Stack>
      </Paper>

      {/* Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="subtitle1" fontWeight="600">
            Filters
          </Typography>
          <IconButton size="small" onClick={() => setFilterOpen(!filterOpen)}>
            {filterOpen ? (
              <Close fontSize="small" />
            ) : (
              <FilterList fontSize="small" />
            )}
          </IconButton>
        </Stack>
        <Collapse in={filterOpen}>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm="auto">
              <FormControlLabel
                label="Use Range"
                control={
                  <Checkbox
                    checked={showRange}
                    onChange={() => setShowRange(!showRange)}
                  />
                }
              />
            </Grid>
            <Grid item xs={12} sm="auto">
              {showRange ? (
                <DateRangePicker
                  date={date}
                  setDate={setDate}
                  onReset={transactions.refetch}
                  placeholder="Pick a date range"
                  dateFormat="ll"
                  maxDate={new Date()}
                  minDate={new Date("2024-01-01")}
                />
              ) : (
                <TextField
                  select
                  label="Period"
                  size="small"
                  value={sortValue}
                  onChange={(e) => setSortValue(e.target.value)}
                  sx={{ minWidth: 160, width: "100%" }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="yesterday">Yesterday</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">This Month</MenuItem>
                  <MenuItem value="lmonth">Last Month</MenuItem>
                  <MenuItem value="year">This Year</MenuItem>
                  <MenuItem value="lyear">Last Year</MenuItem>
                </TextField>
              )}
            </Grid>
            <Grid item xs={12} sm="auto">
              <TextField
                select
                label="Type"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ minWidth: 160, width: "100%" }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="voucher">Vouchers</MenuItem>
                <MenuItem value="ticket">Tickets</MenuItem>
                <MenuItem value="prepaid">Prepaid Units</MenuItem>
                <MenuItem value="airtime">Airtime Transfer</MenuItem>
                <MenuItem value="bundle">Data Bundle</MenuItem>
              </TextField>
            </Grid>
            {type === "airtime" && (
              <Grid item xs={12} sm="auto">
                <TextField
                  select
                  label="Airtime Type"
                  size="small"
                  value={airtimeType}
                  onChange={(e) => setAirtimeType(e.target.value)}
                  sx={{ minWidth: 160, width: "100%" }}
                >
                  <MenuItem value="single">Single</MenuItem>
                  <MenuItem value="bulk">Bulk</MenuItem>
                </TextField>
              </Grid>
            )}
            {/* {["All", "airtime", "prepaid"].includes(type) && (
              <Grid item xs={12} sm="auto">
                <TextField
                  select
                  label="Issuer"
                  size="small"
                  value={users}
                  onChange={(e) => setUsers(e.target.value)}
                  sx={{ minWidth: 160, width: "100%" }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {transactionUsers.data?.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )} */}
          </Grid>
        </Collapse>
      </Paper>

      {/* Transactions Table */}
      <CustomizedMaterialTable
        title=""
        search
        isLoading={transactions.isLoading}
        columns={modifiedColumns}
        data={sortedTransactions}
        showExportButton
        onRefresh={transactions.refetch}
        autocompleteComponent={null}
        emptyMessage="No transactions found"
        options={{
          pageSize: 10,
          pageSizeOptions: [5, 10, 25, 50],
        }}
      />

      {/* Loading overlay for resend */}
      {resendLoading && <LoadingSpinner value="Resending. Please wait..." />}

      <TransactionPreviewDialog
        open={previewOpen}
        onClose={handlePreviewClose}
        transaction={selectedTransaction}
        onResend={handleResend}
        onDownload={handleDownload}
        onCheckStatus={handleCheckStatus}
      />
      <TransactionStatus />
    </>
  );
}

export default Transactions;

// import {
//   Alert,
//   Box,
//   MenuItem,
//   Stack,
//   TextField,
//   Checkbox,
//   FormControlLabel,
// } from "@mui/material";
// import LoadingButton from "@mui/lab/LoadingButton";
// import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
// import { transactionsColumns } from "../../mocks/columns";
// import ActionMenu from "../../components/menu/ActionMenu";
// import _ from "lodash";
// import { useMutation, useQuery } from "@tanstack/react-query";
// import {
//   getTransactionReport,
//   getTransactions,
// } from "../../api/transactionAPI";
// import { useContext, useEffect, useMemo, useState } from "react";
// import { resendVoucherORReceipt } from "../../api/paymentAPI";
// import { globalAlertType } from "../../components/alert/alertType";
// import { CustomContext } from "../../context/providers/CustomProvider";
// import { currencyFormatter } from "../../constants";
// import moment from "moment";
// import { useSearchParams } from "react-router-dom";
// import CustomTotal from "../../components/custom/CustomTotal";

// import { NoteRounded } from "@mui/icons-material";
// import CustomTitle from "../../components/custom/CustomTitle";
// import { getAllEmployees } from "../../api/employeeAPI";
// import LoadingSpinner from "../../components/spinners/LoadingSpinner";
// import DateRangePicker from "@/components/pickers/DateRangePicker";

// const startDate = moment("2024-01-01").toDate();
// const endDate = moment().toDate();
// function Transactions() {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const { customDispatch } = useContext(CustomContext);
//   const [showRange, setShowRange] = useState(false);
//   const [sortValue, setSortValue] = useState("all");
//   const [users, setUsers] = useState("All");
//   const [type, setType] = useState("All");
//   const [airtimeType, setAirtimeType] = useState("single");
//   const [date, setDate] = useState([
//     {
//       startDate,
//       endDate,
//       key: "selection",
//     },
//   ]);

//   useEffect(() => {
//     if (showRange) {
//       setSortValue("none");
//     } else {
//       setDate([
//         {
//           startDate,
//           endDate,
//           key: "selection",
//         },
//       ]);
//     }
//   }, [showRange]);

//   const transactionUsers = useQuery({
//     queryKey: ["employees"],
//     queryFn: () => getAllEmployees("search"),
//     initialData: [],
//   });

//   const transactions = useQuery({
//     queryKey: ["products-transactions", sortValue, date[0]],
//     queryFn: () => getTransactions({ date: date[0], sort: sortValue }),
//     enabled: !!sortValue,
//     initialData: [],
//   });

//   const sortedTransactions = useMemo(() => {
//     let modifiedTransactions = transactions.data;

//     if (!["All", "airtime", "prepaid"].includes(type)) {
//       setUsers("All");
//     } else {
//       if (users !== "All") {
//         modifiedTransactions = transactions?.data?.filter((item) => {
//           return item.issuer === users;
//         });
//       }
//     }

//     if (type !== "All") {
//       if (type === "airtime") {
//         return modifiedTransactions?.filter(
//           (item) => item.service === type && item.kind === airtimeType,
//         );
//       } else {
//         return modifiedTransactions?.filter((item) => item.service === type);
//       }
//     }
//     return modifiedTransactions;
//   }, [transactions?.data, type, airtimeType, users]);

//   const handleDownload = async (id, downloadLink) => {
//     console.log(downloadLink);
//     const link = document.createElement("a");
//     link.href = downloadLink;
//     link.target = "_blank";
//     link.download = `${id}.pdf`; // You can set the desired file name here
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: resendVoucherORReceipt,
//   });

//   const handleResend = (data) => {
//     mutateAsync(data, {
//       onSuccess: () => {
//         customDispatch(globalAlertType("info", "Done!"));
//       },
//       onError: () => {
//         customDispatch(globalAlertType("error", "An error has occurred!"));
//       },
//     });
//   };

//   const handleCheckStatus = (refId, service) => {
//     setSearchParams((params) => {
//       params.set("payment_reference", refId);
//       params.set("type", service);
//       params.set("open", true);
//       return params;
//     });
//   };

//   //Generate report

//   const reportMutate = useMutation({
//     mutationFn: getTransactionReport,
//   });

//   const handleGenerateReport = () => {
//     const data = {
//       ...date[0],
//       type,
//       transactions: {
//         transactions: sortedTransactions,
//       },
//     };

//     reportMutate.mutateAsync(data, {
//       onSuccess: () => {
//         customDispatch(globalAlertType("info", "Done!"));
//       },
//       onError: () => {
//         customDispatch(globalAlertType("error", "An error has occurred!"));
//       },
//     });
//   };

//   const modifiedColumns = [
//     ...transactionsColumns(type),
//     {
//       field: "",
//       title: "Action",
//       export: false,
//       render: (data) => {
//         return (
//           <ActionMenu>
//             {data?.mode === "Mobile Money" && (
//               <MenuItem
//                 sx={{ fontSize: 13 }}
//                 onClick={() =>
//                   handleCheckStatus(data?.reference, data?.service)
//                 }
//               >
//                 Check Status
//               </MenuItem>
//             )}
//             {["voucher", "ticket"].includes(data?.service) &&
//               data?.status === "completed" && (
//                 <>
//                   <MenuItem
//                     sx={{ fontSize: 13 }}
//                     onClick={() =>
//                       handleResend({
//                         id: data?.id,
//                         email: data?.email,
//                         // phone: data?.phone,
//                         downloadLink: data?.downloadLink,
//                       })
//                     }
//                   >
//                     Resend
//                   </MenuItem>
//                   <MenuItem
//                     sx={{ fontSize: 13 }}
//                     onClick={() => handleDownload(data?.id, data?.downloadLink)}
//                   >
//                     Download
//                   </MenuItem>
//                 </>
//               )}
//           </ActionMenu>
//         );
//       },
//     },
//   ];

//   const result =
//     reportMutate.isLoading || reportMutate.isError || reportMutate.isSuccess;

//   return (
//     <>
//       <CustomTitle
//         title="Transactions"
//         subtitle="Review and View recent and past transactions and manage your financial records."
//       />
//       {isLoading && (
//         <Alert variant="filled" severity="info" sx={{ mb: 1 }}>
//           Resending receipt to customer...
//         </Alert>
//       )}
//       {transactions.isLoading && (
//         <Alert variant="standard" severity="info" sx={{ mb: 1 }}>
//           Loading Transactions.Please wait...
//         </Alert>
//       )}
//       {transactions.isError && (
//         <Alert variant="standard" severity="info" sx={{ mb: 1 }}>
//           {transactions.error}
//         </Alert>
//       )}
//       <>
//         {result && (
//           <Alert
//             severity={
//               reportMutate.isLoading
//                 ? "info"
//                 : reportMutate.isError
//                   ? "error"
//                   : "success"
//             }
//           >
//             {reportMutate.isLoading ? (
//               "Generating Report.Please Wait..."
//             ) : reportMutate.isError ? (
//               "Report Generation failed.An error has occurred"
//             ) : (
//               <>
//                 {reportMutate.data === "No data found" ? (
//                   "No transactional report found !"
//                 ) : (
//                   <>
//                     A copy of the report has been sent to your email. Download
//                     or View Report{"  "}
//                     <a
//                       href={reportMutate.data}
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       here
//                     </a>
//                   </>
//                 )}
//               </>
//             )}
//           </Alert>
//         )}
//         <CustomizedMaterialTable
//           title="Transaction"
//           search={true}
//           isLoading={transactions.isLoading}
//           columns={modifiedColumns}
//           // data={[]}
//           data={sortedTransactions}
//           showExportButton={true}
//           onRefresh={transactions.refetch}
//           autocompleteComponent={
//             <div
//               style={{
//                 display: reportMutate.isLoading ? "none" : "block",
//                 width: "100%",
//               }}
//             >
//               <CustomTotal
//                 title="Total"
//                 total={currencyFormatter(
//                   _.sumBy(sortedTransactions, (item) => Number(item?.amount)),
//                 )}
//               />
//               <Box
//                 sx={{
//                   width: "100%",
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   flexWrap: "wrap",
//                   // border:'1px solid red'
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   spacing={2}
//                   alignItems="center"
//                   flexWrap="wrap"
//                   gap={2}
//                 >
//                   <Stack direction="row" spacing={2} alignItems="center">
//                     <FormControlLabel
//                       label="Use Range"
//                       control={
//                         <Checkbox
//                           checked={showRange}
//                           onChange={() => setShowRange(!showRange)}
//                         />
//                       }
//                     />
//                     {showRange ? (
//                       <DateRangePicker
//                         date={date}
//                         setDate={setDate}
//                         onReset={transactions.refetch}
//                         placeholder="Pick a date range"
//                         dateFormat="ll"
//                         maxDate={new Date()}
//                         minDate={new Date("2024-01-01")}
//                       />
//                     ) : (
//                       <TextField
//                         select
//                         label="Select Period"
//                         size="small"
//                         value={sortValue}
//                         onChange={(e) => setSortValue(e.target.value)}
//                         sx={{ width: 200, my: 2 }}
//                       >
//                         <MenuItem value="none" disabled></MenuItem>
//                         <MenuItem value="all">All</MenuItem>
//                         <MenuItem value="today">Today</MenuItem>
//                         <MenuItem value="yesterday">Yesterday</MenuItem>
//                         <MenuItem value="week">Last 7 Days</MenuItem>
//                         <MenuItem value="month">
//                           This Month {`(${moment().format("MMMM")})`}
//                         </MenuItem>
//                         <MenuItem value="lmonth">
//                           Last Month{" "}
//                           {`(${moment().subtract(1, "months").format("MMMM")})`}
//                         </MenuItem>
//                         <MenuItem value="year">
//                           This Year {`(${moment().format("YYYY")})`}
//                         </MenuItem>
//                         <MenuItem value="lyear">
//                           Last Year{" "}
//                           {`(${moment().subtract(1, "years").format("YYYY")})`}
//                         </MenuItem>
//                       </TextField>
//                     )}
//                   </Stack>
//                   <TextField
//                     select
//                     label="Select Type"
//                     size="small"
//                     value={type}
//                     onChange={(e) => setType(e.target.value)}
//                     sx={{ width: 200, my: 2 }}
//                   >
//                     <MenuItem value="All">All</MenuItem>
//                     <MenuItem value="voucher">Vouchers</MenuItem>
//                     <MenuItem value="ticket">Tickets</MenuItem>
//                     <MenuItem value="prepaid">Prepaid Units </MenuItem>
//                     <MenuItem value="airtime">Airtime Transfer </MenuItem>
//                     <MenuItem value="bundle">Data Bundle </MenuItem>
//                   </TextField>
//                   {type === "airtime" && (
//                     <TextField
//                       select
//                       label="Airtime Type"
//                       size="small"
//                       value={airtimeType}
//                       onChange={(e) => setAirtimeType(e.target.value)}
//                       sx={{ width: 200, my: 2 }}
//                     >
//                       <MenuItem value="single">Single</MenuItem>
//                       <MenuItem value="bulk">Bulk</MenuItem>
//                     </TextField>
//                   )}

//                   {["All", "airtime", "prepaid"].includes(type) && (
//                     <TextField
//                       select
//                       label="Select Issuer"
//                       size="small"
//                       value={users}
//                       onChange={(e) => {
//                         setUsers(e.target.value);
//                       }}
//                       sx={{ width: 250, my: 2 }}
//                     >
//                       <MenuItem value="All">All</MenuItem>

//                       {transactionUsers.data?.map((user) => {
//                         return (
//                           <MenuItem key={user?.id} value={user?.id}>
//                             {user?.name}
//                           </MenuItem>
//                         );
//                       })}
//                     </TextField>
//                   )}
//                 </Stack>
//               </Box>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   padding: "8px",
//                 }}
//               >
//                 <LoadingButton
//                   variant="contained"
//                   endIcon={<NoteRounded />}
//                   onClick={handleGenerateReport}
//                   loading={reportMutate.isLoading}
//                   disabled={
//                     reportMutate.isLoading || sortedTransactions?.length === 0
//                   }
//                 >
//                   {reportMutate.isLoading
//                     ? "Generating Report.Please Wait..."
//                     : " Generate Report"}
//                 </LoadingButton>
//               </div>
//             </div>
//           }
//         />
//         {isLoading && <LoadingSpinner value="Resending.Please wait..." />}
//         {transactions.isLoading && <LoadingSpinner value="Please wait..." />}
//       </>

//     </>
//   );
// }

// export default Transactions;
