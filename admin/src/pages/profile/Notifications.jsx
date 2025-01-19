import { useContext, Fragment } from "react";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import {
  Divider,
  Stack,
  Typography,
  Tooltip,
  IconButton,
  Box,
} from "@mui/material";
import DOMPurify from "dompurify";
import { CustomContext } from "../../context/providers/CustomProvider";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { NotificationsOffSharp } from "@mui/icons-material";
import _ from "lodash";
import moment from "moment";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotifications,
  getAllNotifications,
  updateNotification,
} from "../../api/notificationAPI";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";
import { globalAlertType } from "../../components/alert/alertType";

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    initial: queryClient?.getQueryData(["notifications"]),
  });

  // Custom hook to fetch broadcast notifications
  const notificationStatus = useQuery({
    // Define the query key as "notifications"
    queryKey: ["notifications-status"],
    // Define the query function as a function that calls getAllBroadcastMessages
    queryFn: () => updateNotification(),
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

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: deleteNotifications,
  });
  const handleRemoveNotification = () => {
    Swal.fire({
      title: "Removing Notifications",
      text: `You are about to remove all notifications.Changes cannot be undone.`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      const all = _.map(notifications?.data, "_id");

      if (isConfirmed) {
        mutateAsync(
          { all },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["notifications"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
              // localStorage.setItem("removed-notifications",JSON.stringify(all));
            },
            onError: (error) => {
              customDispatch(globalAlertType("error", error));
            },
          }
        );
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
          bgcolor: "#fff",
          p: 1,
        }}
      >
        {/* <Box>
        <Typography variant="h4">Notifications</Typography>
        <Typography paragraph variant="caption" color="secondary.main">
        View all your personalize notifications.
        </Typography>
      </Box> */}
        {unReadNotifications.length > 0 && (
          <Typography variant="h6">
            {unReadNotifications.length} Unread Notifications
          </Typography>
        )}
        <Stack flex={1} direction="row" justifyContent="flex-end" spacing={1} py={1}>
          <Tooltip title="Mark All Read">
            <span>
              <IconButton
                color="primary"
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
      <Stack  bgcolor='#fff' sx={{ maxHeight: "80svh", overflowY: "auto" }}>
        {notifications.isLoading && <Typography>Loading</Typography>}

        {notifications?.data?.length === 0 ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            height={500}
            overflow="auto"
            bgcolor='#fff'
          >
            <NotificationsOffSharp />
            <Typography>No Notification available!</Typography>
          </Stack>
        ) : (
          notifications?.data?.map((notif) => {
            return (
              <Fragment key={notif?._id}>
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
                  <Typography color="primary.main" p={1} fontWeight={700}>
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
                    <Typography variant="body2" color="primary.main" p={1}>
                      {notif?.message}
                    </Typography>
                  )}
                  <Typography
                    color="secondary.main"
                    p={1}
                    fontSize={10}
                    textAlign="right"
                  >
                    {moment(notif?.createdAt).fromNow()}
                  </Typography>
                </Stack>
                <Divider flexItem />
              </Fragment>
            );
          })
        )}
      </Stack>
      {isLoading && <GlobalSpinner />}
    </AnimatedContainer>
  );
};

export default Notifications;
