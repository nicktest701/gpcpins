import { Container, Button, Box, ListItemText } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { Add } from "@mui/icons-material";
import _ from "lodash";
import CustomizedMaterialTable from "../../../components/tables/CustomizedMaterialTable";
import { useSearchParams, useParams } from "react-router-dom";
import AddMoney from "./AddMoney";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { useContext } from "react";
import { WALLET_TOPUP_TRANSACTIONS } from "../../../mocks/columns";
import { getAgentWalletTransaction } from "../../../api/transactionAPI";
import { currencyFormatter } from "../../../constants";

function AgentWallet() {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { id } = useParams();

  const transactions = useQuery({
    queryKey: ["agent_wallet_transactions", id],
    queryFn: () => getAgentWalletTransaction(id),
    enabled: !!user?.id && !!id,
    initialData: [],
  });

  const openAddMoney = () => {
    setSearchParams((params) => {
      // params.set("data", JSON.stringify(data));
      params.set("add-money", "true");
      return params;
    });
  };
  return (
    <>
      <Container sx={{ paddingY: 2, bgcolor: "#fff" }}>
        <CustomizedMaterialTable
          title="Wallet Deposits"
          isLoading={transactions.isLoading}
          columns={WALLET_TOPUP_TRANSACTIONS}
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
              {user?.permissions?.includes("Topup agent wallet amount") && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={openAddMoney}
                  // sx={{ alignSelf: "flex-end" }}
                >
                  Add Money to Wallet
                </Button>
              )}
              <ListItemText
                sx={{ textAlign: { xs: "left", md: "right" } }}
                primary={currencyFormatter(
                  _.sumBy(transactions?.data, (item) => Number(item?.amount))
                )}
                primaryTypographyProps={{
                  fontWeight: "bold",
                  fontSize: "2rem",
                }}
                secondary="TOTAL"
                secondaryTypographyProps={{ color: "secondary" }}
              />
            </Box>
          }
        />
      </Container>
      <AddMoney />
    </>
  );
}

export default AgentWallet;
