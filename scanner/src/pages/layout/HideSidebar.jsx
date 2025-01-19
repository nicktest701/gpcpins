import { useContext, useEffect, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import {
  Box,
  IconButton,
  List,
  Stack,
  Typography,
  useTheme,
  Divider,
  Tooltip,
  Badge,
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
  CarRentalRounded,
  TheatersRounded,
  AirplaneTicket,
  VerifiedUser,
  Person,
  BarChartRounded,
  Menu,
  NotificationsRounded,
  Settings,
  AssignmentIndRounded,
  SportsSoccerRounded,
  CardGiftcard,
  Message,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "../../context/providers/AuthProvider";
import { getAllNotifications } from "../../api/notificationAPI";
import { bgBlur } from "../../theme/css";

function HideSidebar() {
  const { user, logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const {
    customState: { openSidebar },
    customDispatch,
  } = useContext(CustomContext);
  const { palette, zIndex } = useTheme();
  const location = useLocation();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initial: queryClient?.getQueryData(["notifications"]),
  });

  const unReadNotifications = useMemo(
    () => notifications?.data?.filter((item) => item?.active === 1),
    [notifications.data]
  );

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
      width={280}
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
          zIndex: zIndex.appBar + 1,
          ...bgBlur({
            color: palette.background.default,
          }),
          overflowY: "scroll",
          height: "100%",
          width: 300,
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

              {user?.isAdmin && (
                <>
                  <NavLinkItemCollapse
                    icon={<AirplaneTicket color="primary" />}
                    title={"Vouchers & Tickets"}
                  >
                    <NavLinkItem
                      to="evoucher/cinema"
                      title="Cinema Tickets"
                      icon={<TheatersRounded />}
                    />

                    <NavLinkItem
                      to="evoucher/stadium"
                      title="Stadium Tickets"
                      icon={<SportsSoccerRounded />}
                    />

                    <NavLinkItem
                      to="evoucher/bus"
                      title="Bus Tickets"
                      icon={<CarRentalRounded />}
                    />
                    <NavLinkItem
                      to="tickets?t=all&"
                      title="Manage Tickets"
                      icon={<AssignmentIndRounded />}
                    />
                  </NavLinkItemCollapse>

                  <NavLinkItem
                    to="verifiers"
                    title="Verifiers"
                    icon={<VerifiedUser />}
                  />
                </>
              )}
              <NavLinkItem
                to="assigned-tickets"
                title="My Tickets"
                icon={<CardGiftcard />}
              />

              {/* <NavLinkItem to="users" title="Users" icon={<Person2 />} /> */}
              {/* {user?.permissions?.includes("Summary") && ( */}
              <NavLinkItem
                to="summary"
                title="Scan History"
                icon={<BarChartRounded />}
              />
              {/* )} */}

              {user?.isAdmin && (
                <NavLinkItem
                  to="messages"
                  title="Messages"
                  icon={<Message />}
                />
              )}
              <NavLinkItem
                to="logs"
                title="Activity Logs"
                icon={<AccessTimeIcon />}
              />
            </List>
            <Divider flexItem />
            <List>
              <NavLinkItem to="profile" title="Profile" icon={<Person />} />
              <NavLinkItem to="settings" title="Settings" icon={<Settings />} />
              <NavLinkItem
                to="notifications"
                title="Notifications"
                icon={
                  <Badge
                    badgeContent={unReadNotifications?.length}
                    color="error"
                  >
                    <NotificationsRounded />
                  </Badge>
                }
              />

              <Tooltip title="Log out" placement="right">
                <Stack
                  direction="row"
                  spacing={3}
                  pl="8px"
                  pt={1}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                  onClick={handleLogOut}
                >
                  <ExitToAppRounded color="error" />

                  <Typography variant="body2" color="error">
                    Log Out
                  </Typography>
                </Stack>
              </Tooltip>
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
