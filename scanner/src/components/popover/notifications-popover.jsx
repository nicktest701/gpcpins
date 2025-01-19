import { useContext, useState } from "react";
import PropTypes from "prop-types";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import Badge from "@mui/material/Badge";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemButton from "@mui/material/ListItemButton";
import moment from "moment";

import { LockClockOutlined, NotificationsSharp } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllNotifications } from "../../api/notificationAPI";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useNavigate } from "react-router-dom";
import chatSvg from "../../assets/images/ic_notification_chat.svg";

// import Iconify from "src/components/iconify";
// import Scrollbar from "src/components/scrollbar";

// ----------------------------------------------------------------------

export default function NotificationsPopover() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getAllNotifications(),
    enabled: !!user?.id,
    initial: [],
  });

  const [open, setOpen] = useState(null);

  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = () => {
    setOpen(null);
  };

  const handleNavigate = () => {
    navigate("/notifications");
    handleClose();
  };

  if (notifications?.isLoading) return null;

  const totalUnRead = notifications?.data?.filter(
    (item) => item.active === 1
  ).length;

  return (
    <>
      <IconButton color={open ? "primary" : "default"} onClick={handleOpen}>
        <Badge badgeContent={totalUnRead} color="error">
          {/* <Iconify width={24} icon="solar:bell-bing-bold-duotone" /> */}
          <NotificationsSharp />
        </Badge>
      </IconButton>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1.5,
              ml: 0.75,
              width: 360,
            },
          },
        }}
        sx={{
          height: 500,
          overflowY: "auto",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", py: 2, px: 2.5 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">Notifications</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              You have {totalUnRead} unread messages
            </Typography>
          </Box>

          {/* {totalUnRead > 0 && (
            <Tooltip title=" Mark all as read">
              <IconButton color="primary" onClick={handleMarkAllAsRead}>
                <MarkAsUnread />
              </IconButton>
            </Tooltip>
          )} */}
        </Box>

        <Divider sx={{ borderStyle: "dashed" }} />

        {/* <Scrollbar sx={{ height: { xs: 340, sm: "auto" } }}> */}
        <List
          disablePadding
          subheader={
            <ListSubheader
              // disableSticky
              sx={{
                py: 1,
                px: 2.5,
                typography: "overline",
              }}
            >
              New
            </ListSubheader>
          }
        >
          {notifications?.data?.slice(0, 2).map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              handleClose={handleClose}
            />
          ))}
        </List>

        <List
          disablePadding
          subheader={
            <ListSubheader
              disableSticky
              sx={{ py: 1, px: 2.5, typography: "overline" }}
            >
              Before that
            </ListSubheader>
          }
        >
          {notifications?.data?.slice(2, 5).map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </List>
        {/* </Scrollbar> */}

        <Divider sx={{ borderStyle: "dashed" }} />

        <Box sx={{ p: 1 }}>
          <Button fullWidth disableRipple onClick={handleNavigate}>
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
}

// ----------------------------------------------------------------------

NotificationItem.propTypes = {
  notification: PropTypes.shape({
    createdAt: PropTypes.instanceOf(Date),
    id: PropTypes.string,
    isUnRead: PropTypes.bool,
    title: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    avatar: PropTypes.any,
  }),
};

function NotificationItem({ notification, handleClose }) {
  const { avatar, title } = renderContent(notification);
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/notifications");
    handleClose();
  };

  return (
    <ListItemButton
      sx={{
        py: 1.5,
        px: 2.5,
        mt: "1px",
        ...(notification.active === 1 && {
          bgcolor: "#fabb7f10",
          // bgcolor: "action.selected",
        }),
      }}
      onClick={handleNavigate}
    >
      <ListItemAvatar>
        <Avatar sx={{ bgcolor: "background.neutral" }}>{avatar}</Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={title}
        secondary={
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "flex",
              alignItems: "center",
              color: "primary",
            }}
          >
            <LockClockOutlined sx={{ mr: 0.5, width: 16, height: 16 }} />

            {moment(notification?.createdAt).fromNow()}
          </Typography>
        }
      />
    </ListItemButton>
  );
}

// ----------------------------------------------------------------------

function renderContent(notification) {
  const title = (
    <Typography
      variant="subtitle2"
      sx={{
        overflow: "hidden", // Ensures the text doesn't overflow the container
        textOverflow: "ellipsis", // Adds the ellipsis to the truncated text
        display: "-webkit-box", // Use a flexbox model with block-level boxes
        WebkitBoxOrient: "vertical", // Ensures that the flexbox layout is vertical          // Hides any text that overflows the container
        WebkitLineClamp: 1,
      }}
    >
      {notification.title}
      <Typography
        component="span"
        variant="body2"
        sx={{
          color: "text.secondary",
          overflow: "hidden", // Ensures the text doesn't overflow the container
          textOverflow: "ellipsis", // Adds the ellipsis to the truncated text
          display: "-webkit-box", // Use a flexbox model with block-level boxes
          WebkitBoxOrient: "vertical", // Ensures that the flexbox layout is vertical          // Hides any text that overflows the container
          WebkitLineClamp: 3,
        }}
      >
        &nbsp; {notification.message}
      </Typography>
    </Typography>
  );

  if (notification.type === "order_placed") {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="/icons/ic_notification_package.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === "order_shipped") {
    return {
      avatar: (
        <img
          alt={notification.title}
          src="/icons/ic_notification_shipping.svg"
        />
      ),
      title,
    };
  }
  if (notification.type === "mail") {
    return {
      avatar: (
        <img alt={notification.title} src="/icons/ic_notification_mail.svg" />
      ),
      title,
    };
  }
  if (notification.type === "chat_message") {
    return {
      avatar: (
        <img alt={notification.title} src="/icons/ic_notification_chat.svg" />
      ),
      title,
    };
  }
  return {
    avatar: <img alt={notification.title} src={chatSvg} />,
    title,
  };
  // return {
  //   avatar: notification.avatar ? (
  //     <img alt={notification.title} src={notification.avatar} />
  //   ) : null,
  //   title,
  // };
}
