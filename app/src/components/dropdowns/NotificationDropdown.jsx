import React, { useCallback, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Divider,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Link as MuiLink,
} from "@mui/material";
import {
  Close,
  Notifications,
  NotificationsOffSharp,
  Visibility,
} from "@mui/icons-material";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import DOMPurify from "dompurify";

// ----------------------------------------------------------------------
// Types (add proper types if you are using TypeScript)
// ----------------------------------------------------------------------

// ----------------------------------------------------------------------
// Component
// ----------------------------------------------------------------------
const NotificationDropdown = React.memo(
  ({ open, onClose, notifications, autoCloseTimeout = 5000 }) => {
    const navigate = useNavigate();
    const timeoutRef = useRef(null);
    const paperRef = useRef(null);

    // Navigate to the notifications page and close dropdown
    const handleViewAll = useCallback(() => {
      navigate("/notifications");
      onClose(false);
    }, [navigate, onClose]);

    // Close dropdown
    const handleClose = useCallback(() => {
      onClose(false);
    }, [onClose]);

    // Auto‑close after a delay (if enabled)
    useEffect(() => {
      if (open && autoCloseTimeout > 0) {
        timeoutRef.current = setTimeout(handleClose, autoCloseTimeout);
      }
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, [open, autoCloseTimeout, handleClose]);

    // Click outside handling (optional, adds robustness)
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (paperRef.current && !paperRef.current.contains(event.target)) {
          handleClose();
        }
      };
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [open, handleClose]);

    // Escape key handling
    useEffect(() => {
      const handleEsc = (event) => {
        if (event.key === "Escape") {
          handleClose();
        }
      };
      if (open) {
        document.addEventListener("keydown", handleEsc);
      }
      return () => {
        document.removeEventListener("keydown", handleEsc);
      };
    }, [open, handleClose]);

    // Limit displayed notifications (show first 3)
    const displayedNotifications = notifications?.slice(0, 3) ?? [];

    return (
      <Paper
        ref={paperRef}
        elevation={6}
        sx={{
          position: "absolute",
          top: 40,
          right: 10,
          width: { xs: "calc(100vw - 32px)", sm: 360, md: 400 },
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          zIndex: 1300,
          visibility: open ? "visible" : "hidden",
          opacity: open ? 1 : 0,
          transform: `translateY(${open ? 0 : -8}px)`,
          transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s",
          borderRadius: 2,
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: "column",
        }}
        role="dialog"
        aria-label="Notifications"
      >
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "primary.main",
            color: "white",
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={handleViewAll}
              aria-label="View all notifications"
              sx={{ color: "white" }}
            >
              <Visibility fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={handleClose}
              aria-label="Close"
              sx={{ color: "white" }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        {/* Notification List */}
        {displayedNotifications.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <NotificationsOffSharp color="disabled" sx={{ fontSize: 48 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications available
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ flex: 1 }}>
            {displayedNotifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  disablePadding
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.active ? "action.hover" : "transparent",
                    transition: "background-color 0.2s",
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <ListItemButton
                    onClick={handleViewAll}
                    sx={{
                      flexDirection: "column",
                      alignItems: "stretch",
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    {/* Header with title and icon */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={0.5}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={notif.active ? "bold" : "normal"}
                        color="text.primary"
                      >
                        {notif.title}
                      </Typography>
                      <Notifications
                        fontSize="small"
                        color={notif.active ? "primary" : "disabled"}
                      />
                    </Stack>

                    {/* Message content */}
                    <Box sx={{ mb: 1, width: "100%" }}>
                      {notif.type === "Email" ? (
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(notif.body),
                          }}
                          sx={{
                            "& p": { m: 0, fontSize: "0.875rem" },
                            "& a": { color: "primary.main" },
                          }}
                        />
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ wordBreak: "break-word" }}
                        >
                          {notif.body}
                        </Typography>
                      )}
                    </Box>

                    {/* Download link (if present) */}
                    {notif.link && (
                      <Button
                        component="a"
                        href={notif.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        variant="text"
                        sx={{
                          alignSelf: "flex-start",
                          p: 0,
                          minWidth: "auto",
                          textDecoration: "underline",
                          textTransform: "none",
                          fontWeight: "normal",
                        }}
                      >
                        Download
                      </Button>
                    )}

                    {/* Timestamp */}
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ mt: 1, textAlign: "right", display: "block" }}
                    >
                      {moment(notif.createdAt).fromNow()}
                    </Typography>
                  </ListItemButton>
                </ListItem>
                {index < displayedNotifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Footer "Show more" link */}
        {notifications?.length > 0 && (
          <Box
            sx={{
              p: 1,
              textAlign: "center",
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <MuiLink
              component={Link}
              to="/notifications"
              onClick={handleViewAll}
              underline="hover"
              variant="body2"
              sx={{ display: "inline-block", py: 0.5 }}
            >
              Show all notifications
            </MuiLink>
          </Box>
        )}
      </Paper>
    );
  },
);

NotificationDropdown.displayName = "NotificationDropdown";

export default NotificationDropdown;
