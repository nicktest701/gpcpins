import { useMemo, useState } from "react";
import { Alert, MenuItem, Stack, TextField, useTheme } from "@mui/material";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { airtimeTransactionsColumns } from "../../mocks/columns";
import _ from "lodash";
import { useQuery } from "@tanstack/react-query";
import {
  getReportTransaction,
  getTransactions,
} from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";
import CustomCard from "../../components/custom/CustomCard";
import LineChart from "../../components/charts/LineChart";
import moment from "moment";
import CustomTotal from "../../components/custom/CustomTotal";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const currentYear = new Date().getFullYear();
function Report() {
  const { palette } = useTheme();
  const [sortValue, setSortValue] = useState(currentYear);
  const [type, setType] = useState("All");
  const date = {
    startDate: new Date(`${currentYear}-01-01`),
    endDate: new Date(),
  };

  const reportTransactions = useQuery({
    queryKey: ["report-transactions", sortValue, type],
    queryFn: () => getReportTransaction(sortValue, type),
    enabled: !!sortValue && !!type,
  });

  const transactions = useQuery({
    queryKey: ["products-transactions", sortValue],
    queryFn: () =>
      getTransactions({
        date,
        sort: "All",
      }),
    enabled: !!sortValue,
    select: (transactions) => {
      return transactions?.filter(
        (transaction) => moment(transaction.createdAt).year() == sortValue
      );
    },
  });

  const sortedTransactions = useMemo(() => {
    if (type !== "All") {
      return transactions?.data?.filter(
        (item) => _.capitalize(item.type) === type
      );
    }

    return transactions?.data;
  }, [transactions?.data, type]);

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

      <Stack spacing={8}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="center"
          alignItems={{ xs: "left", md: "center" }}
          spacing={2}
          mb={2}
        >
          <TextField
            select
            label="Select Period"
            size="small"
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            sx={{ width: 200, my: 2 }}
          >
            <MenuItem value="2024">2024</MenuItem>
            <MenuItem value="2025">2025</MenuItem>
            <MenuItem value="2026">2026</MenuItem>
          </TextField>
          <TextField
            select
            label="Select Type"
            size="small"
            value={type}
            onChange={(e) => setType(e.target.value)}
            sx={{ width: 200, my: 2 }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Airtime">Airtime Transfers</MenuItem>
            <MenuItem value="Bundle">Data Bundle </MenuItem>
          </TextField>

          <CustomTotal
            title="Total"
            total={currencyFormatter(
              _.sumBy(sortedTransactions, (item) => Number(item?.amount))
            )}
          />
        </Stack>

        <CustomCard
          title={`Graph of Total Transactions(GHS) for ${type} in ${sortValue}`}
        >
          <LineChart
            labels={months}
            datasets={
              type === "All"
                ? [
                    {
                      label: "Airtime Tranfers",
                      data: reportTransactions?.data?.airtime ?? [],
                      tension: 0.2,
                      borderColor: palette.success.main,
                    },
                    {
                      label: "Data Bundle",
                      data: reportTransactions?.data?.bundle ?? [],
                      tension: 0.2,
                      borderColor: palette.warning.main,
                    },
                  ]
                : [
                    {
                      label: type,
                      data: reportTransactions?.data?.report ?? [],
                      tension: 0.2,
                      borderColor:
                        type === "bundle"
                          ? palette.secondary.main
                          : type === "airtime"
                          ? palette.success.main
                          : palette.primary.main,
                    },
                  ]
            }
          />
        </CustomCard>

        <CustomizedMaterialTable
          title={`${type} Transactions`}
          search
          isLoading={transactions.isLoading}
          columns={airtimeTransactionsColumns}
          data={sortedTransactions}
          showExportButton={true}
          onRefresh={() => {
            reportTransactions.refetch();
            transactions.refetch();
          }}
        />
      </Stack>
    </>
  );
}

export default Report;
