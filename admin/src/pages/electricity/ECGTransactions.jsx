import { useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  MenuItem,
  Stack,
  TextField,
  Box,
  AlertTitle,
} from "@mui/material";
import Swal from "sweetalert2";
import _ from "lodash";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import { NotificationsRounded, PaymentsRounded } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllElectricityPayment } from "../../api/paymentAPI";
import { getAllNotifications } from "../../api/notificationAPI";
import CustomTitle from "../../components/custom/CustomTitle";
import tone from "../../assets/sound/tone.wav";
import { AuthContext } from "../../context/providers/AuthProvider";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";
import CustomTotal from "../../components/custom/CustomTotal";
import { currencyFormatter } from "../../constants";
import { useNavigate } from "react-router-dom";
import ActionMenu from "../../components/menu/ActionMenu";
import { PROCESSED_TRANSACTIONS } from "../../mocks/columns";

function ECGTransactions() {
  const { user } = useContext(AuthContext);
  const [showAlert, setShowAlert] = useState(true);
  const [isPlayed, setIsPlayed] = useState(false);
  const navigate = useNavigate();
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
    queryKey: ["ecg-transactions"],
    queryFn: () => getAllElectricityPayment(date[0]),
    enabled: !!date[0],
  });

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
  });

  const notif = useMemo(() => {
    return notifications?.data?.filter(({ active }) => active === true)?.length;
  }, [notifications?.data]);

  const unprocessedTransactions = useMemo(() => {
    return transactions?.data?.filter(
      ({ isProcessed }) => isProcessed === false
    );
  }, [transactions?.data]);

  useEffect(() => {
    if (!isPlayed && unprocessedTransactions?.length > 0) {
      // Play the notification sound
      const notificationSound = new Audio(tone);
      notificationSound.play();

      Swal.fire({
        icon: "info",
        title: "Prepaid Transaction",
        text: "You have some pending transactions to process!",
        // toast: true,
        position: "top-end",
        backdrop: false,
        timer: 10000,
      });
      setIsPlayed(true);
    }
  }, [user, unprocessedTransactions?.length, isPlayed]);

  const sortedTransactions = useMemo(() => {
    if (type == "processed") {
      return transactions?.data?.filter((item) => item.isProcessed === true);
    }
    if (type == "unprocessed") {
      return transactions?.data?.filter((item) => item.isProcessed === false);
    }

    return transactions?.data;
  }, [transactions?.data, type]);

  const handleViewNotifications = () => {
    navigate(`/electricity/notifications`);
  };

  const updateECGPayment = (id) => {
    navigate(`/electricity/process?row_id=${id}`);
  };

  const viewTransactionStatus = (id) => {
    navigate(`/electricity/process?view_status=true&row_id=${id}`);
  };

  const columns = [
    ...PROCESSED_TRANSACTIONS,
    {
      field: "",
      title: "Action",
      export: false,
      render: (data) => {
        return (
          <ActionMenu>
            <MenuItem
              sx={{ fontSize: 13 }}
              onClick={() => viewTransactionStatus(data._id)}
            >
              View
            </MenuItem>
            {user?.permissions?.includes("Process Prepaid Transaction") && (
              <MenuItem
                sx={{ fontSize: 13 }}
                onClick={() => updateECGPayment(data?._id)}
              >
                {data?.isProcessed
                  ? "Reprocess Transaction"
                  : "Process Transaction"}
              </MenuItem>
            )}
          </ActionMenu>
        );
      },
    },
  ];



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
                  sx={{ width: 200, my: 2 }}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="processed">Processed</MenuItem>
                  <MenuItem value="unprocessed">Unprocessed</MenuItem>
                </TextField>
                <CustomTotal
                  title="Total"
                  total={currencyFormatter(
                    _.sumBy(sortedTransactions, (item) =>
                      Number(item?.info?.amount)
                    )
                  )}
                />
              </Stack>
            }
            actions={[
              {
                icon: () => (
                  <Badge badgeContent={notif} color="error">
                    <NotificationsRounded />
                  </Badge>
                ),
                isFreeAction: true,
                onClick: handleViewNotifications,
              },
            ]}
            // onRowClick={updateECGPayment}
            onRefresh={transactions.refetch}
            options={{
              exportAllData: true,
              exportButton: user?.permissions?.includes(
                "Export Prepaid Transaction"
              ),
            }}
          />
        </Box>
        <CustomDateRangePicker
          open={openPicker}
          setOpen={setOpenPicker}
          date={date}
          setDate={setDate}
          refetchData={transactions.refetch}
        />
      </>

      {/* <ViewECGTransactionNotifications /> */}
    </>
  );
}

export default ECGTransactions;
