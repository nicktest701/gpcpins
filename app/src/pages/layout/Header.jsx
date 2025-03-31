import { useState, useContext, useLayoutEffect } from "react";
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
  Skeleton,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  FacebookRounded,
  Instagram,
  Mail,
  NotificationsSharp,
  PhoneCallback,
  Twitter,
  WhatsApp,
  WalletRounded,
  SearchRounded,
  Close,
  MapOutlined,
} from "@mui/icons-material";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import Swal from "sweetalert2";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { IMAGES, currencyFormatter } from "../../constants";
import { CustomContext } from "../../context/providers/CustomProvider";
import EvoucherDropdown from "../../components/dropdowns/EvoucherDropdown";
import { getInitials } from "../../config/validation";
import PrepaidDropdown from "../../components/dropdowns/PrepaidDropdown";
import NotificationDropdown from "../../components/dropdowns/NotificationDropdown";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useGoogleOneTapLogin } from "@react-oauth/google";
import api from "../../api/customAxios";
import { globalAlertType } from "../../components/alert/alertType";
import { getAllBroadcastMessages } from "../../api/broadcastMessageAPI";
import { useQuery, useIsFetching, useQueryClient } from "@tanstack/react-query";
import { saveToken } from "../../config/sessionHandler";
import { getWalletBalance } from "../../api/userAPI";
import GlobalSpinner from "../../components/GlobalSpinner";

