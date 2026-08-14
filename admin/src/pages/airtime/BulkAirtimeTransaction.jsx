import { lazy, useMemo, useState } from "react";
import { Alert, AlertTitle, MenuItem, Stack, TextField } from "@mui/material";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { PaymentsRounded } from "@mui/icons-material";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import { getAllBulkAirtimePayment } from "../../api/paymentAPI";
import { useCustomContext } from "../../context/providers/CustomProvider";
import CustomTitle from "../../components/custom/CustomTitle";
import { useAuth } from "../../context/providers/AuthProvider";
import { bulkAirtimeTransactionsColumns } from "../../mocks/columns";
import { currencyFormatter } from "../../constants";
import AirtimePrompt from "./AirtimePrompt";
import CustomTotal from "../../components/custom/CustomTotal";
import DateRangePicker from "@/components/pickers/DateRangePicker";

const ProcessAirtimeTransaction = lazy(
  () => import("./ProcessAirtimeTransaction")
);

function BulkAirtimeTransaction() {
  const { user } = useAuth();
  const { customDispatch } = useCustomContext();
  const [showAlert, setShowAlert] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const transactions = useQuery({
    queryKey: ["bulk-airtime-transactions", date[0]],
    queryFn: () => getAllBulkAirtimePayment(date[0]),
    enabled: !!date,
    initialData: [],
  });

  const unprocessedTransactions = transactions?.data?.filter(
    ({ status }) => status === "pending"
  );

  const sortedTransactions = useMemo(() => {
    if (statusFilter === "pending") {
      return transactions?.data?.filter((item) => item.status === "pending");
    }
    if (statusFilter === "failed") {
      return transactions?.data?.filter((item) => item.status === "failed");
    }
    if (statusFilter === "completed") {
      return transactions?.data?.filter((item) => item.status === "completed");
    }
    return transactions?.data; // 'all'
  }, [transactions?.data, statusFilter]);

  const updateECGPayment = (e, rowData) => {
    customDispatch({
      type: "viewEcgTransactionInfoEdit",
      payload: {
        open: true,
        details: rowData,
      },
    });
  };

  const CAN_PROCESS_AIRTIME = user?.permissions?.includes(
    "Process Bulk Airtime Transaction"
  );

  return (
    <>
      {unprocessedTransactions?.length > 0 && showAlert && (
        <Alert
          variant="filled"
          severity="info"
          sx={{ mt: 2, py: 1, borderRadius: 0, color: "#fff" }}
          onClose={() => setShowAlert(false)}
        >
          <AlertTitle>Pending Transactions</AlertTitle>
          You have ({unprocessedTransactions?.length}) pending transactions
          awaiting completion!
        </Alert>
      )}

      <CustomTitle
        title="Bulk Airtime Transactions"
        subtitle="View and Manage all your bulk airtime and EVD transactions request"
        icon={<PaymentsRounded sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <CustomizedMaterialTable
        isLoading={transactions.isLoading}
        showExportButton={true}
        title="Transactions"
        emptyMessage="No Transaction Available"
        search={true}
        columns={bulkAirtimeTransactionsColumns}
        data={sortedTransactions}
        autocompleteComponent={
          <>
            <CustomTotal
              title="Total"
              total={currencyFormatter(
                _.sumBy(sortedTransactions, (item) => Number(item?.amount))
              )}
            />
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent={{ xs: "center", md: "flex-start" }}
              alignItems={{ xs: "left", md: "center" }}
              spacing={2}
              width="100%"
              py={2}
            >
              <DateRangePicker
                date={date}
                setDate={setDate}
                onReset={transactions.refetch}
                placeholder="Pick a date range"
                dateFormat="ll"
                maxDate={new Date()}
                minDate={new Date("2024-01-01")}
              />

              <TextField
                select
                label="Status"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ width: { xs: "100%", sm: 200 }, my: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </TextField>
            </Stack>
          </>
        }
        onRowClick={CAN_PROCESS_AIRTIME ? updateECGPayment : undefined}
        onRefresh={transactions.refetch}
        options={{
          exportAllData: true,
          exportButton: user?.permissions?.includes(
            "Export Bulk Airtime Transaction"
          ),
        }}
      />

      <ProcessAirtimeTransaction />
      <AirtimePrompt />
    </>
  );
}

export default BulkAirtimeTransaction;