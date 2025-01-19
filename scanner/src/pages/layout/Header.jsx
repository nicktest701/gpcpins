import { useState } from "react";
import {
  AppBar,
  IconButton,
  Stack,
  useTheme,
  Box,
  Toolbar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useLocation } from "react-router-dom";
import { useCustomData } from "../../context/providers/CustomProvider";
import { useAuth } from "../../context/providers/AuthProvider";
import { bgBlur } from "../../theme/css";
import AccountPopover from "../../components/popover/account-popover";
import NotificationsPopover from "../../components/popover/notifications-popover";
import Searchbar from "../../components/custom/searchbar";

function Header() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const {
    customState: { openSidebar },
    customDispatch,
  } = useCustomData();

  const {
    palette,
    zIndex,
    typography: { button },
  } = useTheme();

  const [shadow, setShadow] = useState("none");

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

  const myLinkStyles = ({ isActive }) => {
    return {
      fontFamily: button.fontFamily,
      fontSize: button.fontSize,
      // position: 'relative',
      textDecoration: "none",
      borderBottom: isActive ? `solid 1px ${palette.primary.main}` : null,
      color: isActive ? palette.primary.main : "#333",

      fontWeight: isActive ? "bold" : "normal",
    };
  };

  return (
    <AppBar
      elevation={0}
      sx={{
        position: "sticky",
        top: 0,
        color: "primary",
        zIndex: zIndex.appBar + 1,
        ...bgBlur({
          color: palette.background.default,
        }),
        // zIndex: 999,
        boxShadow: shadow,
        width: "100%",
      }}
      color="inherit"
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Searchbar />

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            px: { xs: 2, md: 4, lg: 5 },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", md: "flex" } }}
            alignItems="center"
          >
            <>
              {user?.id ? (
                <>
                  <NotificationsPopover />
                  <AccountPopover />
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
      </Toolbar>
    </AppBar>
  );
}

export default Header;
