import { useContext, useMemo, useState } from "react";
import CustomTitle from "../../components/custom/CustomTitle";
import { Container, MenuItem, TextField, Box } from "@mui/material";
import { NoteAlt } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { AuthContext } from "../../context/providers/AuthProvider";
import Swal from "sweetalert2";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTransactionByEmail,
  removeAnyTransaction,
} from "../../api/transactionAPI";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import {
  transactionsColumns,
  airtimeTransactionsColumns,
} from "../../mocks/columns";
import ActionMenu from "../../components/menu/ActionMenu";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import CustomTotal from "../../components/custom/CustomTotal";
import { currencyFormatter } from "../../constants";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";

const Transaction = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);
  const [type, setType] = useState("All");
  const [status, setStatus] = useState("all");
  const [airtimeType, setAirtimeType] = useState("single");
  const [openPicker, setOpenPicker] = useState(false);
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
      filteredTransaction =filteredTransaction?.filter(
        (item) => item.status === status
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

  const { isLoading, mutateAsync } = useMutation({
    mutationFn: removeAnyTransaction,
  });

  const removeTransaction = (id) => {
    Swal.fire({
      title: "Removing",
      text: "Do you want to remove transaction?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync([id], {
          onSettled: () => {
            queryClient.invalidateQueries({
              queryKey: [
                "prepaid-transaction-email",
                user?.email,
                user?.phonenumber,
              ],
            });
          },
          onSuccess: () => {
            customDispatch(globalAlertType("info", "Transaction Removed!"));
          },
          onError: () => {
            customDispatch(
              globalAlertType(
                "error",
                "Failed to remove transaction! An error has occurred!"
              )
            );
          },
        });
      }
    });
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
            {["Voucher", "Ticket", "Prepaid"].includes(data?.domain) &&
              data?.status === "completed" && (
                <MenuItem
                  sx={{ fontSize: 13 }}
                  onClick={() => handleDownload(data?._id, data?.downloadLink)}
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

  return (
    <Container sx={{ py: 2 }}>
      <CustomTitle
        icon={<NoteAlt sx={{ width: 50, height: 50 }} color="primary" />}
        title="Transactions"
        subtitle="Manage all your transactions made."
      />

      <CustomizedMaterialTable
        isLoading={transactions.isLoading || isLoading}
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
        onDeleteAll={removeTransaction}
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

            <CustomRangePicker
              date={date}
              setDate={setDate}
              setOpen={setOpenPicker}
              refetch={transactions.refetch}
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
      <CustomDateRangePicker
        open={openPicker}
        setOpen={setOpenPicker}
        date={date}
        setDate={setDate}
        refetchData={transactions.refetch}
      />
    </Container>
  );
};

export default Transaction;
