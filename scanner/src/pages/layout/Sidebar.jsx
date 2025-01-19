import { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  Stack,
  Typography,
  useTheme,
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

function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const [toggleWidth, setToggleWidth] = useState(false);
  const queryClient = useQueryClient();

  const { customDispatch } = useContext(CustomContext);
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
    setToggleWidth(!toggleWidth);
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
    <Box
      sx={{
        height: "100svh",
        display: { xs: "none", md: "block" },
        pt: 2,
        transition: "all 0.4s ease-in-out",
        gap: 1,
        position: "sticky",
        top: 0,
        zIndex: zIndex.appBar + 1,
        ...bgBlur({
          color: palette.background.default,
        }),
        borderRight: "1px dashed lightgray",
        // zIndex: 999,
      }}
    >
      <Box
        role="presentation"
        sx={{
          display: "flex",
          flexDirection: "column",
          // gridTemplateRows: 'auto 1fr auto',
          gap: "1rem",
          width: toggleWidth ? 58 : { xs: 0, md: 200, lg: 280 },
          p: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: toggleWidth ? "flex-start" : "space-between",
            alignItems: "center",
            px: toggleWidth ? 0 : 1,
          }}
        >
          <Typography
            sx={{ display: toggleWidth ? "none" : "inline-flex" }}
            color="primary"
          >
            GPC
          </Typography>
          <IconButton edge="end" onClick={handleClose}>
            <Menu />
          </IconButton>
        </Box>
        <Divider flexItem />
        <Box className="sidebar" sx={{ overflowY: "scroll", height: "75svh" }}>
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
                      title={toggleWidth ? "" : " Tickets"}
                    >
                      <NavLinkItem
                        to="evoucher/cinema"
                        title="Cinema"
                        icon={<TheatersRounded />}
                      />

                      <NavLinkItem
                        to="evoucher/stadium"
                        title="Stadium"
                        icon={<SportsSoccerRounded />}
                      />

                      <NavLinkItem
                        to="evoucher/bus"
                        title="Bus"
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

                <NavLinkItem
                  to="summary"
                  title="Scan History"
                  icon={<BarChartRounded />}
                />
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
                <NavLinkItem
                  to="settings"
                  title="Settings"
                  icon={<Settings />}
                />
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
        </Box>
        <Typography
          variant="body2"
          textAlign="center"
          color="primary"
          paragraph
          pt={1}
          sx={{
            display: toggleWidth
              ? "none"
              : { xs: "block", md: "none", lg: "block" },
          }}
        >
          Copyright &copy; {new Date().getFullYear()} | GPC
        </Typography>
      </Box>
    </Box>
  );
}

export default Sidebar;

Sidebar.proptype = {
  openSidebar: PropTypes.bool,
  setOpenSidebar: PropTypes.func,
};
