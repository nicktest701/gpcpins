import { Button, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { ViewAgendaOutlined, WalletOutlined } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { useSearchParams, useNavigate } from "react-router-dom";
// import AddMoney from "./AddMoney";

import { USERS_WALLET } from "../../mocks/columns";
import { AllAgentsWallet } from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";
import { generateRandomCode } from "../../config/generateRandomCode";
import CustomTitle from "../../components/custom/CustomTitle";
import CustomTotal from "../../components/custom/CustomTotal";
import { useCustomContext } from "@/context/providers/CustomProvider";

function AgentsWallet() {
  const { user } = useCustomContext();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const transactions = useQuery({
    queryKey: ["agent_wallets"],
    queryFn: () => AllAgentsWallet(),
    enabled: !!user?.id,
    initialData: [],
  });

 

  const openAgentWalletTransactions = () => {
    navigate("/wallets/agents/transactions");
  };

  const columns = [
    ...USERS_WALLET("agents"),
  
  ];

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
                <CustomTotal
              title="total Amount"
              total={currencyFormatter(
                _.sumBy(transactions?.data, (item) => Number(item?.amount))
              )}
            />
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
            
            <CustomTotal
              title="NUMBER OF WALLETS"
              total={transactions?.data?.length}
            />
      
            {user?.permissions?.includes("View agent wallet Transaction") && (
              <Button
                variant="contained"
                startIcon={<ViewAgendaOutlined />}
                onClick={openAgentWalletTransactions}
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
            "Export agent wallet balance"
          ),
        }}
      />

      {/* <AddMoney /> */}
    </>
  );
}

export default AgentsWallet;
