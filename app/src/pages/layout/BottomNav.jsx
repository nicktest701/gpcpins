import { useContext, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  PaymentRounded,
  MoneyRounded,
  Home,
  Person,
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

  // window.onscroll = function () {
  //   const rootHeight = document.getElementById("root")?.scrollHeight;
  //   const footer = document.querySelector(".main-footer")?.scrollHeight;
  //   const scrollHeight =
  //     document?.documentElement?.clientHeight + window?.scrollY;
  //   if (scrollHeight >= rootHeight - 5) {
  //     setBot(footer);
  //   } else {
  //     setBot(0);
  //   }
  // };

  const getIconColor = (route) => {
    return route.test(pathname) ? "var(--primary)" : "var(--secondary)";
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
          icon={<Home />}
          onClick={() => handleNavigate("/")}
          sx={{
            whiteSpace: "nowrap",
            color: getIconColor(/^\/$/),
          }}
        />
        <BottomNavigationAction
          sx={{
            whiteSpace: "nowrap",
            color: getIconColor(/^\/evoucher$/),
          }}
          label="Vouchers"
          icon={<PaymentRounded />}
          onClick={() => handleNavigate("/evoucher")}
        />
        <BottomNavigationAction
          label="Prepaid"
          sx={{
            whiteSpace: "nowrap",
            color: getIconColor(/^\/electricity$/),
            fontSize: 10,
          }}
          icon={<MoneyRounded />}
          onClick={() => handleNavigate("/electricity")}
        />
        <BottomNavigationAction
          label="Airtime/Bundle"
          sx={{
            whiteSpace: "nowrap",
            color: getIconColor(/^\/airtime$/),
          }}
          icon={<CardMembership />}
          onClick={() => handleNavigate("/airtime")}
        />
        {user?.id ? (
          <BottomNavigationAction
            label="Profile"
            icon={<PersonOutlined />}
            sx={{
              whiteSpace: "nowrap",
              color: getIconColor(/^\/profile$/),
            }}
            onClick={() => handleNavigate("profile")}
          />
        ) : (
          <BottomNavigationAction
            label="Sign up"
            icon={<Person />}
            sx={{
              whiteSpace: "nowrap",
              color: getIconColor(/^\/user\/register$/),
            }}
            onClick={() => handleNavigate("user/register")}
          />
        )}
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
