import {
  Container,
  Box,
  ListItemText,
  TextField,
  MenuItem,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import _ from "lodash";
import CustomizedMaterialTable from "../../../components/tables/CustomizedMaterialTable";
import { useParams } from "react-router-dom";
import AddMoney from "./AddMoney";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { useContext, useMemo, useState } from "react";
import { AGENT_TRANSACTIONS } from "../../../mocks/columns";
import { getAgentTransaction } from "../../../api/transactionAPI";
import { currencyFormatter } from "../../../constants";

function AgentTransaction() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();
  const [type, setType] = useState("All");

  const transactions = useQuery({
    queryKey: ["agent_transactions", id],
    queryFn: () => getAgentTransaction(id),
    enabled: !!user?.id && !!id,
    initialData: [],
  });

  const sortedTransactions = useMemo(() => {
    let modifiedTransactions = transactions.data;

    if (type !== "All") {
      return modifiedTransactions?.filter((item) => item.type === type);
    }
    return modifiedTransactions;
  }, [transactions?.data, type]);

  return (
    <>
      <Container sx={{ paddingY: 2, bgcolor: "#fff" }}>
        <CustomizedMaterialTable
          title="Transactions"
          isLoading={transactions.isLoading}
          columns={AGENT_TRANSACTIONS}
          data={sortedTransactions}
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
              <TextField
                select
                label="Select Type"
                size="small"
                value={type}
                onChange={(e) => setType(e.target.value)}
                sx={{ width: 200, my: 2 }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="airtime">Airtime Transfer </MenuItem>
                <MenuItem value="bundle">Data Bundle </MenuItem>
              </TextField>
              <ListItemText
                sx={{ textAlign: { xs: "left", md: "right" } }}
                primary={currencyFormatter(
                  _.sumBy(sortedTransactions, (item) => Number(item?.amount))
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

export default AgentTransaction;
