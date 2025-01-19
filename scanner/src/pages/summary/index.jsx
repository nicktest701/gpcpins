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
import { recentTransactionColumns } from "../../mocks/columns";
import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "../../api/transactionAPI";
import { useMemo, useState } from "react";
import moment from "moment";
import CustomTotal from "../../components/custom/CustomTotal";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import { useAuth } from "../../context/providers/AuthProvider";
import CustomTitle from "../../components/custom/CustomTitle";

function Summary() {
  const { user } = useAuth();

  const [showRange, setShowRange] = useState(false);
  const [openPicker, setOpenPicker] = useState(false);
  const [sortValue, setSortValue] = useState("all");
  const [date, setDate] = useState([
    {
      startDate: new Date("2023-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const transactions = useQuery({
    queryKey: ["tickets-transactions", sortValue],
    queryFn: user?.isAdmin
      ? () => getTransactions({ date: date[0], sort: sortValue, verifier: "" })
      : () =>
          getTransactions({
            date: date[0],
            sort: sortValue,
            verifier: user?.id,
          }),
    enabled: !!sortValue,
  });

  const sortedTransactions = useMemo(() => {
    return transactions?.data;
  }, [transactions?.data]);

  return (
    <>
      <CustomTitle title="Cummulative Scan History" />

      {transactions.isLoading && (
        <Alert variant="standard" severity="info" sx={{ mb: 1 }}>
          Loading Scan History.Please wait...
        </Alert>
      )}
      {transactions.isError && (
        <Alert variant="standard" severity="info" sx={{ mb: 1 }}>
          {transactions.error}
        </Alert>
      )}
      <>
        <CustomizedMaterialTable
          title=""
          search={true}
          isLoading={transactions.isLoading}
          columns={recentTransactionColumns}
          data={sortedTransactions}
          showExportButton={true}
          onRefresh={transactions.refetch}
          autocompleteComponent={
            <div style={{ width: "100%" }}>
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
                <CustomTotal
                  title="Total Scans"
                  total={sortedTransactions?.length}
                />
              </Box>
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
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
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                  flex
                >
                  <Stack direction="row" spacing={2} alignItems="center">
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
                        sx={{ width: 240, my: 2 }}
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
                  </Stack>
                </Stack>
              </div>
            </div>
          }
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes("Export Transactions"),
          }}
        />
      </>

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

export default Summary;
