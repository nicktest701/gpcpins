import React, { useContext } from "react";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import {
  Divider,
  Stack,
  Typography,
  Button,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { NotificationsOffSharp } from "@mui/icons-material";
import moment from "moment";
import DOMPurify from "dompurify";
import {
  changeNotificationStatus,
  getAllBroadcastMessages,
  removeNotification,
} from "../../api/broadcastMessageAPI";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/providers/AuthProvider";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import GlobalSpinner from "../../components/GlobalSpinner";

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();

  // Custom hook to fetch broadcast notifications
  const notificationStatus = useQuery({
    // Define the query key as "notifications"
    queryKey: ["notifications-status"],
    // Define the query function as a function that calls getAllBroadcastMessages
    queryFn: changeNotificationStatus,
    refetchOnWindowFocus: "always",
    enabled: false,
    onSuccess: () => {
      customDispatch(globalAlertType("info", "Notifications marked as read!"));
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const handleMarkAsRead = () => {
    Swal.fire({
      title: " Notifications",
      text: `Mark all as read?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        notificationStatus.refetch();
      }
    });
  };

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllBroadcastMessages(),
    enabled: !!user?.id,
    retry: 1,
    initialData: queryClient.getQueryData(["notifications"]),
    // Define the query function as a function that calls getAllBroadcastMessages
  });

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: removeNotification,
  });
  const handleRemoveNotification = (id) => {
    Swal.fire({
      title: "Removing Notifications",
      text: `You are about to remove all notifications.Changes cannot be undone.`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(id, {
          onSettled: () => {
            queryClient.invalidateQueries(["notifications"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const unReadNotifications = notifications?.data?.filter(
    (item) => item?.active === 1
  );

  return (
    <AnimatedContainer>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1,
        }}
      >
        {/* <Box>
          <Typography variant="h4">Notifications</Typography>
          <Typography paragraph variant="caption">
            View all your personalize notifications.
          </Typography>
        </Box> */}
        {unReadNotifications.length > 0 && (
          <Typography variant="h6">
            {unReadNotifications.length} Unread Notifications
          </Typography>
        )}
        <Stack
          flex={1}
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          py={1}
        >
          <Tooltip title="Mark All Read">
            <span>
              <IconButton
                color="secondary"
                disabled={
                  notifications?.data?.length === 0 ||
                  unReadNotifications?.length === 0
                }
                onClick={handleMarkAsRead}
              >
                <MarkChatReadIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete All">
            <span>
              <IconButton
                color="error"
                disabled={notifications?.data?.length === 0}
                onClick={() => handleRemoveNotification()}
              >
                <DeleteSweepIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
      <Stack
        bgcolor="white"
        sx={{ position: "relative", maxHeight: 400, overflowY: "auto" }}
      >
        {notifications.isLoading && <Typography>Loading</Typography>}

        {notifications?.data?.length === 0 ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            height={500}
            overflow="auto"
          >
            <NotificationsOffSharp />
            <Typography>No Notification available!</Typography>
          </Stack>
        ) : (
          notifications?.data?.map((notif) => {
            return (
              <React.Fragment key={notif?._id}>
                <Stack
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "whitesmoke",
                    },
                    p: 2,
                    bgcolor: notif?.active ? "#fabb7f30" : null,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="primary.main"
                    textTransform="capitalize"
                  >
                    {notif?.title}
                  </Typography>
                  {notif?.type === "Email" ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(notif?.message),
                      }}
                      style={{ padding: "16px" }}
                    ></div>
                  ) : (
                    <Typography variant="body2" p={1}>
                      {notif?.message}
                    </Typography>
                  )}
                  {notif?.link && (
                    <Button
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
      </Stack>
      {/* {notificationStatus.isLoading && <GlobalSpinner />} */}
      {isLoading && <GlobalSpinner />}
    </AnimatedContainer>
  );
};

export default Notifications;
