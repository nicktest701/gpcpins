import { useState, useContext, useEffect, useMemo, useCallback } from "react";
import {
  AppBar,
  IconButton,
  Stack,
  Divider,
  Avatar,
  useTheme,
  Badge,
  MenuItem,
  Tooltip,
  Box,

} from "@mui/material";
import {
  NotificationsSharp,
  Menu as MenuIcon,
} from "@mui/icons-material";
import Swal from "sweetalert2";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { IMAGES } from "@/constants";
import { CustomContext } from "@/context/providers/CustomProvider";
import { getInitials } from "@/config/validation";
import { useAuth } from "@/context/providers/AuthProvider";
import ActionMenu from "@/components/menu/ActionMenu";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "@/api/notificationAPI";
import NotificationDrawer from "@/components/dropdowns/NotificationDrawer";

// Helper: generate breadcrumb items from current pathname
// const useBreadcrumbs = () => {
//   const { pathname } = useLocation();
//   return useMemo(() => {
//     const paths = pathname.split("/").filter(Boolean);
//     return paths.map((segment, index) => {
//       const url = `/${paths.slice(0, index + 1).join("/")}`;
//       const label =
//         segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");
//       return { label, url };
//     });
//   }, [pathname]);
// };

function Header() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const {
    customState: { openSidebar },
    customDispatch,
  } = useContext(CustomContext);

  const theme = useTheme();
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [shadow, setShadow] = useState("none");
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);

  // const breadcrumbs = useBreadcrumbs();

  // Notification query with optimized staleTime
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const unreadCount = useMemo(
    () => notifications.data?.filter((item) => item.active === 1).length || 0,
    [notifications.data],
  );

  useEffect(() => {
    setPhoto(user?.profile);
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setShadow(window.scrollY > 5 ? "0 4px 12px rgba(0,0,0,0.1)" : "none");
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleSidebar = useCallback(() => {
    customDispatch({ type: "openSidebar", payload: !openSidebar });
  }, [customDispatch, openSidebar]);

  const goHome = useCallback(
    () => navigate("/", { replace: true }),
    [navigate],
  );

  const handleLogOut = useCallback(() => {
    Swal.fire({
      title: "Logging out",
      text: "Do you want to log out?",
      showCancelButton: true,
    }).then(async ({ isConfirmed }) => {
      if (isConfirmed) logout();
    });
  }, [logout]);

  return (
    <>
      <AppBar
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
          boxShadow: shadow,
          transition: "box-shadow 0.2s ease",
          zIndex: theme.zIndex.appBar,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: { xs: 2, md: 4, lg: 5 },
            py: 1,
          }}
        >
          {/* Mobile menu button */}
          <IconButton
            color="primary"
            onClick={toggleSidebar}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          {/* Left Section: Logo + Breadcrumb */}
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              alt="Logo"
              src={IMAGES.logo}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                width: 48,
                height: 48,
                cursor: "pointer",
              }}
              onClick={goHome}
            />
            {/* {breadcrumbs.length > 0 && (
              <Breadcrumbs
                separator={<NavigateNext fontSize="small" />}
                aria-label="breadcrumb"
                sx={{ display: { xs: "none", sm: "flex" } }}
              >
                <MuiLink
                  component={Link}
                  to="/"
                  underline="hover"
                  color="inherit"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  Home
                </MuiLink>
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return isLast ? (
                    <Typography
                      key={crumb.url}
                      color="text.primary"
                      fontWeight={500}
                    >
                      {crumb.label}
                    </Typography>
                  ) : (
                    <MuiLink
                      key={crumb.url}
                      component={Link}
                      to={crumb.url}
                      underline="hover"
                      color="inherit"
                    >
                      {crumb.label}
                    </MuiLink>
                  );
                })}
              </Breadcrumbs>
            )} */}
          </Stack>

          {/* Right Section: Notifications + User Menu */}
          <Stack direction="row" alignItems="center" spacing={2}>
            {user?.id ? (
              <>
                <Tooltip title="Notifications">
                  <IconButton onClick={() => setShowNotificationDropdown(true)}>
                    <Badge badgeContent={unreadCount} color="error">
                      <NotificationsSharp />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <ActionMenu
                  icon={
                    <Tooltip title="Profile">
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Avatar
                          sx={{ bgcolor: "primary.main", cursor: "pointer" }}
                          src={photo}
                          alt="profile"
                        >
                          {getInitials(user?.email)}
                        </Avatar>
                      </Stack>
                    </Tooltip>
                  }
                >
                  <MenuItem component={Link} to="/profile">
                    Profile
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
                  style={({ isActive }) => ({
                    textDecoration: "none",
                    color: isActive
                      ? theme.palette.primary.main
                      : theme.palette.text.primary,
                    fontWeight: isActive ? 600 : 400,
                    borderBottom: isActive
                      ? `2px solid ${theme.palette.primary.main}`
                      : "none",
                    paddingBottom: 4,
                  })}
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/auth/register"
                  state={{ path: pathname }}
                  style={({ isActive }) => ({
                    textDecoration: "none",
                    color: theme.palette.primary.main,
                    border: `1px solid ${theme.palette.primary.main}`,
                    borderRadius: 20,
                    padding: "6px 16px",
                    fontWeight: isActive ? 600 : 400,
                  })}
                >
                  Sign up
                </NavLink>
              </>
            )}
          </Stack>
        </Box>
      </AppBar>

      <NotificationDrawer
        open={showNotificationDropdown}
        setOpen={setShowNotificationDropdown}
        notifications={notifications.data}
      />
    </>
  );
}

export default Header;
