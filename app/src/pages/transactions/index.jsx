import { useMemo, useState } from "react";
import CustomTitle from "@/components/custom/CustomTitle";
import { Container, MenuItem, TextField, Box } from "@mui/material";
import { NoteAlt } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
import TransactionDetailsDialog from "@/components/dialogs/TransactionDetailsDialog";


import {  useQuery } from "@tanstack/react-query";
import {
  getTransactionByEmail,

} from "@/api/transactionAPI";

import {
  transactionsColumns,
  airtimeTransactionsColumns,
} from "@/mocks/columns";
import ActionMenu from "@/components/menu/ActionMenu";
import CustomTotal from "@/components/custom/CustomTotal";
import { currencyFormatter } from "@/constants";


// Add import at top
import { useMediaQuery, useTheme } from "@mui/material";
import TransactionList from "./TransactionList";
import { useAuth } from "../../context/providers/AuthProvider";
import DateRangePicker from "../../components/pickers/DateRangePicker";
import { Navigate } from "react-router-dom";

const Transaction = () => {
  const { user } = useAuth();

  // Inside Transaction component, after useState declarations:
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // adjust breakpoint as needed

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("all");
  const [airtimeType, setAirtimeType] = useState("single");

  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  //Get all transactions by meter id
  const transactions = useQuery({
    queryKey: [
      "prepaid-transaction-email",
      user?.email,
      user?.phonenumber,
      date[0],
    ],
    queryFn: () => getTransactionByEmail(date[0]),
    enabled: !!user?.id,
    initialData: [],
  });

  const sortedTransactions = useMemo(() => {
    let filteredTransaction = transactions?.data;
    if (type !== "All") {
      if (type === "Airtime") {
        filteredTransaction = transactions?.data?.filter(
          (item) => item.domain === type && item.kind === airtimeType,
        );
      } else {
        filteredTransaction = transactions?.data?.filter(
          (item) => item.domain === type,
        );
      }
    }

    if (status !== "all") {
      filteredTransaction = filteredTransaction?.filter(
        (item) => item.status === status,
      );
    }

    return filteredTransaction;
  }, [transactions?.data, type, airtimeType, status]);

  // console.log(transactions.data)

  const handleDownload = async (id, downloadLink) => {
    const link = document.createElement("a");
    link.href = downloadLink;
    link.target = "_blank";
    link.download = `${id}.pdf`; // You can set the desired file name here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

 

  // const removeTransaction = (id) => {
  //   Swal.fire({
  //     title: "Removing",
  //     text: "Do you want to remove transaction?",
  //     showCancelButton: true,
  //   }).then(({ isConfirmed }) => {
  //     if (isConfirmed) {
  //       mutateAsync([id], {
  //         onSettled: () => {
  //           queryClient.invalidateQueries({
  //             queryKey: [
  //               "prepaid-transaction-email",
  //               user?.email,
  //               user?.phonenumber,
  //             ],
  //           });
  //         },
  //         onSuccess: () => {
  //           customDispatch(globalAlertType("info", "Transaction Removed!"));
  //         },
  //         onError: () => {
  //           customDispatch(
  //             globalAlertType(
  //               "error",
  //               "Failed to remove transaction! An error has occurred!",
  //             ),
  //           );
  //         },
  //       });
  //     }
  //   });
  // };

  // Add handleView function
  const handleView = (transaction) => {
    setSelectedTransaction(transaction);
    setViewDialogOpen(true);
  };

  const modifiedColumns = [
    ...(type === "Airtime"
      ? airtimeTransactionsColumns(airtimeType)
      : transactionsColumns(type)),
    {
      field: "",
      title: "Action",
      export: false,
      render: (data) => {
        return (
          <ActionMenu>
            <MenuItem sx={{ fontSize: 13 }} onClick={() => handleView(data)}>
              View
            </MenuItem>
            {["Voucher", "Ticket", "Prepaid"].includes(data?.domain) &&
              data?.status === "completed" && (
                <MenuItem
                  sx={{ fontSize: 13 }}
                  onClick={() => handleDownload(data?.id, data?.downloadLink)}
                >
                  Download
                </MenuItem>
              )}
            {/* <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => removeTransaction(data?._id)}
            >
              Remove
            </MenuItem> */}
          </ActionMenu>
        );
      },
    },
  ];

    if (!user?.id) return <Navigate to="/"  replace/>;

  return (
    <>
    <Container sx={{ py: 2 }}>
      <CustomTitle
        // icon={<NoteAlt sx={{ width: 50, height: 50 }} color="primary" />}
        title="Transactions"
        subtitle="View and manage all your transaction history."
      />

      {isMobile ? (
        <TransactionList
          data={sortedTransactions}
          isLoading={transactions.isLoading}
          onRefresh={transactions.refetch}
          total={currencyFormatter(
            _.sumBy(sortedTransactions, (item) => Number(item?.amount)),
          )}
          type={type}
          setType={setType}
          airtimeType={airtimeType}
          setAirtimeType={setAirtimeType}
          status={status}
          setStatus={setStatus}
          onDownload={handleDownload}
        />
      ) : (
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
            selection: false,
          }}
          // onDeleteAll={removeTransaction}
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
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ width: 250, my: 2 }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </TextField>

              <CustomTotal
                title="Total Amount"
                total={currencyFormatter(
                  _.sumBy(sortedTransactions, (item) => Number(item?.amount)),
                )}
              />
            </Box>
          }
        />
      )}
    </Container>

    <TransactionDetailsDialog
  open={viewDialogOpen}
  onClose={() => setViewDialogOpen(false)}
  transaction={selectedTransaction}
/>
    </>
  );
};

export default Transaction;
