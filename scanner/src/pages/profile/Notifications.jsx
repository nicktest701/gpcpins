import AnimatedContainer from "../../components/animations/AnimatedContainer";
import { Stack, Typography, Tooltip, IconButton, Box } from "@mui/material";

import { useCustomData } from "../../context/providers/CustomProvider";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { NotificationsOffSharp } from "@mui/icons-material";
import _ from "lodash";
import Swal from "sweetalert2";
import { useAuth } from "../../context/providers/AuthProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotifications,
  getAllNotifications,
  updateNotification,
} from "../../api/notificationAPI";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";
import { globalAlertType } from "../../components/alert/alertType";
import NotificationItem from "../../components/items/NotificationItem";

const Notifications = () => {
  const { user } = useAuth();
  const { customDispatch } = useCustomData();
  const queryClient = useQueryClient();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    initial: [],
  });

  const { mutateAsync: readMutateAsync, isLoading: readIsLoading } =
    useMutation({
      mutationFn: updateNotification,
    });

  const handleMarkAsRead = () => {
    Swal.fire({
      title: " Notifications",
      text: `Mark all as read?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const ids = _.map(notifications?.data, "_id");

        readMutateAsync(ids, {
          onSettled: () => {
            queryClient.invalidateQueries(["notifications"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            customDispatch(
              globalAlertType("info", "Notifications marked as read!")
            );
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  //DELETE ALL
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: deleteNotifications,
  });
  const handleRemoveNotification = () => {
    Swal.fire({
      title: "Removing Notifications",
      text: `You are about to remove all notifications.Changes cannot be undone.`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      const ids = _.map(notifications?.data, "_id");

      if (isConfirmed) {
        mutateAsync(ids, {
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
      <Stack bgcolor="#fff" sx={{ maxHeight: "80svh", overflowY: "auto" }}>
        {notifications.isLoading && <Typography>Loading</Typography>}

        {notifications?.data?.length === 0 ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            height={500}
            overflow="auto"
            bgcolor="#fff"
          >
            <NotificationsOffSharp  />
            <Typography variant='body2'>No Notification available!</Typography>
          </Stack>
        ) : (
          notifications?.data?.map((notif) => {
            return <NotificationItem notif={notif} key={notif?._id} />;
          })
        )}
      </Stack>
      {(isLoading || readIsLoading) && <GlobalSpinner />}
    </AnimatedContainer>
  );
};

export default Notifications;
