import { useMemo, useState } from "react";
import { MenuItem, Stack, TextField, Box } from "@mui/material";
import _ from "lodash";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";

import { PaymentsRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllElectricityPayment } from "../../api/electricityAPI";

import CustomTitle from "../../components/custom/CustomTitle";

import { useAuth } from "../../context/providers/AuthProvider";
import CustomTotal from "../../components/custom/CustomTotal";
import { currencyFormatter } from "../../constants";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../components/menu/ActionMenu";
import { PROCESSED_TRANSACTIONS } from "../../mocks/columns";
import DateRangePicker from "@/components/pickers/DateRangePicker";

function PrepaidTransactions() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [type, setType] = useState("all");

  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const transactions = useQuery({
    queryKey: ["ecg-transactions", date[0]],
    queryFn: () => getAllElectricityPayment(date[0]),
    enabled: !!date[0],
    initialData: [],
  });

  // console.log(transactions.data)

  const sortedTransactions = useMemo(() => {
    if (type === "all") return transactions.data;

    return transactions?.data?.filter((item) => item.status === type);
  }, [transactions?.data, type]);

  // console.log(sortedTransactions)

  const viewTransactionStatus = (id) => {
    navigate(`/electricity/${id}`);
  };

  const columns = [
    ...PROCESSED_TRANSACTIONS,
    {
      field: "",
      title: "Action",
      export: false,
      render: (data) => {
        // console.log(data)
        return (
          <ActionMenu>
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => viewTransactionStatus(data.id)}
            >
              View
            </MenuItem>
          </ActionMenu>
        );
      },
    },
  ];

  return (
    <>
      <>
        <CustomTitle
          title="Prepaid Transactions"
          subtitle="View and Manage all your prepaid transactions request"
          icon={
            <PaymentsRounded sx={{ width: 50, height: 50 }} color="primary" />
          }
        />

        <Box
          sx={{
            pt: 2,
          }}
        >
          <CustomizedMaterialTable
            isLoading={transactions.isLoading}
            showExportButton={true}
            title="Transactions"
            emptyMessage="No Transaction Available"
            // emptyIcon={<TransList style={{ width: 50, height: 50 }} />}
            search={true}
            columns={columns}
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
                  sx={{ width: 200, my: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </TextField>
                <CustomTotal
                  title="Total"
                  total={currencyFormatter(
                    _.sumBy(sortedTransactions, (item) => Number(item?.amount)),
                  )}
                />
              </Stack>
            }
            actions={[]}
            // onRowClick={updateECGPayment}
            onRefresh={transactions.refetch}
            options={{
              exportAllData: true,
              exportButton: user?.permissions?.includes(
                "Export Prepaid Transaction",
              ),
            }}
          />
        </Box>
      </>

      {/* <ViewECGTransactionNotifications /> */}
    </>
  );
}

export default PrepaidTransactions;
