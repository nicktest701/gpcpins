import { useMemo, useState } from "react";
import {
  Alert,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  useTheme,
  Box,
} from "@mui/material";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { transactionsColumns } from "../../mocks/columns";
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
import LoadingSpinner from "../../components/spinners/LoadingSpinner";
import CustomTitle from "../../components/custom/CustomTitle";

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
function Report() {
  const { palette } = useTheme();
  const [sortValue, setSortValue] = useState("2024");
  const [type, setType] = useState("All");

  const reportTransactions = useQuery({
    queryKey: ["report-transactions", sortValue, type],
    queryFn: () => getReportTransaction(sortValue, type),
    enabled: !!sortValue && !!type,
  });

  const transactions = useQuery({
    queryKey: ["products-transactions", sortValue],
    queryFn: () =>
      getTransactions({
        date: { startDate: new Date("2023-01-01"), endDate: new Date() },
        sort: "all",
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
      return transactions?.data?.filter((item) => item.domain === type);
    }

    return transactions?.data;
  }, [transactions?.data, type]);

  return (
    <>
      <CustomTitle
        title="Transactional Reports"
        subtitle="View history and data about daily transactions."
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

      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
            <MenuItem value="Voucher">Vouchers</MenuItem>
            <MenuItem value="Ticket">Tickets</MenuItem>
            <MenuItem value="Prepaid">Prepaid Units</MenuItem>
            <MenuItem value="Airtime">Airtime Transfers</MenuItem>
            <MenuItem value="Bundle">Data Bundle</MenuItem>
          </TextField>

          <ListItemText
            sx={{ textAlign: { xs: "left", md: "right" } }}
            primary={currencyFormatter(
              _.sumBy(sortedTransactions, (item) => Number(item?.amount))
            )}
            primaryTypographyProps={{ fontWeight: "bold", fontSize: "2rem" }}
            secondary="TOTAL"
            secondaryTypographyProps={{ color: "secondary" }}
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
                      label: "Vouchers",
                      data: reportTransactions?.data?.voucher ?? [],
                      tension: 0.2,
                      borderColor: palette.primary.main,
                    },
                    {
                      label: "Tickets",
                      data: reportTransactions?.data?.ticket ?? [],
                      tension: 0.2,
                      borderColor: palette.secondary.main,
                    },
                    {
                      label: "Prepaid Units",
                      data: reportTransactions?.data?.prepaid ?? [],
                      tension: 0.2,
                      borderColor: palette.info.main,
                    },
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
                      borderColor: palette.error.main,
                    },
                  ]
                : [
                    {
                      label: type,
                      data: reportTransactions?.data?.report ?? [],
                      tension: 0.2,
                      borderColor:
                        type === "Voucher"
                          ? palette.primary.main
                          : type === "Ticket"
                          ? palette.secondary.main
                          : type === "Prepaid"
                          ? palette.info.main
                          : type === "Bundle"
                          ? palette.error.main
                          : palette.success.main,
                    },
                  ]
            }
          />
        </CustomCard>

        <CustomizedMaterialTable
          title={`${type} Transactions`}
          search
          isLoading={transactions.isLoading}
          columns={transactionsColumns((type))}
          data={sortedTransactions}
          showExportButton={true}
          onRefresh={() => {
            reportTransactions.refetch();
            transactions.refetch();
          }}
        />
        {(reportTransactions.isLoading || transactions.isLoading) && (
          <LoadingSpinner value="Loading Transaction Report..." />
        )}
      </Box>
    </>
  );
}

export default Report;
