import { useContext, useMemo, useState } from "react";
import _ from "lodash";
import {
  Box,
  Button,
  Container,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";

// import Swal from "sweetalert2";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import { PaymentsRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
// import { CustomContext } from "../../context/providers/CustomProvider";

import CustomTitle from "../../components/custom/CustomTitle";
import { AuthContext } from "../../context/providers/AuthProvider";
import { airtimeTransactionsColumns } from "../../mocks/columns";
import NewTransfer from "./NewTransfer";
import { useSearchParams } from "react-router-dom";
import { getAgentTransactions } from "../../api/agentAPI";

import { currencyFormatter } from "../../constants";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";
import CustomTotal from "../../components/custom/CustomTotal";

function AirtimeTransaction() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useContext(AuthContext);
  const [openPicker, setOpenPicker] = useState(false);
  const [type, setType] = useState("all");
  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const transactions = useQuery({
    queryKey: ["agent-airtime-transactions", date[0]],
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

  // const { mutateAsync } = useMutation({ mutationFn: sendAirtime });

  // const handleResend = (data) => {
  //   const values = {
  //     recipient: data?.recipient,
  //     network: data?.provider,
  //     amount: data?.amount,
  //   };

  //   Swal.fire({
  //     title: "Processing",
  //     text: `Resend Airtime?`,
  //     showCancelButton: true,
  //   }).then(({ isConfirmed }) => {
  //     if (isConfirmed) {
  //       Swal.update({
  //         icon: "info",
  //         title: "Processing",
  //         text: "Transfering the airtime please wait",
  //         backdrop: false,
  //         timer: 10000,
  //       });

  //       mutateAsync(values, {
  //         onSettled: () => {
  //           Swal.close();
  //           queryClient.invalidateQueries(["agent-transactions"]);
  //         },
  //         onSuccess: () => {
  //           customDispatch(globalAlertType("info", "Transaction Completed!"));
  //         },
  //         onError: (error) => {
  //           customDispatch(globalAlertType("error", error));
  //         },
  //       });
  //     }
  //   });
  // };

  // const statusMutate = useMutation({
  //   mutationFn: checkAgentTransactionStatus,
  // });

  // const handleCheckStatus = (reference) => {
  //   statusMutate.mutateAsync(
  //     { reference },
  //     {
  //       onSettled: () => {
  //         queryClient.invalidateQueries(["agent-transactions"]);
  //       },
  //       onSuccess: () => {
  //         Swal.fire({
  //           icon: "info",
  //           title: "Transaction Status",
  //           html: `<p>Hello</p>`,
  //           backdrop: false,
  //           timer: 10000,
  //         });
  //       },
  //       onError: () => {
  //         Swal.fire({
  //           icon: "error",
  //           title: "Processing Failed!",
  //           text: "Could not fetch transaction status",
  //           backdrop: false,
  //           timer: 10000,
  //         });
  //       },
  //     }
  //   );
  // };

  // const removeMutate = useMutation({
  //   mutationFn: removeAgentTransactions,
  // });
  // const handleRemoveTransaction = (id) => {
  //   Swal.fire({
  //     title: "Deleting",
  //     text: `Remove Transaction?`,
  //     showCancelButton: true,
  //   }).then(({ isConfirmed }) => {
  //     if (isConfirmed) {
  //       removeMutate.mutateAsync(
  //         { id },
  //         {
  //           onSettled: () => {
  //             queryClient.invalidateQueries(["agent-transactions"]);
  //           },
  //           onSuccess: () => {
  //             customDispatch(globalAlertType("info", "Transaction Removed!"));
  //           },
  //           onError: (error) => {
  //             customDispatch(globalAlertType("error", error));
  //           },
  //         }
  //       );
  //     }
  //   });
  // };

  // const modifiedColumns = [
  //   ...airtimeTransactionsColumns,
  //   {
  //     field: "",
  //     title: "Action",
  //     export: false,
  //     render: (data) => {
  //       return (
  //         <ActionMenu>
  //           {data?.status !== "completed" && (
  //             <MenuItem
  //               sx={{ fontSize: 13 }}
  //               onClick={() => handleResend(data)}
  //             >
  //               Resend
  //             </MenuItem>
  //            )}
  //           <MenuItem
  //             sx={{ fontSize: 13 }}
  //             onClick={() => handleCheckStatus(data?.reference)}
  //           >
  //             Check Status
  //           </MenuItem>
  //           <MenuItem
  //             sx={{ fontSize: 13 }}
  //             onClick={() => handleRemoveTransaction(data?._id)}
  //           >
  //             Remove
  //           </MenuItem>
  //         </ActionMenu>
  //       );
  //     },
  //   },
  // ];

  return (
    <>
      <Box sx={{ paddingY: 2 }}>
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
