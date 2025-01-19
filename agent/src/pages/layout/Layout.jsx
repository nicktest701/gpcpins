import { useContext } from "react";
import { Navigate } from "react-router-dom";
import Main from "./Main";
import Sidebar from "./Sidebar";

import { Box } from "@mui/material";
import { AuthContext } from "../../context/providers/AuthProvider";
import BottomNav from "./BottomNav";

function Layout() {
  const { user } = useContext(AuthContext);

  if (!user?.id) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        aligItems: "start",
      }}
    >
      <Sidebar />

      <Main />
      <BottomNav />
    </Box>
  );
}
export default Layout;