function Header() {
  const { user, login, logout } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const isFetching = useIsFetching();
  const { pathname } = useLocation();
  const {
    customState: { openSidebar, globalAlert },

    customDispatch,
  } = useContext(CustomContext);

  const {
    palette,
    typography: { button },
  } = useTheme();

  const [photo, setPhoto] = useState(null);
  const [shadow, setShadow] = useState("none");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showEvoucherDropdown, setShowEvoucherDropdown] = useState(false);
  const [showPrepaidDropdown, setShowPrepaidDropdown] = useState(false);
  const [showNotificationDropdown, setShowNotificationDropdown] =
    useState(false);
  const navigate = useNavigate();

  const walletBalance = useQuery({
    queryKey: ["wallet-balance", user?.id],
    queryFn: () => getWalletBalance(user?.id),
    enabled: !!user?.id,
    initialData: queryClient?.getQueryData(["wallet-balance"]),
  });

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllBroadcastMessages(),
    enabled: !!user?.id,
    initialData: queryClient?.getQueryData(["notifications"]),
  });

  const unReadNotifications = notifications?.data?.filter(
    (item) => item?.active === 1
  );

  useGoogleOneTapLogin({
    disabled: Boolean(user?.id),
    onSuccess: async ({ credential }) => {
      setIsGoogleLoading(true);
      try {
        const res = await api({
          method: "POST",
          url: "/users/login-google-tap",
          data: {
            credential,
          },
          withCredentials: true,
        });

        saveToken(res.data?.accessToken, res.data?.refreshToken);
        login(res.data?.accessToken);

        if (res.data?.register) {
          navigate("/user/started", {
            state: { google: true },
          });
        } else {
          login(res.data?.accessToken);
          navigate(pathname);
        }
      } catch (error) {
        customDispatch(globalAlertType("error", "Authentication Failed!"));
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      customDispatch(globalAlertType("error", "Authentication Failed!"));
    },
  });

  useLayoutEffect(() => {
    setPhoto(user?.profile);
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

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
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

  const toggleNotification = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const closeGlobalAlert = () => {
    customDispatch({
      type: "setGlobalAlert",
      payload: {
        open: false,
      },
    });
  };

  const myLinkStyles = ({ isActive }) => {
    return {
      // textTransform: "uppercase",
      fontFamily: button.fontFamily,
      // fontSize: button.fontSize,
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

  const handleOpenSearch = () => {
    customDispatch({ type: "openSearch", payload: true });
  };

  const getLocation = () => {
    const position = [6.70675631287526, -1.6189752122036272];
    const destination = `${position[0]},${position[1]}`;
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    window.open(googleMapsUrl, "_blank");
  };

  return (
    <AppBar
      elevation={0}
      sx={{
        position: "sticky",
        top: 0,
        color: "primary",
        backgroundColor: "#fff",
        borderBottom: "1px solid #ccc",
        zIndex: 999,
        boxShadow: shadow,
        width: "100%",
      }}
      color="inherit"
    >
      <Container sx={{ py: 1 }}>
        {showAlert && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 2,
              pb: 1,
            }}
          >
            <div style={{ flexGrow: "1" }}>
              <small>Download our free mobile apps here.</small>

              <Link
                to="/downloads"
                style={{
                  color: "#fff",
                  backgroundColor: "var(--primary)",
                  paddingBlock: "2px",
                  paddingInline: "4px",
                  fontSize: "12px",
                  borderRadius: "4px",
                  marginLeft: "2px",
                }}
              >
                Download
              </Link>
            </div>
            <Close onClick={() => setShowAlert(false)} />
          </Box>
        )}

        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
            paddingBlock: "8px",
          }}
        >
          <Avatar
            alt="logo"
            src={IMAGES.coat_of_arms}
            sx={{
              width: 60,
              height: 60,
              cursor: "pointer",
              display: { xs: "none", md: "inline-flex" },
            }}
            onClick={goHome}
          />

          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="flex-start"
            spacing={2}
          >
            <div className="footer-contact-item">
              <MyLocationIcon fontSize="small" />
              <span> AK-004-5284</span>
            </div>
            <div className="footer-contact-item">
              <Mail fontSize="small" />
              <a
                style={{
                  color: "var(--secondary)",
                }}
                href="mailto:info@gpcpins.com"
              >
                {" "}
                info@gpcpins.com
              </a>
            </div>
            <div className="footer-contact-item">
              <PhoneCallback fontSize="small" />
              <a
                style={{
                  color: "var(--secondary)",
                }}
                href="tel:0322036582"
              >
                0322036582
              </a>
            </div>
            <Button
              variant="outlined"
              size="small"
              sx={{ py: 0, px: 1 }}
              startIcon={<MapOutlined />}
              onClick={getLocation}
            >
              Get Directions
            </Button>
          </Stack>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="flex-start"
            spacing={2}
          >
            <FacebookRounded />
            <WhatsApp />
            <Twitter />
            <Instagram />
          </Stack>
        </Box>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            // border:'1px solid red',
          }}
        >
          <IconButton color="inherit" sx={{ mr: 4 }} onClick={toggleSideBar}>
            <MenuIcon />
          </IconButton>
          {user?.id && (
            <Box
              sx={{
                display: { xs: "flex", md: "none" },
                justifyContent: "flex-end",
                alignItems: "center",
                width: "100%",
                gap: 2,
              }}
            >
              {walletBalance.isLoading ? (
                <Skeleton variant="rectangular" width={80} height={30} />
              ) : (
                <>
                  <Box sx={{ position: "relative" }}>
                    <Tooltip title="Search for transaction">
                      <a href="#lost">
                        <IconButton
                          sx={{ bgcolor: "lightgray" }}
                          onClick={handleOpenSearch}
                          size="small"
                        >
                          <SearchRounded sx={{ width: 20, height: 20 }} />
                        </IconButton>
                      </a>
                    </Tooltip>
                  </Box>
                  <Tooltip title="Wallet Balance">
                    <Link to="/wallet?_pid=1">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<WalletRounded />}
                        sx={{ fontSize: 12, borderRadius: 1 }}
                      >
                        {currencyFormatter(walletBalance.data)}
                      </Button>
                    </Link>
                  </Tooltip>
                </>
              )}
            </Box>
          )}

          <Stack
            direction="row"
            spacing={1}
            flexGrow={1}
            sx={{
              display: { xs: "none", md: "flex" },
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              gap: 1,
            }}
          >
            <NavLink to="/" style={myLinkStyles} className="nav-item">
              Home
            </NavLink>
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setShowEvoucherDropdown(true)}
              onMouseLeave={() => setShowEvoucherDropdown(false)}
            >
              <NavLink to="evoucher" style={myLinkStyles} className="nav-item">
                Vouchers &#38; Tickets
              </NavLink>
              <EvoucherDropdown display={showEvoucherDropdown} />
            </div>
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setShowPrepaidDropdown(true)}
              onMouseLeave={() => setShowPrepaidDropdown(false)}
            >
              <NavLink
                to="electricity"
                style={myLinkStyles}
                className="nav-item"
              >
                Prepaid Units
              </NavLink>
              <PrepaidDropdown display={showPrepaidDropdown} />
            </div>
            <NavLink to="airtime" style={myLinkStyles} className="nav-item">
              Airtime &#38; Data Bundle
            </NavLink>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
          >
            <>
              <Tooltip title="Search for transaction">
                <a href="#lost">
                  <IconButton
                    sx={{ bgcolor: "lightgray" }}
                    onClick={handleOpenSearch}
                  >
                    <SearchRounded />
                  </IconButton>
                </a>
              </Tooltip>
              {user?.id ? (
                <>
                  {walletBalance.isLoading ? (
                    <Skeleton variant="rounded" width={80} height={40} />
                  ) : (
                    <Tooltip title="Wallet Balance">
                      <Link to="/wallet?_pid=1">
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<WalletRounded />}
                        >
                          {currencyFormatter(walletBalance.data)}
                        </Button>
                      </Link>
                    </Tooltip>
                  )}
                  <div style={{ position: "relative" }}>
                    <Tooltip title="Notifications">
                      <IconButton onClick={toggleNotification}>
                        <Badge
                          badgeContent={unReadNotifications?.length}
                          color="error"
                        >
                          <NotificationsSharp />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    <NotificationDropdown
                      notifications={notifications?.data}
                      display={showNotificationDropdown}
                      setClose={setShowNotificationDropdown}
                    />
                  </div>
                  <Tooltip title="Profile">
                    <Avatar
                      sx={{ bgcolor: "secondary.main", cursor: "pointer" }}
                      aria-controls={open ? "account-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                      onClick={handleClick}
                      src={photo}
                      alt="profile_icon"
                    >
                      {getInitials(user?.email)}
                    </Avatar>
                  </Tooltip>
                </>
              ) : (
                <>
                  <NavLink
                    to="/user/login"
                    state={{ path: pathname, redirectURL: pathname }}
                    className="nav-item"
                    style={myLinkStyles}
                  >
                    LOG IN
                  </NavLink>
                  <NavLink
                    to="/user/register"
                    state={{ path: pathname, redirectURL: pathname }}
                    className="primary-btn"
                    style={{
                      // borderRadius: '8px',
                      paddingBlock: "8px",
                      textTransform: "uppercase",
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
            // PaperProps={{
            //   style: {
            //     maxHeight: ITEM_HEIGHT * 4.5,
            //     fontSize: "14px !important",
            //   },
            // }}
          >
            <Link
              to="/profile"
              style={{
                textAlign: "center",
                display: "block",
                textDecoration: "none",
                color: "#083d77",
                padding: "8px 12px",
              }}
            >
              Profile
            </Link>

            <Divider />
            <a
              onClick={handleLogOut}
              style={{
                textAlign: "center",
                display: "block",
                textDecoration: "none",
                color: "#083d77",
                padding: "8px 12px",
                cursor: "pointer",
              }}
            >
              Log out
            </a>
          </Menu>
        </div>
      </Container>
      {globalAlert?.open && pathname !== "/profile" && (
        <Alert severity="info" sx={{ fontSize: 14 }} onClose={closeGlobalAlert}>
          {globalAlert?.message === "incomplete-profile" ? (
            <>
              Your profile is incomplete.Please complete it by clicking
              <Link to="profile"> here</Link> .
            </>
          ) : (
            globalAlert?.message
          )}
        </Alert>
      )}
      {isGoogleLoading && <GlobalSpinner />}
      {/* <GlobalSpinner /> */}
      {isFetching > 0 ? (
        <div
          style={{
            display: "flex",
            gap: "8px",
            position: "fixed",
            top: 70,
            left: 20,
          }}
        >
          <CircularProgress color="secondary" size={16} thickness={5} />
        </div>
      ) : null}
    </AppBar>
  );
}

export default Header;
