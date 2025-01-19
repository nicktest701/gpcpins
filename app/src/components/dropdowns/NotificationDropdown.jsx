import {
  Box,
  Divider,
  IconButton,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import _ from "lodash";
import DOMPurify from "dompurify";
import React, { useEffect } from "react";
import {
  Close,
  Notifications,
  NotificationsOffSharp,
} from "@mui/icons-material";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import Menu from "@mui/icons-material/Menu";

const NotificationDropdown = ({ display, setClose, notifications }) => {
  const navigate = useNavigate();

  const handleClose = () => setClose(false);

  const goToTransactions = () => {
    navigate("/notifications");
    handleClose();
  };

  useEffect(() => {
    const interval = setTimeout(() => {
      if (display) {
        handleClose();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [display]);

  return (
    <Box
      sx={{
        display: "block",
        position: "absolute",
        visibility: display ? "visible" : "collapse",
        width: '50svh',
        maxHeight: '50svh',
        overflowY: "hidden",
        bgcolor: "#fff",
        top: 35,
        right: 10,
        zIndex: 999999,
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
        transform: `translateY(${display ? 0 : 10}px)`,
        transition: "all 150ms ease-in-out",
        opacity: display ? 1 : 0,
        borderRadius: 1,
      }}
    >
      <Stack
        bgcolor="secondary.main"
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p={1}
      >
        <Typography color="white" sx={{ flexGrow: 1 }}>
          Notifications
        </Typography>
        <IconButton onClick={goToTransactions}>
          <Menu />
        </IconButton>
        <IconButton onClick={handleClose}>
          <Close />
        </IconButton>
        {/* <Typography display='block'>Manage all unread messages</Typography> */}
      </Stack>
      <Stack bgcolor="white" sx={{ position: "relative", pb: 2 }}>
        {notifications?.length === 0 ? (
          <Stack justifyContent="center" alignItems="center" height={300}>
            <NotificationsOffSharp />
            <Typography variant="body2">No Notification available!</Typography>
          </Stack>
        ) : (
          _.take(notifications, 3)?.map((notif) => {
            return (
              <React.Fragment key={notif?._id}>
                <Stack
                  onClick={goToTransactions}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "whitesmoke",
                    },
                    p: 1,
                    bgcolor: notif?.active ? "#fabb7f30" : null,
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    pr={2}
                  >
                    <Typography
                      color="primary.main"
                      px={1}
                      variant="body2"
                      textTransform="capitalize"
                    >
                      {notif?.title}
                    </Typography>
                    <Notifications sx={{ width: 16, height: 16 }} />
                  </Stack>
                  {notif?.type === "Email" ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(notif?.message),
                      }}
                      style={{ padding: "16px" }}
                    ></div>
                  ) : (
                    <Typography variant="body2" color="secondary.main" p={1}>
                      {notif?.message}
                    </Typography>
                  )}
                  {notif?.link && (
                    <Button
                      // variant="outlined"
                      color="secondary"
                      LinkComponent="a"
                      href={notif?.link}
                      target="_blank"
                      rel="noreferrer"
                      sx={{
                        alignSelf: "flex-end",
                        ml: 1,
                        textDecoration: "underline",
                      }}
                    >
                      Download
                    </Button>
                  )}

                  <Typography p={1} fontSize={10} textAlign="right">
                    {moment(notif?.createdAt).fromNow()}
                  </Typography>
                </Stack>
                <Divider flexItem />
              </React.Fragment>
            );
          })
        )}

        {notifications?.length > 0 && (
          <Link
            to="/notifications"
            style={{
              display: "block",
              textDecoration: "none",
              textAlign: "center",
              paddingBlock: "12px",
              marginBottom: "12px",
            }}
          >
            Show More...
          </Link>
        )}
      </Stack>
    </Box>
  );
};

export default NotificationDropdown;
