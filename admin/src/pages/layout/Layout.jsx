import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Box } from "@mui/material";
import Main from "./Main";
import { AuthContext } from "../../context/providers/AuthProvider";
import MainSidebar from "@/components/sidebar/MainSidebar";

function Layout() {
  const { user } = useContext(AuthContext);

  if (!user?.id) {
    return <Navigate to="/auth/login" />;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "stretch", width: "100%", minHeight: "100svh" }}>
      <MainSidebar />

      {/* flexGrow + minWidth: 0 keeps Main from overflowing next to a flex sibling;
          the top padding on mobile clears the floating menu trigger. */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          // pt: { xs: 7, md: 0 },
        }}
      >
        <Main />
      </Box>
    </Box>
  );
}

export default Layout;