import Stack from "@mui/material/Stack";
import UserAccount from "./UserAccount";

function UserSettings() {
  return (
    <Stack sx={{ py: 2 }} spacing={4}>
      <UserAccount/>
    </Stack>
  );
}

export default UserSettings;
