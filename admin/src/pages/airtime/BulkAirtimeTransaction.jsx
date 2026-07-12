import { lazy, useContext, useMemo, useState } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { PaymentsRounded } from "@mui/icons-material";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import {
  getAllBulkAirtimePayment,
  // getTopUpBalance,
} from "../../api/paymentAPI";
import { CustomContext } from "../../context/providers/CustomProvider";

import CustomTitle from "../../components/custom/CustomTitle";
import { AuthContext } from "../../context/providers/AuthProvider";
import { bulkAirtimeTransactionsColumns } from "../../mocks/columns";
import { currencyFormatter } from "../../constants";
import AirtimePrompt from "./AirtimePrompt";
import CustomTotal from "../../components/custom/CustomTotal";
import DateRangePicker from "@/components/pickers/DateRangePicker";

const ProcessAirtimeTransaction = lazy(
  () => import("./ProcessAirtimeTransaction"),
);

function BulkAirtimeTransaction() {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const [showAlert, setShowAlert] = useState(true);
  const [type, setType] = useState("all");

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
    ({ isProcessed }) => !isProcessed,
  );

  const sortedTransactions = useMemo(() => {
    if (type == "processed") {
      return transactions?.data?.filter((item) => item.isProcessed === true);
    }
    if (type == "unprocessed") {
      return transactions?.data?.filter((item) => item.isProcessed === false);
    }

    return transactions?.data;
  }, [transactions?.data, type]);

  const updateECGPayment = (e, rowData) => {

    console.log(rowData)
    customDispatch({
      type: "viewEcgTransactionInfoEdit",
      payload: {
        open: true,
        details: rowData,
      },
    });
  };

  const CAN_PROCESS_AIRTIME = user?.permissions?.includes(
    "Process Bulk Airtime Transaction",
  );
  return (
    <>
      {unprocessedTransactions?.length > 0 && showAlert && (
        <Alert
          variant="filled"
          severity="info"
          sx={{ mt: 2, py: 1, borderRadius: 0, color: "#fff" }}
          onClose={() => setShowAlert(false)}
          // action={<Button variant='outlined'>Okay</Button>}
        >
          <AlertTitle>Pending Transactions</AlertTitle>
          You have ({unprocessedTransactions?.length}) pending transactions
          awaiting completion!
        </Alert>
      )}

      <>
        <CustomTitle
          title="Bulk Airtime Transactions"
          subtitle="View and Manage all your bulk airtime and EVD transactions request"
          icon={
            <PaymentsRounded sx={{ width: 50, height: 50 }} color="primary" />
          }
        />

        <CustomizedMaterialTable
          isLoading={transactions.isLoading}
          showExportButton={true}
          title="Transactions"
          emptyMessage="No Transaction Available"
          // emptyIcon={<TransList style={{ width: 50, height: 50 }} />}
          search={true}
          columns={bulkAirtimeTransactionsColumns}
          data={sortedTransactions}
          autocompleteComponent={
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
                label="Select Transaction"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ width: { xs: "100%", sm: 260 }, my: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="processed">Processed</MenuItem>
                <MenuItem value="unprocessed">Unprocessed</MenuItem>
              </TextField>
              <CustomTotal
                title="Total"
                total={currencyFormatter(
                  _.sumBy(sortedTransactions, (item) => Number(item?.amount)),
                )}
              />
            </Stack>
          }
          onRowClick={CAN_PROCESS_AIRTIME ? updateECGPayment : undefined}
          onRefresh={transactions.refetch}
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes(
              "Export Bulk Airtime Transaction",
            ),
          }}
        />
      </>

      <ProcessAirtimeTransaction />
      <AirtimePrompt />
    </>
  );
}

export default BulkAirtimeTransaction;
