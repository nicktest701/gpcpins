import {
  Button,
  Container,
  Dialog,
  DialogContent,
  MenuItem,
  Typography,
  Stack,
} from "@mui/material";
import { useContext } from "react";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomizedMaterialTable from "../../../components/tables/CustomizedMaterialTable";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import _ from "lodash";
import CustomTotal from "../../../components/custom/CustomTotal";
import { currencyFormatter } from "../../../constants";
import {
  deletePrepaidTransaction,
  getAllElectricityPaymentByUserId,
} from "../../../api/paymentAPI";
import { CustomContext } from "../../../context/providers/CustomProvider";
import PaymentReceipt from "./PaymentReceipt";
import { globalAlertType } from "../../../components/alert/alertType";
import { AuthContext } from "../../../context/providers/AuthProvider";
import ActionMenu from "../../../components/menu/ActionMenu";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";

const PrepaidTransactions = ({ open, setOpen }) => {
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);

  const transactions = useQuery({
    queryKey: ["ecg-transaction-info", user?.id],
    queryFn: () => getAllElectricityPaymentByUserId(user?.id),
    enabled: !!user?.id,
    initialData: [],
  });

  const handleClose = () => setOpen(false);

  const modifiedColumns = [
    {
      title: "Date",
      field: "createdAt",
      render: ({ createdAt }) => moment(createdAt).format("LLL"),
      searchable: true,
      customFilterAndSearch: (data, rowData) => {
        const date = moment(rowData.createdAt).format("LLL");
        return date.toLowerCase().lastIndexOf(data.toLowerCase()) > -1;
      },
    },
    { title: "Id", field: "_id", hidden: true, export: true },
    { title: "Token", field: "paymentId", hidden: true, export: true },
    { title: "OrderNo", field: "info.orderNo", hidden: true, export: true },
    {
      title: "ORDER NO/TOKEN",
      field: null,
      searchable: true,
      customFilterAndSearch: (data, { paymentId, info }) => {
        return (
          paymentId.toLowerCase().lastIndexOf(data.toLowerCase()) > -1 ||
          info?.orderNo.toLowerCase().lastIndexOf(data.toLowerCase()) > -1
        );
      },
      render: ({ paymentId, info }) => {
        return (
          <Stack>
            <Typography variant="body2" color="primary.main">
              {paymentId}
            </Typography>
            <Typography variant="body2">{info?.orderNo}</Typography>
          </Stack>
        );
      },
    },
    {
      title: "Meter No.",
      field: "meter.number",
      searchable: true,
      render: ({ meter }) => (
        <Button
          size="small"
          sx={{
            bgcolor: "info.lighter",
            color: "info.darker",
          }}
        >
          {meter?.number}
        </Button>
      ),
      export: true,
    },

    { title: "Link", field: "info.downloadLink", hidden: true },
    {
      title: "Top Up Amount",
      field: "topup",
      type: "currency",
      currencySetting: {
        currencyCode: "GHS",
        minimumFractionDigits: 2,
      },
    },
    {
      title: "Charges",
      field: "charges",
      type: "currency",
      currencySetting: {
        currencyCode: "GHS",
        minimumFractionDigits: 2,
      },
    },
    {
      title: "Amount Paid",
      field: "info.amount",
      type: "currency",
      currencySetting: {
        currencyCode: "GHS",
        minimumFractionDigits: 2,
      },
      hidden: true,
      export: true,
    },

    {
      title: "Payment Mode",
      field: "mode",
      hidden: true,
      export: true,
    },
    {
      title: "Total Amount(Mode)",
      field: null,
      searchable: true,
      customFilterAndSearch: (data, { amount, mode }) => {
        return (
          amount.toLowerCase().lastIndexOf(data.toLowerCase()) > -1 ||
          mode.toLowerCase().lastIndexOf(data.toLowerCase()) > -1
        );
      },
      render: ({ amount, mode }) => {
        return (
          <Stack>
            <Typography
              variant="body2"
              color="success.darker"
              fontWeight="bold"
            >
              {currencyFormatter(amount)}
            </Typography>
            <Typography variant="body2">{mode}</Typography>
          </Stack>
        );
      },
    },
    {
      title: "Contact Info.",
      field: null,
      searchable: true,
      customFilterAndSearch: (data, { email, mobileNo }) => {
        return (
          email.toLowerCase().lastIndexOf(data.toLowerCase()) > -1 ||
          mobileNo.toLowerCase().lastIndexOf(data.toLowerCase()) > -1
        );
      },
      render: ({ email, mobileNo }) => {
        return (
          <Stack>
            <Typography variant="body2" color="info.main">
              {email}
            </Typography>
            <Typography variant="body2">{mobileNo}</Typography>
          </Stack>
        );
      },
    },

    { title: "Email Address", field: "info.email", hidden: true, export: true },
    {
      title: "Mobile Number",
      field: "info.mobileNo",
      hidden: true,
      export: true,
    },
    {
      title: "Status",
      field: "isProcessed",
      export: false,
      render: ({ isProcessed }) => (
        <Button
          size="small"
          label={!isProcessed ? "Pending" : "Completed"}
          sx={{
            color: !isProcessed ? "info.darker" : "#fff",
            bgcolor: !isProcessed ? "info.lighter" : "success.darker",
          }}
        >
          {!isProcessed ? "Pending" : "Completed"}
        </Button>
      ),
    },
    {
      field: "",
      title: "Action",
      export: false,
      render: (data) => {
        return (
          <ActionMenu>
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => handleRowClick(data)}
            >
              View
            </MenuItem>
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => removeTransaction(data?._id)}
            >
              Remove
            </MenuItem>
          </ActionMenu>
        );
      },
    },
  ];

  // const columns = modifiedColumns.map((column) => {
  //   return { ...column };
  // });

  const handleRowClick = (rowData) => {
    customDispatch({
      type: "viewEcgTransactionInfo",
      payload: {
        open: true,
        details: rowData,
      },
    });
  };

  const { mutateAsync } = useMutation({
    mutationFn: deletePrepaidTransaction,
  });

  const removeTransaction = (id) => {
    Swal.fire({
      title: "Removing",
      text: "Do you want to remove transaction?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(id, {
          onSettled: () => {
            queryClient.invalidateQueries(["ecg-transaction-info", user?.id]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
          fullScreen
        fullWidth
        // TransitionComponent={Transition}
      >
        <CustomDialogTitle
          title="Prepaid Units Transaction"
          subtitle="View and Manage all your prepaid transactions"
          onClose={handleClose}
        />
        <DialogContent sx={{p:2}}>
          <Container>
            {transactions?.isError ? (
              <Typography>An error has occurred!</Typography>
            ) : (
              <CustomizedMaterialTable
                isLoading={transactions.isLoading}
                title="Transactions"
                search={true}
                columns={modifiedColumns}
                data={transactions.data}
                emptyMessage="No Recent Transaction"
                // onRowClick={handleRowClick}
                actions={[]}
                showExportButton={true}
                onRefresh={transactions.refetch}
                autocompleteComponent={
                  <CustomTotal
                    title="TOTAL AMOUNT"
                    total={currencyFormatter(
                      _.sumBy(transactions?.data, (item) =>
                        Number(item?.info?.amount)
                      )
                    )}
                  />
                }
              />
            )}
          </Container>
        </DialogContent>
      </Dialog>

      <PaymentReceipt />
    </>
  );
};

export default PrepaidTransactions;
