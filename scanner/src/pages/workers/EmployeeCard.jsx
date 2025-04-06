import { Avatar, Box, Typography } from "@mui/material";
import SouthEastIcon from "@mui/icons-material/SouthEast";
import { useNavigate } from "react-router-dom";
import { getInitials } from "../../config/validation";

function EmployeeCard({ _id, name, email, phonenumber, profile }) {
  const navigate = useNavigate();

  //VIEW Employee Details
  const handleViewEmployee = () => {
    navigate(`/verifiers/${_id}`);
  };

  return (
    <Box
      sx={{
        minWidth: 280,
        height: "auto",
        borderRadius: 1,
        boxShadow: (theme) => theme.customShadows.z8,
        bgcolor: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent:'center',
        alignItems: "center",
        gap: "2px",
        p: 2,
        cursor: "pointer",
        transition: "all 100ms ease-in-out",
        "&:hover": {
          transform: "scale(1.02)",
        },
      }}
      onClick={handleViewEmployee}
    >
      <Avatar
        sx={{
          width: 80,
          height: 80,
          alignSelf: "center",
          bgcolor: "secondary.main",
          mb: 2,
        }}
        src={profile}
      >
        {getInitials(name)}
      </Avatar>
      <Typography width='100%' maxWidth={250} color="primary" textTransform="uppercase" textAlign="center">
        {name}
      </Typography>
      <Typography
        textAlign="center"
        variant="caption"
        whiteSpace="wrap"
        textTransform="lowercase"
      >
        {email}
      </Typography>
      <Typography textAlign="center" variant="body2">
        {phonenumber}
      </Typography>
      <SouthEastIcon sx={{ alignSelf: "end" }} />
    </Box>
  );
}

export default EmployeeCard;
