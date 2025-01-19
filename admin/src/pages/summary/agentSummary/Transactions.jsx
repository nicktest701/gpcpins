import {
  Alert,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Box,
} from "@mui/material";
import moment from "moment";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
import { airtimeTransactionsByColumns } from "@/mocks/columns";
import LoadingButton from "@mui/lab/LoadingButton";
import _ from "lodash";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getTransactionReport,
  getTransactions,
} from "@/api/agentAPI";
import { useEffect, useMemo, useState } from "react";
import CustomRangePicker from "@/components/pickers/CustomRangePicker";
import CustomDateRangePicker from "@/components/pickers/CustomDateRangePicker";
import { NoteRounded } from "@mui/icons-material";

import { currencyFormatter } from "@/constants";

import TransactionStatus from "@/components/modals/TransactionStatus";
import { CustomContext } from "@/context/providers/CustomProvider";
import { useContext } from "react";
import { globalAlertType } from "@/components/alert/alertType";
import CustomTotal from "@/components/custom/CustomTotal";

function Transactions() {
  const { customDispatch } = useContext(CustomContext);

  const [showRange, setShowRange] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [sortValue, setSortValue] = useState("all");
  const [type, setType] = useState("All");
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

  const transactions = useQuery({
    queryKey: ["products-transactions", sortValue, date],
    queryFn: () => getTransactions({ date: date[0], sort: sortValue }),
    enabled: !!sortValue,
    initialData: [],
  });

  const sortedTransactions = useMemo(() => {
    if (type !== "All") {
      return transactions?.data?.filter((item) => item.type === type);
    }
    return transactions?.data;
  }, [transactions?.data, type]);

  //Generate report

  const reportMutate = useMutation({
    mutationFn: getTransactionReport,
  });

  const handleGenerateReport = () => {
    const data = {
      ...date,
      type: type,
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

  const result =
    reportMutate.isLoading || reportMutate.isError || reportMutate.isSuccess;

  return (
    <>
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
                  A copy of the report has been sent to your email. Download or
                  View Report{"  "}
                  <a href={reportMutate.data} target="_blank" rel="noreferrer">
                    here
                  </a>
                </>
              )}
            </>
          )}
        </Alert>
      )}
      <>
        <CustomizedMaterialTable
          title="Transaction"
          search
          isLoading={transactions.isLoading}
          columns={airtimeTransactionsByColumns}
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
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="center"
                  alignItems={{ xs: "left", md: "center" }}
                  spacing={2}
                  width="100%"
                  py={2}
                >
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
                      sx={{ width: 250, my: 2 }}
                    >
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
                  <TextField
                    select
                    label="Select Type"
                    size="small"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    sx={{ width: 250, my: 2 }}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="airtime">Airtime Transfer </MenuItem>
                    <MenuItem value="bundle">Data Bundle </MenuItem>
                  </TextField>

                  <CustomTotal
                    title="Total"
                    total={currencyFormatter(
                      _.sumBy(sortedTransactions, (item) =>
                        Number(item?.amount)
                      )
                    )}
                  />
                </Stack>
              </Box>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px",
                }}
              >
                <FormControlLabel
                  label="Use Range"
                  control={
                    <Checkbox
                      checked={showRange}
                      onChange={() => setShowRange(!showRange)}
                    />
                  }
                />
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

export default Transactions;
