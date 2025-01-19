import { useContext, useEffect, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  List,
  ListSubheader,
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
import {
  DashboardRounded,
  ExitToAppRounded,
  MoneyRounded,
  PaymentRounded,
  SdCardRounded,
  Close,
  CardMembership,
  NoteAltOutlined,
  WalletOutlined,
  PersonOutlined,
  SimCardOutlined,
  NotificationsOutlined,
} from "@mui/icons-material";

import { AuthContext } from "../../context/providers/AuthProvider";
import { IMAGES } from "../../constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllBroadcastMessages } from "../../api/broadcastMessageAPI";

function Sidebar() {
  const queryClient = useQueryClient();
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();

  const {
    customState: { openSidebar },
    customDispatch,
  } = useContext(CustomContext);
  const { palette } = useTheme();
  const location = useLocation();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllBroadcastMessages(),
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
    <Drawer open={openSidebar} onClose={handleClose} variant="temporary">
      <Stack
        role="presentation"
        width={{ xs: "100svw", md: 280 }}
        spacing={1}
      
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
           px:1
          }}
        >
          <Avatar
            alt="logo"
            src={IMAGES.coat_of_arms}
            sx={{
              width: 48,
              height: 48,
              cursor: "pointer",
            }}
          />
          <IconButton edge="end" sx={{ mr: 1 }} onClick={handleClose}>
            <Close />
          </IconButton>
        </Box>
        <Divider flexItem />
        {user?.id ? (
          <>
            <List>
              <NavLinkItem to="/" title="Home" icon={<DashboardRounded />} />

              {/* E Voucher */}
              <NavLinkItem
                to="evoucher"
                title="Voucher & Tickets"
                icon={<PaymentRounded />}
              />

              <NavLinkItemCollapse
                icon={<MoneyRounded htmlColor="#333" />}
                title="Prepaid Units"
              >
                <NavLinkItem
                  to="electricity"
                  title="Buy"
                  icon={<MoneyRounded />}
                />
                <NavLinkItem
                  to="electricity/meters"
                  title="Meters"
                  icon={<SimCardOutlined />}
                />
              </NavLinkItemCollapse>

              <NavLinkItem
                to="airtime"
                title="Airtime & Data Bundle"
                icon={<CardMembership />}
              />

              {/* SMS  */}
            </List>

            <List
              subheader={
                <ListSubheader
                  sx={{ color: "primary.main" }}
                  component="div"
                  id="nested-list-subheader"
                >
                  Account
                </ListSubheader>
              }
            >
              <NavLinkItem
                to="profile"
                title="Profile"
                icon={<PersonOutlined />}
              />
              <NavLinkItem
                to="notifications"
                title="Notifications"
                icon={
                  <Badge
                    badgeContent={unReadNotifications?.length}
                    color="error"
                  >
                    <NotificationsOutlined />
                  </Badge>
                }
              />
              <NavLinkItem
                to="wallet"
                title="Wallet"
                icon={<WalletOutlined />}
              />
              <NavLinkItem
                to="/transactions"
                title="Transactions"
                icon={<NoteAltOutlined />}
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
                <ExitToAppRounded />

                <Typography variant="button">Log Out</Typography>
              </Stack>
            </List>
          </>
        ) : (
          <>
            <List>
              <NavLinkItem to="/" title="Home" icon={<DashboardRounded />} />

              {/* E Voucher */}
              <NavLinkItem
                to="evoucher"
                title="E-Voucher"
                icon={<SdCardRounded />}
              />
              <NavLinkItem
                to="electricity"
                title="Prepaid Units"
                icon={<MoneyRounded htmlColor="#333" />}
              />
              <NavLinkItem
                to="airtime"
                title="Airtime & Data Bundle"
                icon={<CardMembership />}
              />
            </List>

            <List
              subheader={
                <ListSubheader component="div" id="nested-list-subheader">
                  Account
                </ListSubheader>
              }
            >
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
                    style={{ backgroundColor: "var(--primary)", color: "#fff" }}
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

export default Sidebar;

Sidebar.proptype = {
  openSidebar: PropTypes.bool,
  setOpenSidebar: PropTypes.func,
};
