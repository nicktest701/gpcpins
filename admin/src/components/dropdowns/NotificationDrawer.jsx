import {
  Drawer,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  Divider,
} from "@mui/material";

import _ from "lodash";
import { AnimatePresence } from "framer-motion";
import { Close, Notifications } from "@mui/icons-material";
import moment from "moment";
import DOMPurify from "dompurify";
import {  useNavigate } from "react-router-dom";
import { Fragment } from "react";

const NotificationDrawer = ({ open, setOpen, notifications }) => {
  const navigate = useNavigate();

  const handleClose = () => setOpen(false);

  const goToTransactions = () => {
    navigate("/notifications");
    handleClose();
  };

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      sx={{ zIndex: 9999 }}
      anchor="right"
    >
      <Stack
        sx={{
          minHeight: "100vh",
          width: { xs: 280, md: 500 },
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          pb: 1,
        }}
        bgcolor="#fff"
        spacing={1}
      >
        <Stack
          bgcolor="primary.main"
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          p={1}
        >
          <Notifications htmlColor="#fff" />
          <Typography color="white" sx={{ pl: 1, flexGrow: 1 }}>
            Notifications
          </Typography>

          {/* <Tooltip title="Refresh Notifications">
            <IconButton onClick={notifications?.refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Close">
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Tooltip>
        </Stack>
        {/* <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          pr={2}
          spacing={2}
        >
          <Tooltip title="">
            <Button size="small" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          </Tooltip>

          <Tooltip title="">
            <Button size="small" onClick={handleRemoveAll}>
              Clear All
            </Button>
          </Tooltip>
        </Stack> */}

        {/* {notifications.isLoading ? (
          <Typography>Please Wait...</Typography>
        ) : notifications?.isError ? (
          <Typography>An error has occurred..</Typography>
        ) : ( */}
          <>
            {notifications?.length === 0 ? (
              <Stack
                spacing={2}
                height="80svh"
                justifyContent="center"
                alignItems="center"
                overflow="auto"
              >
                <Typography>No new Notifications</Typography>
              </Stack>
            ) : (
              <AnimatePresence>
                <Stack spacing={1} height="90svh" overflow="auto">
                  {notifications?.map((notification) => {
                    return (
                      <Fragment key={notification?._id}>
                        <Stack
                          onClick={goToTransactions}
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "whitesmoke",
                            },
                            p: 1,
                            bgcolor: notification?.active ? "#fabb7f30" : null,
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
                              fontWeight='700'
                            >
                              {notification?.title}
                            </Typography>
                            <Notifications sx={{ width: 16, height: 16 }} />
                          </Stack>
                          {notification?.type === "Email" ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  notification?.message
                                ),
                              }}
                              style={{ padding: "16px",     overflow: "hidden", // Ensures the text doesn't overflow the container
                                textOverflow: "ellipsis", // Adds the ellipsis to the truncated text
                                display: "-webkit-box", // Use a flexbox model with block-level boxes
                                WebkitBoxOrient: "vertical", // Ensures that the flexbox layout is vertical          // Hides any text that overflows the container
                                WebkitLineClamp: 3, }}
                            ></div>
                          ) : (
                            <Typography
                              variant="body2"
                              color="primary.main"
                              // p={1}

                              sx={{
                                overflow: "hidden", // Ensures the text doesn't overflow the container
                                textOverflow: "ellipsis", // Adds the ellipsis to the truncated text
                                display: "-webkit-box", // Use a flexbox model with block-level boxes
                                WebkitBoxOrient: "vertical", // Ensures that the flexbox layout is vertical          // Hides any text that overflows the container
                                WebkitLineClamp: 3,
                              }}
                            >
                              {notification?.message}
                            </Typography>
                          )}
                          <Typography p={1} fontSize={10} textAlign="right">
                            {moment(notification?.createdAt).fromNow()}
                          </Typography>
                        </Stack>
                        <Divider flexItem />
                      </Fragment>
                    );
                  })}
                </Stack>
              </AnimatePresence>
            )}
          </>
        {/* )} */}

        <Typography variant="caption" textAlign="center">
          Gab Powerful Consult &copy; {new Date().getFullYear()}
        </Typography>
      </Stack>
    </Drawer>
  );
};

export default NotificationDrawer;
