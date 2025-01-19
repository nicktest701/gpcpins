import { useState, useContext, useEffect } from "react";
import {
  AppBar,
  IconButton,
  Typography,
  Stack,
  Divider,
  Avatar,
  useTheme,
  Badge,
  MenuItem,
  Tooltip,
  Box,
} from "@mui/material";
import { NotificationsSharp } from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Swal from "sweetalert2";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { IMAGES } from "../../constants";
import { CustomContext } from "../../context/providers/CustomProvider";
import { getInitials } from "../../config/validation";

import { AuthContext } from "../../context/providers/AuthProvider";
import ActionMenu from "../../components/menu/ActionMenu";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllNotifications } from "../../api/notificationAPI";
import NotificationDrawer from "../../components/dropdowns/NotificationDrawer";

const ITEM_HEIGHT = 48;
function Header() {
  const { user, logout } = useContext(AuthContext);
  const { pathname } = useLocation();
  const {
    customState: { openSidebar },
    customDispatch,
  } = useContext(CustomContext);
  const queryClient = useQueryClient();

  const {
    palette,
    typography: { button },
  } = useTheme();

  const [photo, setPhoto] = useState(null);
  const [shadow, setShadow] = useState("none");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const navigate = useNavigate();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initial: queryClient?.getQueryData(["notifications"]),
  });

  const unReadNotifications = notifications?.data?.filter(
    (item) => item?.active === 1
  );

  useEffect(() => {
    setPhoto(user?.profile);
  }, [user]);

  const open = Boolean(anchorEl);

  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  const handleClose = () => {
    setAnchorEl(null);
  };

  window.onscroll = function () {
    if (window.scrollY > 5) {
      setShadow("2px 3px 5px rgba(0,0,0,0.15)");
    } else {
      setShadow("none");
    }
  };

  const toggleSideBar = () =>
    customDispatch({
      type: "openSidebar",
      payload: !openSidebar,
    });

  const goHome = () => navigate("/", { replace: true });

  const myLinkStyles = ({ isActive }) => {
    return {
      fontFamily: button.fontFamily,
      fontSize: button.fontSize,
      // position: 'relative',
      textDecoration: "none",
      borderBottom: isActive ? `solid 1px ${palette.primary.main}` : null,
      color: isActive ? palette.primary.main : "#333",

      fontWeight: isActive ? "bold" : "400",
    };
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
    <>
      <AppBar
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          color: "primary",
          backgroundColor: "#fff",
          borderBottom: "2px solid var(--secondary)",
          zIndex: 999,
          boxShadow: shadow,
          width: "100%",
        }}
        color="inherit"
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 4, lg: 5 },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Avatar
              alt="logo"
              src={IMAGES.coat_of_arms}
              sx={{
                width: 60,
                height: 60,
                cursor: "pointer",
              }}
              onClick={goHome}
            />

          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
          >
            <>
              {user?.id ? (
                <>
                  <div style={{ position: "relative" }}>
                    <Tooltip title="Notifications">
                      <IconButton
                        onClick={() => setShowNotificationDropdown(true)}
                      >
                        <Badge
                          badgeContent={unReadNotifications?.length}
                          color="error"
                        >
                          <NotificationsSharp />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                  </div>
                  <ActionMenu
                    icon={
                      <Tooltip title="Profile">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Avatar
                            sx={{ bgcolor: "primary.main", cursor: "pointer" }}
                            src={photo}
                            alt="profile_icon"
                          >
                            {getInitials(user?.email)}
                          </Avatar>
                          {/* <Typography>{user?.email}</Typography> */}
                        </Stack>
                      </Tooltip>
                    }
                  >
                    <MenuItem>
                      <Link
                        to="/profile"
                        style={{
                          textAlign: "center",
                          display: "block",
                          textDecoration: "none",
                          color: "#fff",
                        }}
                      >
                        Profile
                      </Link>
                    </MenuItem>

                    <Divider />
                    <MenuItem onClick={handleLogOut}>Log out</MenuItem>
                  </ActionMenu>
                </>
              ) : (
                <>
                  <NavLink
                    to="/auth/login"
                    state={{ path: pathname }}
                    className="nav-item"
                    style={myLinkStyles}
                  >
                    Log in
                  </NavLink>
                  <NavLink
                    to="/auth/register"
                    state={{ path: pathname }}
                    className="nav-item"
                    style={{
                      border: `1px solid ${palette.primary.main}`,
                      borderRadius: "8px",
                      color: palette.primary.main,
                    }}
                    end
                  >
                    Sign up
                  </NavLink>
                </>
              )}
            </>
          </Stack>

          <Menu
            id="account-menu"
            elevation={1}
            MenuListProps={{
              "aria-labelledby": "account-menu",
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            sx={{ p: 4 }}
            PaperProps={{
              style: {
                maxHeight: ITEM_HEIGHT * 4.5,
                fontSize: "14px !important",
              },
            }}
          ></Menu>

          <IconButton
            color="inherit"
            onClick={toggleSideBar}
            sx={{
              display: { xs: "block", md: "none" },
            }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      </AppBar>
      <NotificationDrawer
        open={showNotificationDropdown}
        setOpen={setShowNotificationDropdown}
        notifications={notifications?.data}
      />
    </>
  );
}

export default Header;
