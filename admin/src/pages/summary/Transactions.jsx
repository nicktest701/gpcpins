import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
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
import TransactionStatus from "../../components/modals/TransactionStatus";
import CustomTotal from "../../components/custom/CustomTotal";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import { NoteRounded } from "@mui/icons-material";
import { AuthContext } from "../../context/providers/AuthProvider";
import CustomTitle from "../../components/custom/CustomTitle";
import { getAllEmployees } from "../../api/employeeAPI";
import LoadingSpinner from "../../components/spinners/LoadingSpinner";

const startDate = moment("2024-01-01").toDate();
const endDate = moment().toDate();
function Transactions() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);

  const [showRange, setShowRange] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [sortValue, setSortValue] = useState("all");
  const [users, setUsers] = useState("All");
  const [type, setType] = useState("All");
  const [airtimeType, setAirtimeType] = useState("single");
  const [date, setDate] = useState([
    {
      startDate,
      endDate,
      key: "selection",
    },
  ]);

  useEffect(() => {
    if (showRange) {
      setSortValue("none");
    } else {
      setDate([
        {
          startDate,
          endDate,
          key: "selection",
        },
      ]);
    }
  }, [showRange]);

  const transactionUsers = useQuery({
    queryKey: ["employees"],
    queryFn: () => getAllEmployees("search"),
  });

  const transactions = useQuery({
    queryKey: ["products-transactions", sortValue],
    queryFn: () => getTransactions({ date: date[0], sort: sortValue }),
    enabled: !!sortValue,
  });

  const sortedTransactions = useMemo(() => {
    let modifiedTransactions = transactions.data;

    if (!["All", "Airtime", "Prepaid"].includes(type)) {
      setUsers("All");
    } else {
      if (users !== "All") {
        modifiedTransactions = transactions?.data?.filter((item) => {
          return item.issuer === users;
        });
      }
    }

    if (type !== "All") {
      if (type === "Airtime") {
        return modifiedTransactions?.filter(
          (item) => item.domain === type && item.kind === airtimeType
        );
      } else {
        return modifiedTransactions?.filter((item) => item.domain === type);
      }
    }
    return modifiedTransactions;
  }, [transactions?.data, type, airtimeType, users]);

  const handleDownload = async (id, downloadLink) => {
    console.log(downloadLink);
    const link = document.createElement("a");
    link.href = downloadLink;
    link.target = "_blank";
    link.download = `${id}.pdf`; // You can set the desired file name here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: resendVoucherORReceipt,
  });
  const handleResend = (data) => {
    mutateAsync(data, {
      onSuccess: () => {
        customDispatch(globalAlertType("info", "Done!"));
      },
      onError: () => {
        customDispatch(globalAlertType("error", "An error has occurred!"));
      },
    });
  };

  const handleCheckStatus = (refId, domain) => {
    setSearchParams((params) => {
      params.set("payment_reference", refId);
      params.set("type", domain);
      params.set("open", true);
      return params;
    });
  };

  //Generate report

  const reportMutate = useMutation({
    mutationFn: getTransactionReport,
  });

  const handleGenerateReport = () => {
    const data = {
      ...date[0],
      type,
      transactions: {
        transactions: sortedTransactions,
      },
    };

    reportMutate.mutateAsync(data, {
      onSuccess: () => {
        customDispatch(globalAlertType("info", "Done!"));
      },
      onError: () => {
        customDispatch(globalAlertType("error", "An error has occurred!"));
      },
    });
  };

  const modifiedColumns = [
    ...transactionsColumns(type),
    {
      field: "",
      title: "Action",
      export: false,
      render: (data) => {
        // console.log(data)
        return (
          <ActionMenu>
            {data?.mode === "Mobile Money" && (
              <MenuItem
                sx={{ fontSize: 13 }}
                onClick={() => handleCheckStatus(data?.reference, data?.domain)}
              >
                Check Status
              </MenuItem>
            )}
            {["Voucher", "Ticket"].includes(data?.domain) &&
              data?.status === "completed" && (
                <>
                  <MenuItem
                    sx={{ fontSize: 13 }}
                    onClick={() =>
                      handleResend({
                        id: data?._id,
                        email: data?.email,
                        // phone: data?.phone,
                        downloadLink: data?.downloadLink,
                      })
                    }
                  >
                    Resend
                  </MenuItem>
                  <MenuItem
                    sx={{ fontSize: 13 }}
                    onClick={() =>
                      handleDownload(data?._id, data?.downloadLink)
                    }
                  >
                    Download
                  </MenuItem>
                </>
              )}
            {/* <MenuItem
              sx={{ fontSize: 13 }}
                onClick={() => removeTransaction(data?._id)}
            >
              Remove
            </MenuItem> */}
          </ActionMenu>
        );
      },
    },
  ];
  const result =
    reportMutate.isLoading || reportMutate.isError || reportMutate.isSuccess;
  return (
    <>
      <CustomTitle
        title="Transactions"
        subtitle="Review and View recent and past transactions and manage your financial records."
      />
      {isLoading && (
        <Alert variant="filled" severity="info" sx={{ mb: 1 }}>
          Resending receipt to customer...
        </Alert>
      )}
      {transactions.isLoading && (
        <Alert variant="standard" severity="info" sx={{ mb: 1 }}>
          Loading Transactions.Please wait...
        </Alert>
      )}
      {transactions.isError && (
        <Alert variant="standard" severity="info" sx={{ mb: 1 }}>
          {transactions.error}
        </Alert>
      )}
      <>
        {result && (
          <Alert
            severity={
              reportMutate.isLoading
                ? "info"
                : reportMutate.isError
                ? "error"
                : "success"
            }
          >
            {reportMutate.isLoading ? (
              "Generating Report.Please Wait..."
            ) : reportMutate.isError ? (
              "Report Generation failed.An error has occurred"
            ) : (
              <>
                {reportMutate.data === "No data found" ? (
                  "No transactional report found !"
                ) : (
                  <>
                    A copy of the report has been sent to your email. Download
                    or View Report{"  "}
                    <a
                      href={reportMutate.data}
                      target="_blank"
                      rel="noreferrer"
                    >
                      here
                    </a>
                  </>
                )}
              </>
            )}
          </Alert>
        )}
        <CustomizedMaterialTable
          title="Transaction"
          search={true}
          isLoading={transactions.isLoading}
          columns={modifiedColumns}
          data={sortedTransactions}
          showExportButton={true}
          onRefresh={transactions.refetch}
          autocompleteComponent={
            <div
              style={{
                display: reportMutate.isLoading ? "none" : "block",
                width: "100%",
              }}
            >
              <CustomTotal
                title="Total"
                total={currencyFormatter(
                  _.sumBy(sortedTransactions, (item) => Number(item?.amount))
                )}
              />
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  // border:'1px solid red'
                }}
              >
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                  gap={2}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                      label="Use Range"
                      control={
                        <Checkbox
                          checked={showRange}
                          onChange={() => setShowRange(!showRange)}
                        />
                      }
                    />
                    {showRange ? (
                      <CustomRangePicker
                        date={date}
                        setDate={setDate}
                        setOpen={setOpenPicker}
                        refetch={transactions.refetch}
                      />
                    ) : (
                      <TextField
                        select
                        label="Select Period"
                        size="small"
                        value={sortValue}
                        onChange={(e) => setSortValue(e.target.value)}
                        sx={{ width: 200, my: 2 }}
                      >
                        <MenuItem value="none" disabled></MenuItem>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="yesterday">Yesterday</MenuItem>
                        <MenuItem value="week">Last 7 Days</MenuItem>
                        <MenuItem value="month">
                          This Month {`(${moment().format("MMMM")})`}
                        </MenuItem>
                        <MenuItem value="lmonth">
                          Last Month{" "}
                          {`(${moment().subtract(1, "months").format("MMMM")})`}
                        </MenuItem>
                        <MenuItem value="year">
                          This Year {`(${moment().format("YYYY")})`}
                        </MenuItem>
                        <MenuItem value="lyear">
                          Last Year{" "}
                          {`(${moment().subtract(1, "years").format("YYYY")})`}
                        </MenuItem>
                      </TextField>
                    )}
                  </Stack>
                  <TextField
                    select
                    label="Select Type"
                    size="small"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    sx={{ width: 200, my: 2 }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Voucher">Vouchers</MenuItem>
                    <MenuItem value="Ticket">Tickets</MenuItem>
                    <MenuItem value="Prepaid">Prepaid Units </MenuItem>
                    <MenuItem value="Airtime">Airtime Transfer </MenuItem>
                    <MenuItem value="Bundle">Data Bundle </MenuItem>
                  </TextField>
                  {type === "Airtime" && (
                    <TextField
                      select
                      label="Airtime Type"
                      size="small"
                      value={airtimeType}
                      onChange={(e) => setAirtimeType(e.target.value)}
                      sx={{ width: 200, my: 2 }}
                    >
                      <MenuItem value="single">Single</MenuItem>
                      <MenuItem value="bulk">Bulk</MenuItem>
                    </TextField>
                  )}

                  {["All", "Airtime", "Prepaid"].includes(type) && (
                    <TextField
                      select
                      label="Select Issuer"
                      size="small"
                      value={users}
                      onChange={(e) => {
                        setUsers(e.target.value);
                      }}
                      sx={{ width: 250, my: 2 }}
                    >
                      <MenuItem value="All">All</MenuItem>

                      {transactionUsers.data?.map((user) => {
                        return (
                          <MenuItem key={user?.id} value={user?.id}>
                            {user?.name}
                          </MenuItem>
                        );
                      })}
                    </TextField>
                  )}
                </Stack>
              </Box>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px",
                }}
              >
                <LoadingButton
                  variant="contained"
                  endIcon={<NoteRounded />}
                  onClick={handleGenerateReport}
                  loading={reportMutate.isLoading}
                  disabled={
                    reportMutate.isLoading || sortedTransactions?.length === 0
                  }
                >
                  {reportMutate.isLoading
                    ? "Generating Report.Please Wait..."
                    : " Generate Report"}
                </LoadingButton>
              </div>
            </div>
          }
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes("Export Transactions"),
            searchText: searchParams.get("_search"),
          }}
        />
        {isLoading && <LoadingSpinner value="Resending.Please wait..." />}
      </>
      <TransactionStatus />

      <CustomDateRangePicker
        open={openPicker}
        date={date}
        setDate={setDate}
        setOpen={setOpenPicker}
        refetchData={transactions.refetch}
      />
    </>
  );
}

export default Transactions;
