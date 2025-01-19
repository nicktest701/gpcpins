import { Container, Box, TextField, MenuItem } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import { useParams } from "react-router-dom";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useContext, useMemo, useState } from "react";
import {
  airtimeTransactionsColumns,
  userTransactionsColumns,
} from "../../mocks/columns";
import { getUserTransaction } from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";
import CustomTotal from "../../components/custom/CustomTotal";
import { NoteAlt } from "@mui/icons-material";

function UserTransaction() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("all");
  const [airtimeType, setAirtimeType] = useState("single");

  const transactions = useQuery({
    queryKey: ["user_transactions", id],
    queryFn: () => getUserTransaction(id),
    enabled: !!user?.id && !!id,
    initialData: [],
  });

  const sortedTransactions = useMemo(() => {
    let filteredTransaction = transactions?.data;
    if (type !== "All") {
      if (type === "Airtime") {
        filteredTransaction = transactions?.data?.filter(
          (item) => item.domain === type && item.kind === airtimeType
        );
      } else {
        filteredTransaction = transactions?.data?.filter(
          (item) => item.domain === type
        );
      }
    }

    if (status !== "all") {
      filteredTransaction = filteredTransaction?.filter(
        (item) => item.status === status
      );
    }

    return filteredTransaction;
  }, [transactions?.data, type, airtimeType, status]);

  const modifiedColumns = [
    ...(type === "Airtime"
      ? airtimeTransactionsColumns(airtimeType)
      : userTransactionsColumns(type)),
  ];

  return (
    <>
      <Container sx={{ paddingY: 2, bgcolor: "#fff" }}>
        <CustomizedMaterialTable
          isLoading={transactions.isLoading}
          title="Transactions"
          search={true}
          columns={modifiedColumns}
          data={sortedTransactions}
          showExportButton
          emptyMessage="No Transaction available"
          icon={<NoteAlt sx={{ width: 40, height: 40 }} color="primary" />}
          onRefresh={transactions.refetch}
          options={{
            selection: true,
          }}
          autocompleteComponent={
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <TextField
                select
                label="Select Type"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ width: 250, my: 2 }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Voucher">Vouchers</MenuItem>
                <MenuItem value="Ticket">Tickets</MenuItem>
                <MenuItem value="Prepaid">Prepaid </MenuItem>
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

              <TextField
                select
                label="Status"
                size="small"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ width: 250, my: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </TextField>

              <CustomTotal
                title="Total Amount"
                total={currencyFormatter(
                  _.sumBy(sortedTransactions, (item) => Number(item?.amount))
                )}
              />
            </Box>
          }
        />
      </Container>
    </>
  );
}

export default UserTransaction;
