import { useContext, useMemo, useState } from "react";
import _ from "lodash";
import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";

// import Swal from "sweetalert2";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
import CustomDateRangePicker from "@/components/pickers/CustomDateRangePicker";
import { PaymentsRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
// import { CustomContext } from "@/context/providers/CustomProvider";

import CustomTitle from "@/components/custom/CustomTitle";
import { AuthContext } from "@/context/providers/AuthProvider";
import { airtimeTransactionsColumns } from "@/mocks/columns";
import NewTransfer from "./NewTransfer";
import { useSearchParams } from "react-router-dom";
import { getAgentTransactions } from "@/api/agentAPI";

import { currencyFormatter } from "@/constants";
import CustomRangePicker from "@/components/pickers/CustomRangePicker";
import CustomTotal from "@/components/custom/CustomTotal";
import moment from "moment";

const startDate = moment("2024-01-01").format("YYYY-MM-DD");
const endDate = moment().format("YYYY-MM-DD");

function AirtimeTransaction() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useContext(AuthContext);
  const [openPicker, setOpenPicker] = useState(false);
  const [type, setType] = useState("all");
  const [date, setDate] = useState([
    {
      startDate,
      endDate,
      key: "selection",
    },
  ]);

  const transactions = useQuery({
    queryKey: ["agent-airtime-transactions", startDate, endDate],
    queryFn: () => getAgentTransactions({ date: date[0], type: "airtime" }),
    enabled: !!user?.id,
  });

  const sortedTransactions = useMemo(() => {
    if (type == "all") {
      return transactions?.data;
    }

    return transactions?.data?.filter((item) => item.status === type);
  }, [transactions?.data, type]);

  const openNewTransfer = () => {
    setSearchParams((params) => {
      params.set("airtime-prompt", "true");
      return params;
    });
  };

 

  return (
    <>
      <Box sx={{ py: 2 }}>
        <CustomTitle
          title="Airtime Transfer"
          subtitle="View and Manage all your bulk airtime and EVD transactions request"
          icon={
            <PaymentsRounded sx={{ width: 50, height: 50 }} color="primary" />
          }
        />

        <Box sx={{ py: 4 }}>
          <Button variant="contained" onClick={openNewTransfer}>
            Sell Airtime
          </Button>
        </Box>
        <CustomizedMaterialTable
          isLoading={transactions.isLoading}
          showExportButton={true}
          title="Transactions"
          emptyMessage="No Transaction Available"
          // emptyIcon={<TransList style={{ width: 50, height: 50 }} />}
          search={true}
          columns={airtimeTransactionsColumns}
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
              <CustomRangePicker
                date={date}
                setDate={setDate}
                setOpen={setOpenPicker}
                refetch={transactions.refetch}
              />
              <TextField
                select
                label="Select Transaction"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ width: 250, my: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </TextField>
              <CustomTotal
                title="Total"
                total={currencyFormatter(
                  _.sumBy(sortedTransactions, (item) => Number(item?.amount))
                )}
              />
            </Stack>
          }
          onRefresh={transactions.refetch}
        />
      </Box>
      <CustomDateRangePicker
        open={openPicker}
        setOpen={setOpenPicker}
        date={date}
        setDate={setDate}
        refetchData={transactions.refetch}
      />

      <NewTransfer />
    </>
  );
}

export default AirtimeTransaction;
