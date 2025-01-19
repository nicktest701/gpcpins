import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DataObjectRounded,
  Home,
  CardMembership,
  PersonOutlined,
} from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import { AuthContext } from "../../context/providers/AuthProvider";

function BottomNav() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // const [bot, setBot] = useState(0);
  const [value, setValue] = useState(0);

  const handleNavigate = (path) => navigate(path, { replace: true });



  const getIconColor = (route) => {
    return route.test(pathname) ? "info.main" : "pink";
  };

  return (
    <Paper
      sx={{
        // display: 'none',
        display: { xs: "block", md: "none" },

        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
      elevation={3}
    >
      <BottomNavigation
      
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
      >
        <BottomNavigationAction
          label="Home"
          icon={<Home  />}
          onClick={() => handleNavigate("/")}
          color={getIconColor(/^\/$/)}
        
        />
        <BottomNavigationAction
          sx={{
            whiteSpace: "nowrap",
            // color: getIconColor(/^\/airtime$/),
          }}
          label="Airtime"
          icon={<CardMembership />}
          onClick={() => handleNavigate("airtime/transactions")}
        />
        <BottomNavigationAction
          label="Data Bundle"
          sx={{
            whiteSpace: "nowrap",
            // color: getIconColor(/^\/bundle$/),
            fontSize: 10,
          }}
          icon={<DataObjectRounded />}
          onClick={() => handleNavigate("bundle/transactions")}
        />

        <BottomNavigationAction
          label="Profile"
          icon={<PersonOutlined />}
          sx={{
            whiteSpace: "nowrap",
            // color: getIconColor(/^\/profile$/),
          }}
          onClick={() => handleNavigate("profile")}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
