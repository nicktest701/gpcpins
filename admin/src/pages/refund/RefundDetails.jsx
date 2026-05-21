import {
  Alert,
  Box,
  MenuItem,
  Stack,
  TextField,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { transactionsColumns } from "../../mocks/columns";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { getAllRefundTransactions } from "../../api/transactionAPI";
import { useContext, useEffect, useMemo, useState } from "react";
import { currencyFormatter } from "../../constants";
import moment from "moment";
import { useSearchParams } from "react-router-dom";
import TransactionStatus from "../../components/modals/TransactionStatus";
import CustomTotal from "../../components/custom/CustomTotal";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import { AuthContext } from "../../context/providers/AuthProvider";
import CustomTitle from "../../components/custom/CustomTitle";
import { getAllEmployees } from "../../api/employeeAPI";

function RefundDetails() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();

  const [showRange, setShowRange] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [sortValue, setSortValue] = useState("all");
  const [users, setUsers] = useState("All");
  const [type, setType] = useState("All");
  const [airtimeType, setAirtimeType] = useState("single");
  const [date, setDate] = useState([
    {
      startDate: new Date("2023-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  useEffect(() => {
    if (showRange) {
      setSortValue("none");
    } else {
      setDate([
        {
          startDate: new Date("2024-01-01"),
          endDate: new Date(),
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
    queryKey: ["refund-transactions", sortValue],
    queryFn: () => getAllRefundTransactions({ date: date[0], sort: sortValue }),
    enabled: !!sortValue,
  });

  const sortedTransactions = useMemo(() => {
    let modifiedTransactions = transactions.data;

    if (!["All", "airtime", "prepaid"].includes(type)) {
      setUsers("All");
    } else {
      if (users !== "All") {
        modifiedTransactions = transactions?.data?.filter((item) => {
          return item.issuer === users;
        });
      }
    }

    if (type !== "All") {
      if (type === "airtime") {
        return modifiedTransactions?.filter(
          (item) => item.service === type && item.kind === airtimeType
        );
      } else {
        return modifiedTransactions?.filter((item) => item.service === type);
      }
    }
    return modifiedTransactions;
  }, [transactions?.data, type, airtimeType, users]);

  const modifiedColumns = [
    ...transactionsColumns(type, true),
   ];

  return (
    <>
      <CustomTitle
        title="Refunded Transactions"
        subtitle="Review and View recent and past transactions and manage your financial records."
      />

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
                display: "block",
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
                    <MenuItem value="voucher">Vouchers</MenuItem>
                    <MenuItem value="ticket">Tickets</MenuItem>
                    <MenuItem value="prepaid">Prepaid Units </MenuItem>
                    <MenuItem value="airtime">Airtime Transfer </MenuItem>
                    <MenuItem value="bundle">Data Bundle </MenuItem>
                  </TextField>
                  {type === "airtime" && (
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

                  {["All", "airtime", "prepaid"].includes(type) && (
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
      
              </div>
            </div>
          }
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes("Export Transactions"),
            searchText: searchParams.get("_search"),
          }}
        />
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

export default RefundDetails;
