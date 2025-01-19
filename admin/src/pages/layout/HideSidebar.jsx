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
import ElectricMeterIcon from "@mui/icons-material/ElectricMeter";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import SignalCellularAlt2BarIcon from "@mui/icons-material/SignalCellularAlt2Bar";
import WifiTetheringIcon from "@mui/icons-material/WifiTethering";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import {
  DashboardRounded,
  ExitToAppRounded,
  CarRentalRounded,
  KeySharp,
  NoteRounded,
  ParkRounded,
  SchoolRounded,
  SecurityRounded,
  TheatersRounded,
  AirplaneTicket,
  PaymentRounded,
  CardMembership,
  VerifiedUser,
  Person,
  Message,
  BarChartRounded,
  Menu,
  Person2,
  WalletOutlined,
  SettingsRounded,
  NotificationsRounded,
  Refresh,
  StackedBarChartRounded,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { AuthContext } from "../../context/providers/AuthProvider";
import { getAllNotifications } from "../../api/notificationAPI";

function HideSidebar() {
  const { user, logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { pathname } = useLocation();

  const {
    customState: { openSidebar },
    customDispatch,
  } = useContext(CustomContext);
  const { palette } = useTheme();
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
          borderRight: "1px solid lightgray",
          bgcolor: "primary.main",
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

              {user?.permissions?.includes("Vouchers & Tickets") && (
                <NavLinkItemCollapse
                  icon={<AirplaneTicket htmlColor="#fff" />}
                  title="Vouchers & Tickets"
                >
                  {user?.permissions?.includes("Generate Pins & Serials") && (
                    <NavLinkItem
                      to="evoucher/generate"
                      title="Pins & Serials Generator"
                      type="generator"
                      icon={<KeySharp />}
                    />
                  )}

                  {user?.permissions?.includes("WAEC Checkers") && (
                    <NavLinkItem
                      to="evoucher/waec"
                      title="WAEC Checker"
                      icon={<NoteRounded />}
                    />
                  )}

                  {user?.permissions?.includes(
                    "University & Polytechnic Forms"
                  ) && (
                    <NavLinkItem
                      to="evoucher/university"
                      title="University Forms"
                      icon={<SchoolRounded />}
                    />
                  )}

                  {user?.permissions?.includes("Security Service Forms") && (
                    <NavLinkItem
                      to="evoucher/security"
                      title="Security Service"
                      icon={<SecurityRounded />}
                    />
                  )}

                  {user?.permissions?.includes("Cinema Tickets") && (
                    <NavLinkItem
                      to="evoucher/cinema"
                      title="Cinema Tickets"
                      icon={<TheatersRounded />}
                    />
                  )}

                  {user?.permissions?.includes("Stadium Tickets") && (
                    <NavLinkItem
                      to="evoucher/stadium"
                      title="Stadium Tickets"
                      icon={<ParkRounded />}
                    />
                  )}

                  {user?.permissions?.includes("Bus Tickets") && (
                    <NavLinkItem
                      to="evoucher/bus"
                      title="Bus Tickets"
                      icon={<CarRentalRounded />}
                    />
                  )}
                </NavLinkItemCollapse>
              )}
              {/* )} */}

              {user?.permissions?.includes("Prepaid Units") && (
                <NavLinkItemCollapse
                  icon={<PaymentRounded htmlColor="#fff" />}
                  title={"Prepaid Units"}
                >
                  {user?.permissions?.includes("View Meters") && (
                    <NavLinkItem
                      to="electricity/meters"
                      title="Meters"
                      icon={<ElectricMeterIcon />}
                    />
                  )}
                  {user?.permissions?.includes("View Prepaid Transaction") && (
                    <NavLinkItem
                      to="electricity/transactions"
                      title="Process Transactions"
                      icon={<CardMembership />}
                    />
                  )}
                </NavLinkItemCollapse>
              )}

              {user?.permissions?.includes("Airtime") && (
                <NavLinkItemCollapse
                  icon={<WalletOutlined htmlColor="#fff" />}
                  title={"Airtime"}
                >
                  {user?.permissions?.includes(
                    "View Bulk Airtime Transaction"
                  ) && (
                    <NavLinkItem
                      to="airtime/transactions"
                      title="Bulk Sales"
                      icon={<CardMembership />}
                    />
                  )}
                  {user?.permissions?.includes("Agents") && (
                    <NavLinkItem
                      to="airtime/agent"
                      title="Agent Distributors"
                      icon={<Person />}
                    />
                  )}
                </NavLinkItemCollapse>
              )}

              {/* <NavLinkItem to="client" title="Clients" icon={<Group />} /> */}

              {user?.permissions?.includes("Employees") && (
                <NavLinkItem
                  to="employees"
                  title="Employees"
                  icon={<VerifiedUser />}
                />
              )}
              {user?.permissions?.includes("Users") && (
                <NavLinkItem to="users" title="Users" icon={<Person2 />} />
              )}
              {(user?.permissions?.includes("User Wallets") ||
                user?.permissions?.includes("Agent Wallets")) && (
                <NavLinkItemCollapse
                  icon={<WalletOutlined htmlColor="#fff" />}
                  title="Wallets Details"
                >
                  {user?.permissions?.includes("User Wallets") && (
                    <NavLinkItem
                      to="wallets"
                      title="Users"
                      icon={<CardMembership />}
                    />
                  )}
                  {user?.permissions?.includes("Agent Wallets") && (
                    <NavLinkItem
                      to="wallets/agent"
                      title="Agent"
                      icon={<Person />}
                    />
                  )}
                </NavLinkItemCollapse>
              )}

              {user?.permissions?.includes("Messages") && (
                <NavLinkItem
                  to="messages"
                  title="Messages"
                  icon={<Message />}
                />
              )}

              {user?.permissions?.includes("Summary") && (
                <NavLinkItemCollapse
                  icon={<BarChartRounded htmlColor="#fff" />}
                  title="Summary & Reports"
                >
                  {user?.permissions?.includes(
                    "View All Tickets & Voucher Transactions"
                  ) && (
                    <NavLinkItem
                      to="summary/vouchers-tickets"
                      title="Vouchers & Tickets"
                      icon={<ConfirmationNumberIcon />}
                    />
                  )}
                  {user?.permissions?.includes(
                    "View All Prepaid Units Transactions"
                  ) && (
                    <NavLinkItem
                      to="summary/prepaid-units"
                      title="Prepaid Units"
                      icon={<ElectricBoltIcon />}
                    />
                  )}
                  {user?.permissions?.includes(
                    "View All Airtime Transactions"
                  ) && (
                    <NavLinkItem
                      to="summary/airtime"
                      title="Airtime Transfers"
                      icon={<WifiTetheringIcon />}
                    />
                  )}
                  {user?.permissions?.includes(
                    "View All Data Bundle Transactions"
                  ) && (
                    <NavLinkItem
                      to="summary/data-bundle"
                      title="Data Bundle"
                      icon={<SignalCellularAlt2BarIcon />}
                    />
                  )}
                  <NavLinkItem
                    to="summary/agent-transactions"
                    title="Agent Transactions"
                    icon={<StackedBarChartRounded />}
                  />
                  {user?.permissions?.includes("View All Transactions") && (
                    <NavLinkItem
                      to="summary/transactions"
                      title="All Transactions"
                      icon={<ReceiptLongIcon />}
                    />
                  )}
                  {user?.permissions?.includes(
                    "View All Transactions Report"
                  ) && (
                    <NavLinkItem
                      to="summary/report"
                      title="Reports"
                      icon={<FileCopyIcon />}
                    />
                  )}
                </NavLinkItemCollapse>
              )}

              {user?.isAdmin && (
                <NavLinkItemCollapse
                  icon={<Refresh htmlColor="#fff" />}
                  title="Refund Transactions"
                >
                  <NavLinkItem
                    to="refund/details"
                    title="All Refunds"
                    icon={<FileCopyIcon />}
                  />

                  <NavLinkItem
                    to="refund"
                    title="Refund Money"
                    icon={<FileCopyIcon />}
                  />
                </NavLinkItemCollapse>
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
              {user?.permissions?.includes("Settings") && (
                <NavLinkItem
                  to="settings"
                  title="Settings"
                  icon={<SettingsRounded />}
                />
              )}
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
                  <ExitToAppRounded htmlColor="#fff" />

                  <Typography
                    variant="button"
                    color="#fff"
                    sx={{
                      fontSize: 12,
                    }}
                  >
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
      </Stack>
    </Drawer>
  );
}

export default HideSidebar;

HideSidebar.proptype = {
  openSidebar: PropTypes.bool,
  setOpenSidebar: PropTypes.func,
};
