import {  Button, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ViewAgendaOutlined, WalletOutlined } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { useSearchParams, useNavigate } from "react-router-dom";
// import AddMoney from "./AddMoney";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useContext } from "react";
import { USERS_WALLET } from "../../mocks/columns";
import { AllUsersWallet } from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";
import { generateRandomCode } from "../../config/generateRandomCode";
import CustomTitle from "../../components/custom/CustomTitle";
import CustomTotal from "../../components/custom/CustomTotal";

function UsersWallet() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const transactions = useQuery({
    queryKey: ["user_wallets"],
    queryFn: () => AllUsersWallet(),
    enabled: !!user?.id,
    initialData: [],
  });

  const openAddMoney = (data) => {
    setSearchParams((params) => {
      params.set("WujEuJWE", generateRandomCode(200));
      params.set("rowID", data?._id);
      params.set("type", "user");
      params.set("top-up-money", "true");
      return params;
    });
  };

  const openUserWalletTransactions = () => {
    navigate("users/transactions");
  };

  const columns = [
    ...USERS_WALLET("users"),
    user?.permissions?.includes("Topup user wallet amount") && {
      field: null,
      title: "Action",
      render: (rowData) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => openAddMoney(rowData)}
        >
          Top Up
        </Button>
      ),
    },
  ];

  return (
    <>
      <CustomTitle
        title="Users Wallet Summary"
        subtitle="Manage and View all the wallet top ups"
        icon={<WalletOutlined sx={{ width: 50, height: 50 }} color="primary" />}
      />
    
        <CustomizedMaterialTable
          title="Wallet Balance"
          isLoading={transactions.isLoading}
          columns={columns}
          data={transactions?.data}
          onRefresh={transactions.refetch}
          showExportButton={true}
          search={true}
          autocompleteComponent={
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
              }}
            >
              {user?.permissions?.includes("View user wallet Transaction") && (
                <Button
                  variant="contained"
                  startIcon={<ViewAgendaOutlined />}
                  onClick={openUserWalletTransactions}
                  // sx={{ alignSelf: "flex-end" }}
                >
                  View Wallet Transactions
                </Button>
              )}

              <CustomTotal
                title="NUMBER OF WALLETS"
                total={transactions?.data?.length}
              />
              <CustomTotal
                title="total Amount"
                total={currencyFormatter(
                  _.sumBy(transactions?.data, (item) => Number(item?.amount))
                )}
              />
            </Box>
          }
          options={{
            exportAllData: true,
            exportButton: user?.permissions?.includes(
              "Export user wallet balance"
            ),
          }}
        />
   
      {/* <AddMoney /> */}
    </>
  );
}

export default UsersWallet;
