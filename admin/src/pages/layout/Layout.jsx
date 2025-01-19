import { useContext } from "react";
import { Navigate } from "react-router-dom";
import Main from "./Main";
import Sidebar from "./Sidebar";

import { Box } from "@mui/material";
import { AuthContext } from "../../context/providers/AuthProvider";

function Layout() {
  const { user } = useContext(AuthContext);

  if (!user?.id) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          aligItems: "start",
          justifyContent: "flex-start",
          
        }}
      >
        <Sidebar />

        <Main />
      </Box>
    </>
  );
}

export default Layout;
