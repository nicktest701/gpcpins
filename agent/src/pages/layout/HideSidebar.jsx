import { useContext, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import {
  Box,
  IconButton,
  List,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import Swal from "sweetalert2";
import PropTypes from "prop-types";
import NavLinkItem from "../../components/NavLinkItem";
import NavLinkItemCollapse from "../../components/modals/NavLinkItemCollapse";
import { CustomContext } from "../../context/providers/CustomProvider";
import { Link, useLocation } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  DashboardRounded,
  ExitToAppRounded,
  DataObjectRounded,
  WalletOutlined,
  CardMembership,
  Person,
  WalletRounded,
  BarChartRounded,
  Menu,
} from "@mui/icons-material";

import { AuthContext } from "../../context/providers/AuthProvider";

function HideSidebar() {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();

  const {
    customState: { openSidebar },
    customDispatch,
  } = useContext(CustomContext);
  const { palette } = useTheme();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname) {
      customDispatch({
        type: "openSidebar",
        payload: false,
      });
    }
  }, [location, customDispatch]);

  const handleClose = () => {
    customDispatch({
      type: "openSidebar",
      payload: !openSidebar,
    });
  };

  const handleLogOut = () => {
    Swal.fire({
      title: "Logging out",
      text: `Do you want to log out?`,
      showCancelButton: true,
    }).then(async ({ isConfirmed }) => {
      if (isConfirmed) {
        logout();
      }
    });
  };

  return (
    <Drawer
      open={openSidebar}
      onClose={handleClose}
      variant="temporary"
      width={320}
      sx={{
        height: "100svh",
        display: { xs: "block", md: "none" },
        zIndex: 99999,
      }}
    >
      <Stack
        role="presentation"
        spacing={1}
        sx={{
          borderRight: "1px solid lightgray",
          bgcolor: "primary.main",
          overflowY: "scroll",
          height: "100%",
          width:280
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 1,
          }}
        >
          <IconButton edge="end" onClick={handleClose}>
            <Menu />
          </IconButton>
        </Box>
        {user?.id ? (
          <>
            <List>
              <NavLinkItem
                to="/"
                title="Dashboard"
                icon={<DashboardRounded />}
              />
              <NavLinkItemCollapse
                icon={<WalletOutlined htmlColor="#fff" />}
                title="Services"
              >
                <NavLinkItem
                  to="airtime/transactions"
                   title="Sell Airtime"
                  icon={<CardMembership />}
                />
                <NavLinkItem
                  to="bundle/transactions"
                  title="Sell Data"
                  icon={<DataObjectRounded />}
                />
              </NavLinkItemCollapse>

              <NavLinkItem
                to="summary"
                title="Summary"
                icon={<BarChartRounded />}
              />
                   <NavLinkItem
                to="logs"
                title="Activity Logs"
                icon={<AccessTimeIcon />}
              />
            </List>

            <List>
              <NavLinkItem to="profile" title="Profile" icon={<Person />} />
              <NavLinkItem
                to="wallet"
                title="Wallet"
                icon={<WalletRounded />}
              />

              <Stack
                direction="row"
                columnGap={3}
                sx={{
                  padding: 2,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: palette.grey[300],
                  },
                }}
                onClick={handleLogOut}
              >
                <ExitToAppRounded htmlColor="#fff" />

                <Typography variant="button" color="#fff">
                  Log Out
                </Typography>
              </Stack>
            </List>
          </>
        ) : (
          <>
            <List>
              <>
                <Stack
                  columnGap={3}
                  sx={{
                    padding: 2,
                    cursor: "pointer",
                  }}
                  spacing={2}
                >
                  <Link
                    to="/user/login"
                    state={{ path: pathname }}
                    className="nav-item"
                    style={{ color: "#fff" }}
                  >
                    Login
                  </Link>

                  <Link
                    to="/user/register"
                    state={{ path: pathname }}
                    className="nav-item"
                    style={{
                      backgroundColor: "#fff",
                      color: palette?.primary?.main,
                    }}
                  >
                    Sign up
                  </Link>
                </Stack>
              </>
            </List>
          </>
        )}
      </Stack>
    </Drawer>
  );
}

export default HideSidebar;

HideSidebar.proptype = {
  openSidebar: PropTypes.bool,
  setOpenSidebar: PropTypes.func,
};
