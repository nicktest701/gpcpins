import { IconButton, Stack, Typography, Divider } from "@mui/material";
import { Fragment, useContext } from "react";
import MarkChatReadIcon from "@mui/icons-material/MarkChatRead";
import { Delete } from "@mui/icons-material";
import moment from "moment";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteNotifications,
  updateNotification,
} from "../../api/notificationAPI";
import { globalAlertType } from "../alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import GlobalSpinner from "../spinners/GlobalSpinner";

function NotificationItem({ notif }) {
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();

  const { mutateAsync: readMutateAsync, isLoading: readIsLoading } =
    useMutation({
      mutationFn: updateNotification,
    });

  const handleMarkAsRead = () => {
    Swal.fire({
      title: " Notifications",
      text: `Mark as read?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const ids = [notif?._id];

        readMutateAsync(ids, {
          onSettled: () => {
            queryClient.invalidateQueries(["notifications"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            customDispatch(
              globalAlertType("info", "Notification marked as read!")
            );
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: deleteNotifications,
  });

  const handleRemoveNotification = () => {
    Swal.fire({
      title: "Removing Notification",
      text: `Are you sure?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      const ids = [notif?._id];

      if (isConfirmed) {
        mutateAsync(ids, {
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
        });
      }
    });
  };

  return (
    <Fragment key={notif?._id}>
      <Stack
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "whitesmoke",
          },
          p: 2,
          bgcolor: notif?.active ? "#fabb7f10" : null,
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

        <Stack direction="row" justifyContent="flex-end">
          <Typography
            color="secondary.main"
            p={1}
            fontSize={10}
            textAlign="right"
          >
            {moment(notif?.createdAt).fromNow()}
          </Typography>
          <IconButton size='small' onClick={handleMarkAsRead}>
            <MarkChatReadIcon />
          </IconButton>
          <IconButton size='small' onClick={handleRemoveNotification}>
            <Delete />
          </IconButton>
        </Stack>
      </Stack>
      <Divider flexItem />
      {(isLoading || readIsLoading) && <GlobalSpinner />}
    </Fragment>
  );
}

export default NotificationItem;
