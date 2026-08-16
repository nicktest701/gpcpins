import { Button, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ViewAgendaOutlined, WalletOutlined } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
import { useSearchParams, useNavigate } from "react-router-dom";
// import AddMoney from "./AddMoney";
import { useAuth } from "@/context/providers/AuthProvider";

import { USERS_WALLET } from "@/mocks/columns";
import { AllUsersWallet } from "@/api/transactionAPI";
import { currencyFormatter } from "@/constants";

import CustomTitle from "@/components/custom/CustomTitle";
import CustomTotal from "@/components/custom/CustomTotal";

function UsersWallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const transactions = useQuery({
    queryKey: ["user_wallets"],
    queryFn: AllUsersWallet,
    enabled: !!user?.id,
    initialData: [],
  });

  const openUserWalletTransactions = () => {
    navigate("users/transactions");
  };

  const columns = [...USERS_WALLET("users")];

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
          <>
        
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: "center",
                gap: 4,
                mb:5
              }}
            >
                  <CustomTotal
              title="total Amount"
              total={currencyFormatter(
                _.sumBy(transactions?.data, (item) => Number(item?.amount)),
              )}
            />
              {/* <CustomTotal
                title="NUMBER OF WALLETS"
                total={transactions?.data?.length}
              /> */}
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
            </Box>
          </>
        }
        options={{
          exportAllData: true,
          exportButton: user?.permissions?.includes(
            "Export user wallet balance",
          ),
        }}
      />

      {/* <AddMoney /> */}
    </>
  );
}

export default UsersWallet;
