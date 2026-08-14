import { Container, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import {useParams } from "react-router-dom";
import AddMoney from "./AddMoney";
import {  useAuth } from "../../context/providers/AuthProvider";

import { WALLET_TOPUP_TRANSACTIONS } from "../../mocks/columns";
import { getUserWalletTransaction } from "../../api/transactionAPI";
import { currencyFormatter } from "../../constants";
import CustomTotal from "../../components/custom/CustomTotal";

function UserWallet() {
  const { user } =useAuth()
  const { id } = useParams();

  const transactions = useQuery({
    queryKey: ["user_wallet_transactions", id],
    queryFn: () => getUserWalletTransaction(id),
    enabled: !!user?.id && !!id,
    initialData: [],
  });


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
              {/* {user?.permissions?.includes("Topup user wallet amount") && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={openAddMoney}
                  // sx={{ alignSelf: "flex-end" }}
                >
                  Add Money to Wallet
                </Button>
              )} */}

              <CustomTotal
                title="TOTAL AMOUNT"
                total={currencyFormatter(
                  _.sumBy(transactions?.data, (item) => Number(item?.amount))
                )}
              />
            </Box>
          }
        />
      </Container>
      <AddMoney />
    </>
  );
}

export default UserWallet;
