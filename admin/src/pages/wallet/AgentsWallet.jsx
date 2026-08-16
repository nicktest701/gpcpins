import { Button, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ViewAgendaOutlined, WalletOutlined } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
import { useNavigate } from "react-router-dom";

import { USERS_WALLET } from "@/mocks/columns";
import { AllAgentsWallet } from "@/api/transactionAPI";
import { currencyFormatter } from "@/constants";
import CustomTitle from "@/components/custom/CustomTitle";
import CustomTotal from "@/components/custom/CustomTotal";

import { useAuth } from "@/context/providers/AuthProvider";

function AgentsWallet() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const transactions = useQuery({
    queryKey: ["agent_wallets"],
    queryFn: AllAgentsWallet,
    enabled: !!user?.id,
    initialData: [],
  });

  const openAgentWalletTransactions = () => {
    navigate("/wallets/agents/transactions");
  };

  const columns = [...USERS_WALLET("agents")];

  return (
    <>
      <CustomTitle
        title="Agents Wallet Summary"
        subtitle="Manage your agents wallet information"
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
            

              {user?.permissions?.includes("View agent wallet Transaction") && (
                <Button
                  variant="contained"
                  startIcon={<ViewAgendaOutlined />}
                  onClick={openAgentWalletTransactions}
                 
                >
                  View Wallet Transactions
                </Button>
              )}
            </Box>

              <CustomTotal
                title="NUMBER OF WALLETS"
                total={transactions?.data?.length}
              />
          </>
        }
        options={{
          exportAllData: true,
          exportButton: user?.permissions?.includes(
            "Export agent wallet balance",
          ),
        }}
      />

      {/* <AddMoney /> */}
    </>
  );
}

export default AgentsWallet;
