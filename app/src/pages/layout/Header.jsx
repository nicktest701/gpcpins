import { useState, useLayoutEffect, useEffect } from "react";
import {
  AppBar,
  IconButton,
  Stack,
  Divider,
  Avatar,
  useTheme,
  Badge,
  Box,
  Container,
  Button,
  Tooltip,
  Alert,
  alpha,
  Fade,
} from "@mui/material";
import {
  NotificationsSharp,
  WalletRounded,
  SearchRounded,
  Close,
  Menu as MenuIcon,
} from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Swal from "sweetalert2";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { currencyFormatter } from "@/constants";
import { getInitials } from "@/config/validation";
import NotificationDropdown from "@/components/dropdowns/NotificationDropdown";
import { useQueryClient } from "@tanstack/react-query";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import Navbar from "../../components/dropdowns/Navbar";

function Header() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [showAlert, setShowAlert] = useState(() => {
    const closed = sessionStorage.getItem("announcementClosed") === "true";
    return !closed;
  });

  const { pathname } = useLocation();
  const {
    customState: { openSidebar, globalAlert },
    customDispatch,
    walletBalance,
  } = useCustomContext();

  const theme = useTheme();

  const [shadow, setShadow] = useState("none");
  const [scrolled, setScrolled] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const navigate = useNavigate();

  // const fetchedBalance = queryClient.getQueryData({
  //   queryKey: ["wallet-balance", user?.id],
  // });

  // const walletBalance= useQuery({
  //   queryKey: ["wallet-balance", user?.id],
  //   queryFn: () => getWalletBalance.data||0(user?.id),
  //   enabled: !!user?.id,
  //   staleTime: 0,
  //   cacheTime: 1000 * 60, // 1 minute memory life
  //   initialData: fetchedBalance,
  // });

  // console.log(fetchedBalance)

  const notifs = queryClient.getQueryData({
    queryKey: ["notifications", user?.id],
  });

  const unReadNotifications = notifs?.filter(
    (item) => item?.active && !item.isRead,
  );

  useLayoutEffect(() => {
    if (user?.id && !user?.phonenumber) {
      customDispatch({
        type: "setGlobalAlert",
        payload: {
          open: true,
          severity: "info",
          message: "incomplete-profile",
        },
      });
    }
  }, [user, customDispatch]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setShadow(scrollY > 5 ? theme.shadows[2] : "none");
      setScrolled(scrollY >= 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [theme.shadows]);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleSideBar = () =>
    customDispatch({
      type: "openSidebar",
      payload: !openSidebar,
    });

  const toggleNotification = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const closeGlobalAlert = () => {
    customDispatch({
      type: "setGlobalAlert",
      payload: { open: false },
    });
  };

  const myLinkStyles = ({ isActive }) => ({
    fontFamily: theme.typography.button.fontFamily,
    fontSize: theme.typography.button.fontSize,
    fontWeight: isActive ? 600 : 500,
    textDecoration: "none",
    color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
    borderBottom: isActive
      ? `2px solid ${theme.palette.primary.main}`
      : "2px solid transparent",
    paddingBottom: "4px",
    transition: theme.transitions.create(["color", "border-bottom-color"], {
      duration: theme.transitions.duration.short,
    }),
    "&:hover": {
      color: theme.palette.primary.main,
      borderBottomColor: alpha(theme.palette.primary.main, 0.4),
    },
  });

  const handleLogOut = () => {
    Swal.fire({
      title: "Logging out",
      text: "Do you want to log out?",
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
    }).then(async ({ isConfirmed }) => {
      if (isConfirmed) {
        logout();
      }
    });
  };

  const handleOpenSearch = () => {
    customDispatch({ type: "openSearch", payload: true });
  };

  // const getLocation = () => {
  //   const position = [6.70675631287526, -1.6189752122036272];
  //   const destination = `${position[0]},${position[1]}`;
  //   const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
  //   window.open(googleMapsUrl, "_blank");
  // };

  const dismissAnnouncement = () => {
    setShowAlert(false);
    sessionStorage.setItem("announcementClosed", "true");
  };

  return (
    <>
      {/* Announcement bar */}
      <Fade in={showAlert} timeout={800}>
        <Box
          sx={{
            display: showAlert ? "flex" : "none",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, sm: 2 },
            py: 1,
            px: 4,
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            color: theme.palette.text.secondary,
            flexWrap: "wrap",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "nowrap",
            }}
          >
            <span style={{marginRight:'5px'}}>Download our free mobile apps</span>
            <Button
              component={Link}
              to="/downloads"
              size="small"
              variant="contained"
              sx={{
                minWidth: "auto",
                py: 0.25,
                px: 1.5,
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                borderRadius: 1.5,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: theme.shadows[2],
                },
              }}
            >
              Download
            </Button>
          </Box>
          <IconButton
            size="small"
            onClick={dismissAnnouncement}
            sx={{
              transition: theme.transitions.create([
                "background-color",
                "transform",
              ]),
              "&:hover": {
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                transform: "scale(1.1)",
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Box>
      </Fade>

      {/* Top contact & social row (desktop) - hides on scroll */}
      {/* <Box
        sx={{
          display: { xs: "none", md: "flex" }, // Always flex on desktop
          justifyContent: "space-between",
          alignItems: "center",

          // Animate layout heights to prevent the jump layout loop
          maxHeight: scrolled ? 0 : "100px", // High enough to fit content comfortably
          overflow: "hidden",
          py: scrolled ? 0 : 1,
          mb: scrolled ? 0 : 1,
          px:4,
          borderBottom: scrolled
            ? "0px solid transparent"
            : `1px solid ${alpha(theme.palette.divider, 0.4)}`,

          // Fade properties
          opacity: scrolled ? 0 : 1,
          pointerEvents: scrolled ? "none" : "auto",

          // Smooth transition for all layout properties
          transition: theme.transitions.create(
            ["opacity", "max-height", "py", "mb", "border-bottom"],
            { duration: theme.transitions.duration.standard },
          ),
        }}
      >
        <Avatar
          alt="logo"
          src={IMAGES.logo}
          sx={{
            width: 56,
            height: 56,
            cursor: "pointer",
            transition: theme.transitions.create("transform"),
            "&:hover": { transform: "scale(1.02)" },
          }}
          onClick={goHome}
        />

        <Stack
          direction="row"
          spacing={{ lg: 3, md: 2 }}
          alignItems="center"
          flexWrap="wrap"
          useFlexGap
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <MyLocationIcon
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
            <Typography variant="body2" color="secondary.main">
              AK-004-5284
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Mail
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
            <Link
              to="mailto:info@gpcpins.com"
              style={{
                color: theme.palette.secondary.main,
                textDecoration: "none",
              }}
            >
              info@gpcpins.com
            </Link>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PhoneCallback
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
            <Link
              to="tel:0322036582"
              style={{
                color: theme.palette.secondary.main,
                textDecoration: "none",
              }}
            >
              0322036582
            </Link>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MapOutlined />}
            onClick={getLocation}
            sx={{
              borderRadius: 2,
              borderColor: alpha(theme.palette.primary.main, 0.5),
              color: theme.palette.primary.main,
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          >
            Get Directions
          </Button>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          sx={{
            display: { xs: "none", lg: "flex" },
          }}
        >
          {[FacebookRounded, WhatsApp, Twitter, Instagram].map((Icon, idx) => (
            <IconButton
              key={idx}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                transition: theme.transitions.create(["color", "transform"]),
                "&:hover": {
                  color: theme.palette.primary.main,
                  transform: "scale(1.15)",
                },
              }}
            >
              <Icon fontSize="small" />
            </IconButton>
          ))}
        </Stack>
      </Box> */}
      <AppBar
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          backgroundColor: theme.palette.background.paper,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
          zIndex: 1200,
          boxShadow: shadow,
          transition: theme.transitions.create("box-shadow"),
        }}
        color="inherit"
      >
        <Container maxWidth="xl" sx={{ py: 1 }}>
          {/* Main header row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            {/* Left side: menu icon + mobile wallet info */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: { xs: "100%", md: "auto" },
                flexGrow:{sm:1,lg:0}
              }}
            >
              <Box sx={{ flexGrow: 1, flex: 1 }}>
                <IconButton
                  onClick={toggleSideBar}
                  sx={{
                    transition: theme.transitions.create("transform"),
                    "&:hover": { transform: "scale(1.1)" },
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
              {user?.id && (
                <Box
                  sx={{
                    display: { xs: "flex", md: "none" },
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {/* <Tooltip title="Search">
                    <IconButton
                      size="small"
                      onClick={handleOpenSearch}
                      sx={{
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        transition: theme.transitions.create("transform"),
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    >
                      <SearchRounded fontSize="small" />
                    </IconButton>
                  </Tooltip> */}
                  <Tooltip title="Wallet Balance">
                    <Button
                      component={Link}
                      to="/wallet?_pid=1"
                      size="small"
                      variant="outlined"
                      startIcon={<WalletRounded />}
                      sx={{
                        fontSize: 12,
                        borderRadius: 1,
                      }}
                    >
                      {currencyFormatter(walletBalance || 0)}
                    </Button>
                  </Tooltip>
                </Box>
              )}
            </Box>

            <Navbar />
           <Tooltip title="Search transactions">
              <IconButton
                onClick={handleOpenSearch}
                sx={{
                  bgcolor: alpha(theme.palette.grey[500], 0.1),
                  transition: theme.transitions.create([
                    "background-color",
                    "transform",
                  ]),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    transform: "scale(1.1)",
                  },
                }}
              >
                <SearchRounded />
              </IconButton>
            </Tooltip>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              
              {user?.id ? (
                <>
                  <Tooltip title="Wallet Balance">
                    <Button
                      component={Link}
                      to="/wallet?_pid=1"
                      variant="outlined"
                      color="primary"
                      startIcon={<WalletRounded />}
                      sx={{
                        fontSize: 12,
                        borderRadius: 1,
                      }}
                    >
                      {currencyFormatter(walletBalance || 0)}
                    </Button>
                  </Tooltip>

                  <Box sx={{ position: "relative" }}>
                    <Tooltip title="Notifications">
                      <IconButton
                        onClick={toggleNotification}
                        sx={{
                          transition: theme.transitions.create("transform"),
                          "&:hover": { transform: "scale(1.1)" },
                        }}
                      >
                        <Badge
                          badgeContent={unReadNotifications?.length}
                          color="error"
                          sx={{
                            "& .MuiBadge-badge": {
                              animation: unReadNotifications?.length
                                ? "pulse 1.5s infinite"
                                : "none",
                            },
                          }}
                        >
                          <NotificationsSharp />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    <NotificationDropdown
                      notifications={notifs}
                      open={showNotificationDropdown}
                      onClose={setShowNotificationDropdown}
                    />
                  </Box>

                  <Tooltip title="Profile">
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.secondary.main,
                        cursor: "pointer",
                        transition: theme.transitions.create("transform"),
                        "&:hover": { transform: "scale(1.05)" },
                      }}
                      aria-controls={open ? "account-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={handleClick}
                      src={user?.profile}
                      alt="profile"
                    >
                      {getInitials(user?.name || user?.email)}
                    </Avatar>
                  </Tooltip>
                </>
              ) : (
                <>
                  <NavLink
                    to="/user/login"
                    state={{ path: pathname, redirectURL: pathname }}
                    style={myLinkStyles}
                  >
                    Log in
                  </NavLink>
                  <Button
                    component={NavLink}
                    to="/user/register"
                    state={{ path: pathname, redirectURL: pathname }}
                    variant="contained"
                    size="small"
                    sx={{
                      borderRadius: 2,
                      boxShadow: "none",
                      "&:hover": {
                        boxShadow: theme.shadows[2],
                      },
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Stack>
             
          </Box>
        </Container>

        {/* Profile menu */}
        <Menu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          TransitionComponent={Fade}
          PaperProps={{
            elevation: 3,
            sx: {
              borderRadius: 2,
              mt: 1,
              minWidth: 150,
              "& .MuiMenuItem-root": {
                fontSize: "0.875rem",
                px: 2,
                py: 1,
                transition: theme.transitions.create("background-color"),
              },
            },
          }}
        >
          <MenuItem component={Link} to="/profile" onClick={handleClose}>
            Profile
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleClose();
              handleLogOut();
            }}
            sx={{ color: theme.palette.error.main }}
          >
            Log out
          </MenuItem>
        </Menu>

        {/* Global alert */}
        {globalAlert?.open && pathname !== "/profile" && (
          <Alert
            severity="info"
            sx={{
              fontSize: "0.875rem",
              borderRadius: 0,
              "& .MuiAlert-message": { width: "100%" },
            }}
            onClose={closeGlobalAlert}
          >
            {globalAlert?.message === "incomplete-profile" ? (
              <>
                Your profile is incomplete. Please complete it by clicking{" "}
                <Link
                  to="profile"
                  style={{ fontWeight: 600, textDecoration: "underline" }}
                >
                  here
                </Link>
                .
              </>
            ) : (
              globalAlert?.message
            )}
          </Alert>
        )}

        {/* {isFetching > 0 && (
        <Box
          sx={{
            position: "fixed",
            top: 70,
            right: 20,
            display: "flex",
            gap: 1,
          }}
        >
          <CircularProgress size={16} thickness={5} color="secondary" />
        </Box>
      )} */}
      </AppBar>
    </>
  );
}

export default Header;

// import { useState, useLayoutEffect } from "react";
// import {
//   AppBar,
//   IconButton,
//   Stack,
//   Divider,
//   Avatar,
//   useTheme,
//   Badge,
//   Box,
//   Container,
//   Button,
//   Tooltip,
//   Alert,
//   CircularProgress,
//   alpha,
//   Fade,
//   Typography,
// } from "@mui/material";
// import {
//   FacebookRounded,
//   Instagram,
//   Mail,
//   NotificationsSharp,
//   PhoneCallback,
//   Twitter,
//   WhatsApp,
//   WalletRounded,
//   SearchRounded,
//   Close,
//   MapOutlined,
//   Menu as MenuIcon,
//   MyLocation as MyLocationIcon,
// } from "@mui/icons-material";
// import Menu from "@mui/material/Menu";
// import MenuItem from "@mui/material/MenuItem";
// import Swal from "sweetalert2";
// import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
// import { IMAGES, currencyFormatter } from "@/constants";
// import { getInitials } from "@/config/validation";
// import NotificationDropdown from "@/components/dropdowns/NotificationDropdown";

// import { useIsFetching, useQueryClient } from "@tanstack/react-query";
// import { useCustomContext } from "../../context/providers/CustomProvider";
// import { useAuth } from "../../context/providers/AuthProvider";
// import Navbar from "../../components/dropdowns/Navbar";

// function Header() {
//   const queryClient = useQueryClient();
//   const { user, logout } = useAuth();
//   const [showAlert, setShowAlert] = useState(true);
//   const isFetching = useIsFetching();
//   const { pathname } = useLocation();
//   const {
//     customState: { openSidebar, globalAlert },
//     customDispatch,
//   } = useCustomContext();

//   const theme = useTheme();

//   const [shadow, setShadow] = useState("none");
//   const [anchorEl, setAnchorEl] = useState(null);
//   const [showNotificationDropdown, setShowNotificationDropdown] =
//     useState(false);
//   const navigate = useNavigate();

//   const walletBalance = queryClient.getQueryData({
//     queryKey: ["wallet-balance", user?.id],
//   });

//   const notifs = queryClient.getQueryData({
//     queryKey: ["notifications", user?.id],
//   });

//   const unReadNotifications = notifs?.filter(
//     (item) => item?.active && !item.isRead,
//   );

//   useLayoutEffect(() => {
//     if (user?.id && !user?.phonenumber) {
//       customDispatch({
//         type: "setGlobalAlert",
//         payload: {
//           open: true,
//           severity: "info",
//           message: "incomplete-profile",
//         },
//       });
//     }
//   }, [user, customDispatch]);

//   const open = Boolean(anchorEl);

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//   };
//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   window.onscroll = function () {
//     if (window.scrollY > 5) {
//       setShadow(theme.shadows[2]);
//     } else {
//       setShadow("none");
//     }
//   };

//   const toggleSideBar = () =>
//     customDispatch({
//       type: "openSidebar",
//       payload: !openSidebar,
//     });

//   const goHome = () => navigate("/", { replace: true });

//   const toggleNotification = () => {
//     setShowNotificationDropdown(!showNotificationDropdown);
//   };

//   const closeGlobalAlert = () => {
//     customDispatch({
//       type: "setGlobalAlert",
//       payload: { open: false },
//     });
//   };

//   const myLinkStyles = ({ isActive }) => ({
//     fontFamily: theme.typography.button.fontFamily,
//     fontSize: theme.typography.button.fontSize,
//     fontWeight: isActive ? 600 : 500,
//     textDecoration: "none",
//     color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
//     borderBottom: isActive
//       ? `2px solid ${theme.palette.primary.main}`
//       : "2px solid transparent",
//     paddingBottom: "4px",
//     transition: theme.transitions.create(["color", "border-bottom-color"], {
//       duration: theme.transitions.duration.short,
//     }),
//     "&:hover": {
//       color: theme.palette.primary.main,
//       borderBottomColor: alpha(theme.palette.primary.main, 0.4),
//     },
//   });

//   const handleLogOut = () => {
//     Swal.fire({
//       title: "Logging out",
//       text: "Do you want to log out?",
//       showCancelButton: true,
//       confirmButtonColor: theme.palette.error.main,
//       cancelButtonColor: theme.palette.grey[500],
//     }).then(async ({ isConfirmed }) => {
//       if (isConfirmed) {
//         logout();
//       }
//     });
//   };

//   const handleOpenSearch = () => {
//     customDispatch({ type: "openSearch", payload: true });
//   };

//   const getLocation = () => {
//     const position = [6.70675631287526, -1.6189752122036272];
//     const destination = `${position[0]},${position[1]}`;
//     const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
//     window.open(googleMapsUrl, "_blank");
//   };

//   return (
//     <AppBar
//       elevation={0}
//       sx={{
//         position: "sticky",
//         top: 0,
//         backgroundColor: theme.palette.background.paper,
//         borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
//         zIndex: 1200,
//         boxShadow: shadow,
//         transition: theme.transitions.create("box-shadow"),
//       }}
//       color="inherit"
//     >
//       <Container maxWidth="xl" sx={{ py: 1 }}>
//         {/* Top announcement bar */}
//         <Fade in={showAlert} timeout={800}>
//           <Box
//             sx={{
//               display: showAlert ? "flex" : "none",
//               alignItems: "center",
//               justifyContent: "space-between",
//               gap: 2,
//               pb: 1,
//               fontSize: "0.875rem",
//               color: theme.palette.text.secondary,
//             }}
//           >
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//               <span>Download our free mobile apps here.</span>
//               <Button
//                 component={Link}
//                 to="/downloads"
//                 size="small"
//                 variant="contained"
//                 sx={{
//                   minWidth: "auto",
//                   py: 0.5,
//                   px: 1.5,
//                   fontSize: "0.75rem",
//                   borderRadius: 1.5,
//                   boxShadow: "none",
//                   "&:hover": {
//                     boxShadow: theme.shadows[2],
//                   },
//                 }}
//               >
//                 Download
//               </Button>
//             </Box>
//             <IconButton
//               size="small"
//               onClick={() => setShowAlert(false)}
//               sx={{
//                 transition: theme.transitions.create([
//                   "background-color",
//                   "transform",
//                 ]),
//                 "&:hover": {
//                   bgcolor: alpha(theme.palette.grey[500], 0.1),
//                   transform: "scale(1.1)",
//                 },
//               }}
//             >
//               <Close fontSize="small" />
//             </IconButton>
//           </Box>
//         </Fade>

//         {/* Top contact & social row (desktop) */}
//         <Box
//           sx={{
//             display: { xs: "none", md: "flex" },
//             justifyContent: "space-between",
//             alignItems: "center",
//             py: 1,
//             borderBottom: `1px solid ${alpha(theme.palette.divider, 0.4)}`,
//             mb: 1,
//           }}
//         >
//           <Avatar
//             alt="logo"
//             src={IMAGES.logo}
//             sx={{
//               width: 56,
//               height: 56,
//               cursor: "pointer",
//               transition: theme.transitions.create("transform"),
//               "&:hover": { transform: "scale(1.02)" },
//             }}
//             onClick={goHome}
//           />

//           <Stack direction="row" spacing={3} alignItems="center">
//             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//               <MyLocationIcon
//                 fontSize="small"
//                 sx={{ color: theme.palette.text.secondary }}
//               />
//               <Typography variant="body2" color="secondary.main">
//                 AK-004-5284
//               </Typography>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//               <Mail
//                 fontSize="small"
//                 sx={{ color: theme.palette.text.secondary }}
//               />
//               <Link
//                 to="mailto:info@gpcpins.com"
//                 style={{
//                   color: theme.palette.secondary.main,
//                   textDecoration: "none",
//                 }}
//               >
//                 info@gpcpins.com
//               </Link>
//             </Box>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//               <PhoneCallback
//                 fontSize="small"
//                 sx={{ color: theme.palette.text.secondary }}
//               />
//               <Link
//                 to="tel:0322036582"
//                 style={{
//                   color: theme.palette.secondary.main,
//                   textDecoration: "none",
//                 }}
//               >
//                 0322036582
//               </Link>
//             </Box>
//             <Button
//               variant="outlined"
//               size="small"
//               startIcon={<MapOutlined />}
//               onClick={getLocation}
//               sx={{
//                 borderRadius: 2,
//                 borderColor: alpha(theme.palette.primary.main, 0.5),
//                 color: theme.palette.primary.main,
//                 "&:hover": {
//                   borderColor: theme.palette.primary.main,
//                   bgcolor: alpha(theme.palette.primary.main, 0.04),
//                 },
//               }}
//             >
//               Get Directions
//             </Button>
//           </Stack>

//           <Stack
//             direction="row"
//             spacing={1}
//             sx={{
//               display: { xs: "none", lg: "flex" },
//             }}
//           >
//             {[FacebookRounded, WhatsApp, Twitter, Instagram].map(
//               (Icon, idx) => (
//                 <IconButton
//                   key={idx}
//                   size="small"
//                   sx={{
//                     color: theme.palette.text.secondary,
//                     transition: theme.transitions.create([
//                       "color",
//                       "transform",
//                     ]),
//                     "&:hover": {
//                       color: theme.palette.primary.main,
//                       transform: "scale(1.15)",
//                     },
//                   }}
//                 >
//                   <Icon fontSize="small" />
//                 </IconButton>
//               ),
//             )}
//           </Stack>
//         </Box>

//         {/* Main header row */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 2,
//           }}
//         >
//           {/* Left side: menu icon + mobile wallet info */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               width: { xs: "100%", md: "auto" },
//             }}
//           >
//             <Box sx={{ flexGrow: 1, flex: 1 }}>
//               <IconButton
//                 onClick={toggleSideBar}
//                 sx={{
//                   transition: theme.transitions.create("transform"),
//                   "&:hover": { transform: "scale(1.1)" },
//                 }}
//               >
//                 <MenuIcon />
//               </IconButton>
//             </Box>
//             {/* Mobile wallet balance (visible only on xs) */}
//             {user?.id && (
//               <Box
//                 sx={{
//                   display: { xs: "flex", md: "none" },
//                   alignItems: "center",
//                   gap: 1,
//                 }}
//               >
//                 <Tooltip title="Search">
//                   <IconButton
//                     size="small"
//                     onClick={handleOpenSearch}
//                     sx={{
//                       bgcolor: alpha(theme.palette.grey[500], 0.1),
//                       transition: theme.transitions.create("transform"),
//                       "&:hover": { transform: "scale(1.1)" },
//                     }}
//                   >
//                     <SearchRounded fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//                 <Tooltip title="Wallet Balance">
//                   <Button
//                     component={Link}
//                     to="/wallet?_pid=1"
//                     size="small"
//                     variant="outlined"
//                     startIcon={<WalletRounded />}
//                     sx={{
//                       fontSize: 12,
//                       borderRadius: 1,
//                     }}
//                   >
//                     {currencyFormatter(walletBalance || 0)}
//                   </Button>
//                 </Tooltip>
//               </Box>
//             )}
//           </Box>

//           {/* Desktop navigation links */}
//           <Navbar />

//           {/* Right side: desktop actions */}
//           <Stack
//             direction="row"
//             spacing={2}
//             alignItems="center"
//             sx={{ display: { xs: "none", md: "flex" } }}
//           >
//             <Tooltip title="Search transactions">
//               <IconButton
//                 onClick={handleOpenSearch}
//                 sx={{
//                   bgcolor: alpha(theme.palette.grey[500], 0.1),
//                   transition: theme.transitions.create([
//                     "background-color",
//                     "transform",
//                   ]),
//                   "&:hover": {
//                     bgcolor: alpha(theme.palette.primary.main, 0.1),
//                     transform: "scale(1.1)",
//                   },
//                 }}
//               >
//                 <SearchRounded />
//               </IconButton>
//             </Tooltip>

//             {user?.id ? (
//               <>
//                 <Tooltip title="Wallet Balance">
//                   <Button
//                     component={Link}
//                     to="/wallet?_pid=1"
//                     variant="outlined"
//                     color="primary"
//                     startIcon={<WalletRounded />}
//                     sx={{
//                       fontSize: 12,
//                       borderRadius: 1,
//                     }}
//                   >
//                     {currencyFormatter(walletBalance)}
//                   </Button>
//                 </Tooltip>

//                 <Box sx={{ position: "relative" }}>
//                   <Tooltip title="Notifications">
//                     <IconButton
//                       onClick={toggleNotification}
//                       sx={{
//                         transition: theme.transitions.create("transform"),
//                         "&:hover": { transform: "scale(1.1)" },
//                       }}
//                     >
//                       <Badge
//                         badgeContent={unReadNotifications?.length}
//                         color="error"
//                         sx={{
//                           "& .MuiBadge-badge": {
//                             animation: unReadNotifications?.length
//                               ? "pulse 1.5s infinite"
//                               : "none",
//                           },
//                         }}
//                       >
//                         <NotificationsSharp />
//                       </Badge>
//                     </IconButton>
//                   </Tooltip>
//                   <NotificationDropdown
//                     notifications={notifs}
//                     open={showNotificationDropdown}
//                     onClose={setShowNotificationDropdown}
//                   />
//                 </Box>

//                 <Tooltip title="Profile">
//                   <Avatar
//                     sx={{
//                       bgcolor: theme.palette.secondary.main,
//                       cursor: "pointer",
//                       transition: theme.transitions.create("transform"),
//                       "&:hover": { transform: "scale(1.05)" },
//                     }}
//                     aria-controls={open ? "account-menu" : undefined}
//                     aria-haspopup="true"
//                     aria-expanded={open ? "true" : undefined}
//                     onClick={handleClick}
//                     src={user?.profile}
//                     alt="profile"
//                   >
//                     {getInitials(user?.name || user?.email)}
//                   </Avatar>
//                 </Tooltip>
//               </>
//             ) : (
//               <>
//                 <NavLink
//                   to="/user/login"
//                   state={{ path: pathname, redirectURL: pathname }}
//                   style={myLinkStyles}
//                 >
//                   Log in
//                 </NavLink>
//                 <Button
//                   component={NavLink}
//                   to="/user/register"
//                   state={{ path: pathname, redirectURL: pathname }}
//                   variant="contained"
//                   size="small"
//                   sx={{
//                     borderRadius: 2,
//                     boxShadow: "none",
//                     "&:hover": {
//                       boxShadow: theme.shadows[2],
//                     },
//                   }}
//                 >
//                   Sign up
//                 </Button>
//               </>
//             )}
//           </Stack>
//         </Box>
//       </Container>

//       {/* Profile menu */}
//       <Menu
//         id="account-menu"
//         anchorEl={anchorEl}
//         open={open}
//         onClose={handleClose}
//         TransitionComponent={Fade}
//         PaperProps={{
//           elevation: 3,
//           sx: {
//             borderRadius: 2,
//             mt: 1,
//             minWidth: 150,
//             "& .MuiMenuItem-root": {
//               fontSize: "0.875rem",
//               px: 2,
//               py: 1,
//               transition: theme.transitions.create("background-color"),
//             },
//           },
//         }}
//       >
//         <MenuItem component={Link} to="/profile" onClick={handleClose}>
//           Profile
//         </MenuItem>
//         <Divider />
//         <MenuItem
//           onClick={() => {
//             handleClose();
//             handleLogOut();
//           }}
//           sx={{ color: theme.palette.error.main }}
//         >
//           Log out
//         </MenuItem>
//       </Menu>

//       {/* Global alert */}
//       {globalAlert?.open && pathname !== "/profile" && (
//         <Alert
//           severity="info"
//           sx={{
//             fontSize: "0.875rem",
//             borderRadius: 0,
//             "& .MuiAlert-message": { width: "100%" },
//           }}
//           onClose={closeGlobalAlert}
//         >
//           {globalAlert?.message === "incomplete-profile" ? (
//             <>
//               Your profile is incomplete. Please complete it by clicking{" "}
//               <Link
//                 to="profile"
//                 style={{ fontWeight: 600, textDecoration: "underline" }}
//               >
//                 here
//               </Link>
//               .
//             </>
//           ) : (
//             globalAlert?.message
//           )}
//         </Alert>
//       )}

//       {isFetching > 0 && (
//         <Box
//           sx={{
//             position: "fixed",
//             top: 70,
//             right: 20,
//             display: "flex",
//             gap: 1,
//           }}
//         >
//           <CircularProgress size={16} thickness={5} color="secondary" />
//         </Box>
//       )}
//     </AppBar>
//   );
// }

// export default Header;
