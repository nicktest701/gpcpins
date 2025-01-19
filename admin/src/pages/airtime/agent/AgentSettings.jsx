import Stack from "@mui/material/Stack";
import AgentCommission from "./AgentCommission";
import AgentPassword from "./AgentPassword";
import AgentAccount from "./AgentAccount";

function AgentSettings() {
  return (
    <Stack sx={{ py: 2 }} spacing={4}>
      <AgentCommission />
      <AgentPassword />
      <AgentAccount/>
    </Stack>
  );
}

export default AgentSettings;
