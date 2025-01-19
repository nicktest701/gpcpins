import { Container, Paper } from "@mui/material";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";

import ProfileSidebar from "./ProfileSidebar";
import { AuthContext } from "../../context/providers/AuthProvider";
import CustomTitle from "../../components/custom/CustomTitle";
import { VerifiedUser } from "@mui/icons-material";

const Profile = () => {
  const { user } = useContext(AuthContext);

  if (!user?.id) {
    return <Navigate to="/auth/login" />;
  }
  return (
    <>
      <Container>
        <CustomTitle
          title="Profile"
          subtitle="Manage your profile information"
          icon={<VerifiedUser sx={{ width: 50, height: 50 }} color="primary" />}
        />

        <ProfileSidebar />

        <Paper
          elevation={1}
          sx={{
            flexGrow: 1,
            p: 2,
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </>
  );
};

export default Profile;
