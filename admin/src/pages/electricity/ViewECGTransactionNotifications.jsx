import { useContext } from "react";
import { CustomContext } from "../../context/providers/CustomProvider";
import {
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Swal from "sweetalert2";
import moment from "moment";
import _ from "lodash";
import {
  deleteNotifications,
  getAllNotifications,
  updateNotification,
} from "../../api/notificationAPI";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Delete, NotificationsRounded, Star } from "@mui/icons-material";
import { globalAlertType } from "../../components/alert/alertType";

import CustomTitle from "../../components/custom/CustomTitle";

function ViewECGTransactionNotifications() {
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const notifications = useQuery({
    queryKey: ["prepaid-notifications"],
    queryFn: () => getAllNotifications("Prepaid Units"),
    initialData: [],
  });

  const handleUnreadNotifications = async (id) => {
    await updateNotification([id]);
    queryClient.invalidateQueries(["prepaid-notifications"]);
  };

  //Delete all notifications
  const { mutateAsync: deleteAllMutateAsync } = useMutation({
    mutationFn: deleteNotifications,
  });

  const handleDeleteNotifications = (id) => {
    let all = [];

    if (id) {
      all = [id];
    } else {
      all = _.map(notifications.data, "_id");
    }

    Swal.fire({
      title: "Removing notification",
      text: `Do you want to remove ${all ? "all" : ""} notification?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteAllMutateAsync(
          { id, all },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["prepaid-notifications"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
            },
            onError: (error) => {
              customDispatch(globalAlertType("error", error));
            },
          }
        );
      }
    });
  };

  return (
    <Container>
      <Link to="/electricity/transactions?YixHy=a34cdd3543&_pid=423423">
        <IconButton>
          <ArrowBack />
        </IconButton>
      </Link>
      <CustomTitle
        title="Prepaid Notifications"
        subtitle="View all request made by customers"
      />

      <Stack width="100%" p={2}>
        <Button
          endIcon={<Delete />}
          color="error"
          sx={{ alignSelf: "flex-end" }}
          onClick={() => handleDeleteNotifications()}
          disabled={notifications?.data?.length === 0}
        >
          Remove all
        </Button>
      </Stack>

      <Box sx={{ bgcolor: "#fff", p: 4 }}>
        <List sx={{ maxHeight: "60svh", overflow: "auto", py: 4 }}>
          {notifications?.data?.length > 0 ? (
            notifications?.data?.map(({ _id, message, active, createdAt }) => {
              return (
                <ListItem
                  key={_id}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "whitesmoke",
                    },
                    p: 1,
                    bgcolor: active ? "#fabb7f30" : null,
                  }}
                  divider
                >
                  <ListItemAvatar>
                    <Avatar
                      color="#fff"
                      sx={{
                        bgcolor: "info.main",
                        height: 30,
                        width: 30,
                      }}
                    >
                      P
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    onClick={() => handleUnreadNotifications(_id)}
                    primary={message}
                    primaryTypographyProps={{ fontSize: 14 }}
                    secondary={moment(createdAt).format("LLL")}
                    secondaryTypographyProps={{
                      color: "secondary",
                      fontStyle: "italic",
                      fontSize: 12,
                      // textAlign: "right",
                    }}
                  />

                  <ListItemSecondaryAction>
                    <Stack spacing={2}>
                      <IconButton
                        onClick={() => handleDeleteNotifications(_id)}
                      >
                        <Delete />
                      </IconButton>
                      {active ? (
                        // <Chip size='small' label='new' color='error' />
                        <Star fontSize="12" sx={{ color: "error.light" }} />
                      ) : null}
                    </Stack>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          ) : (
            <Stack justifyContent="center" alignItems="center">
              <NotificationsRounded />
              <Typography textAlign="center">
                No Notifications Available
              </Typography>
            </Stack>
          )}
        </List>
      </Box>
    </Container>
  );
}

export default ViewECGTransactionNotifications;
