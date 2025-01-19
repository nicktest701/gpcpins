import { Container, Box } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";

import CustomTitle from "../../components/custom/CustomTitle";
import { VerifiedUser } from "@mui/icons-material";
import { useAuth } from "../../context/providers/AuthProvider";

const Profile = () => {
  const { user } = useAuth();

  if (!user?.id) {
    return <Navigate to="/auth/login" />;
  }
  return (
    <Container>
      <CustomTitle
        title="Profile"
        subtitle="Manage your profile information"
        icon={<VerifiedUser sx={{ width: 50, height: 50 }} color="primary" />}
      />
      {/* <ProfileSidebar /> */}
      <Box sx={{ p: 4, mt: 4, bgcolor: "#fff" }}>
        <Outlet />
      </Box>
    </Container>
  );
};

export default Profile;
