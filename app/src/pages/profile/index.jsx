import { Container, Box } from "@mui/material";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { AuthContext } from "../../context/providers/AuthProvider";
import CustomTitle from "../../components/custom/CustomTitle";

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user?.id) {
    return <Navigate to="/" />;
  }
  return (
    <Container sx={{ minHeight: "100svh" }}>
      <CustomTitle
        title="Profile"
        subtitle="Manage and control your preferences"
      />
      {/* <ProfileSidebar /> */}
      <Box sx={{ py: 4, bgcolor: "#fff" }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default Profile;
