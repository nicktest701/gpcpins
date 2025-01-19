import { useState } from "react";
import {
  Container,
  Box,
  ListItemText,
  Divider,
  Button,
  ButtonGroup,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";

import CustomTitle from "../../components/custom/CustomTitle";
import { PaymentsRounded } from "@mui/icons-material";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { useSearchParams } from "react-router-dom";
import TopUpRequest from "./TopUpRequest";
import { getWalletBalance, getWalletTransaction } from "../../api/userAPI";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useContext } from "react";
import { currencyFormatter } from "../../constants";
import { WALLET_TOPUP_TRANSACTIONS } from "../../mocks/columns";
import CustomDateRangePicker from "../../components/pickers/CustomDateRangePicker";
import CustomRangePicker from "../../components/pickers/CustomRangePicker";
import CustomTotal from "../../components/custom/CustomTotal";
import ChangePin from "./ChangePin";
function Wallet() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [openPicker, setOpenPicker] = useState(false);
  const [date, setDate] = useState([
    {
      startDate: new Date("2024-01-01"),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const walletBalance = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    initialData: 0,
  });

  const transactions = useQuery({
    queryKey: ["user_wallet_transactions", date[0]],
    queryFn: () => getWalletTransaction(date[0]),
    enabled: !!user?.id,
    initialData: [],
  });

  const openAddMoney = () => {
    setSearchParams((params) => {
      params.set("add-money", "true");
      return params;
    });
  };
  const openChangePin = () => {
    setSearchParams((params) => {
      params.set("view_pin", "true");
      return params;
    });
  };

  return (
    <>
      <Container sx={{ paddingY: 2 }}>
        <CustomTitle
          title="Wallet"
          subtitle="View and Track all the amount deposited into your wallet."
          icon={
            <PaymentsRounded sx={{ width: 50, height: 50 }} color="primary" />
          }
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            // bgcolor: "primary.lighter",
            border: "1px solid lightgray",
          }}
        >
          <ListItemText
            primary={currencyFormatter(walletBalance.data)}
            primaryTypographyProps={{ fontSize: "1.5rem", fontWeight: "bold" }}
            secondary="Current Wallet Balance"
            secondaryTypographyProps={{ color: "secondary" }}
          />
          <ButtonGroup variant="contained">
            <Button onClick={openAddMoney}>Request Top-up</Button>
            <Button onClick={openChangePin} color="secondary">
              Change Pin
            </Button>
          </ButtonGroup>
        </Box>
        <Divider />
        <CustomizedMaterialTable
          title="Wallet Deposits & Purchases"
          isLoading={transactions.isLoading}
          columns={WALLET_TOPUP_TRANSACTIONS}
          data={transactions?.data}
          onRefresh={transactions.refetch}
          showExportButton={true}
          search
          autocompleteComponent={
            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <CustomRangePicker
                date={date}
                setDate={setDate}
                setOpen={setOpenPicker}
                refetch={transactions.refetch}
              />

              <CustomTotal
                title="Total "
                total={currencyFormatter(
                  _.sumBy(transactions?.data, (item) => Number(item?.amount))
                )}
              />
            </Box>
          }
        />
      </Container>
      <TopUpRequest />
      <CustomDateRangePicker
        open={openPicker}
        setOpen={setOpenPicker}
        date={date}
        setDate={setDate}
        refetchData={transactions.refetch}
      />
      <ChangePin />
    </>
  );
}

export default Wallet;
