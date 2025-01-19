import { Box } from "@mui/material";
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
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
      <CustomTitle
        title="Profile"
        subtitle="Update your personal information and manage your account settings."
        icon={<VerifiedUser sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <Box sx={{ pt: 4, mt: 4, bgcolor: "#fff" }}>
        <Outlet />
      </Box>
    </>
  );
};

export default Profile;
