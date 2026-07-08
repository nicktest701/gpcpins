import { useContext, useMemo, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Button,
  Tooltip,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  MarkChatRead as MarkChatReadIcon,
  DeleteSweep as DeleteSweepIcon,
  NotificationsOffSharp,
  Search as SearchIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import moment from "moment";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/providers/AuthProvider";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import AnimatedContainer from "../../components/animations/AnimatedContainer";
import GlobalSpinner from "../../components/GlobalSpinner";
import {
  changeNotificationStatus,
  getAllBroadcastMessages,
  removeNotification,
} from "../../api/broadcastMessageAPI";

// Category options for filtering
const CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "ticket", label: "Ticket" },
  { value: "voucher", label: "Voucher" },
  { value: "prepaid", label: "Prepaid" },
  { value: "airtime", label: "Airtime" },
  { value: "bundle", label: "Bundle" },
  { value: "wallet", label: "Wallet" },
  { value: "general", label: "General" },
];

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const { notifications: notifs, customDispatch } = useCustomContext();
  const queryClient = useQueryClient();

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading: notificationsLoading,
    error: notificationsError,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getAllBroadcastMessages(),
    enabled: !!user?.id,
    initialData: notifs,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Memoized counts and filtered notifications
  const unreadCount = useMemo(() => {
    if (!notificationsData) return 0;
    return notificationsData.filter((item) => item?.active === 1).length;
  }, [notificationsData]);

  // Filter notifications based on search and category
  const filteredNotifications = useMemo(() => {
    if (!notificationsData) return [];

    let filtered = [...notificationsData];

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((notif) => {
        // Try to extract category from title (case-insensitive) or use notif.category if available
        const title = notif.title?.toLowerCase() || "";
        // Option 1: if there's a category field, use it
        // return notif.category?.toLowerCase() === categoryFilter;
        // Option 2: check if title contains the category keyword
        return title.includes(categoryFilter.toLowerCase());
      });
    }

    // Search filter (title and body)
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((notif) => {
        const titleMatch = notif.title?.toLowerCase().includes(query);
        const bodyMatch = notif.body?.toLowerCase().includes(query);
        return titleMatch || bodyMatch;
      });
    }

    return filtered;
  }, [notificationsData, categoryFilter, searchQuery]);

  // Mark all as read mutation
  const markAllMutation = useMutation({
    mutationFn: () => changeNotificationStatus(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      customDispatch(
        globalAlertType("success", "All notifications marked as read"),
      );
    },
    onError: (error) => {
      customDispatch(
        globalAlertType("error", error?.message || "Failed to mark as read"),
      );
    },
  });

  // Delete all notifications mutation
  const deleteAllMutation = useMutation({
    mutationFn: () => removeNotification(),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey:["notifications"]});
      customDispatch(globalAlertType("success", "All notifications deleted"));
    },
    onError: (error) => {
      customDispatch(
        globalAlertType(
          "error",
          error?.message || "Failed to delete notifications",
        ),
      );
    },
  });

  const handleMarkAsRead = () => {
    if (unreadCount === 0) return;
    Swal.fire({
      title: "Mark as read",
      text: `Mark all ${unreadCount} unread notifications as read?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark all",
    }).then((result) => {
      if (result.isConfirmed) {
        markAllMutation.mutate();
      }
    });
  };

  const handleDeleteAll = () => {
    if (!notificationsData?.length) return;
    Swal.fire({
      title: "Delete all notifications",
      text: "You are about to delete all notifications. This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete all",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAllMutation.mutate();
      }
    });
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Loading state
  if (notificationsLoading) {
    return (
      <AnimatedContainer>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </AnimatedContainer>
    );
  }

  // Error state
  if (notificationsError) {
    return (
      <AnimatedContainer>
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load notifications. Please try again later.
        </Alert>
      </AnimatedContainer>
    );
  }

  const notifications = notificationsData || [];

  return (
    <AnimatedContainer>
      <Paper elevation={0} sx={{ p: 2, bgcolor: "background.default" }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}
        >
          <Typography variant="h5" component="h1">
            Notifications
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Refresh notifications">
              <span>
                <IconButton color="secondary" onClick={refetchNotifications}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Mark all as read">
              <span>
                <IconButton
                  color="secondary"
                  disabled={unreadCount === 0}
                  onClick={handleMarkAsRead}
                >
                  <MarkChatReadIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Delete all notifications">
              <span>
                <IconButton
                  color="error"
                  disabled={notifications.length === 0}
                  onClick={handleDeleteAll}
                >
                  <DeleteSweepIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Filters Row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <TextField
            size="small"
            placeholder="Search by title or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ flex: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClearSearch}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              You have {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}.
            </Typography>
          </Box>
        )}

        {/* Results count */}
        {filteredNotifications.length === 0 &&
          (searchQuery || categoryFilter !== "all") && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No notifications match your filters. Try adjusting your search
                or category.
              </Typography>
            </Box>
          )}

        {/* Notifications list */}
        {filteredNotifications.length === 0 ? (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
            <NotificationsOffSharp
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary">
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We&apos;ll let you know when something new arrives.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={1}>
            {filteredNotifications.map((notif) => (
              <Paper
                key={notif.id}
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor:
                    notif?.active === 1 ? "action.hover" : "background.paper",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "action.selected",
                  },
                  borderRadius: 2,
                }}
              >
                <Stack spacing={1}>
                  {/* Title */}
                  <Typography
                    variant="subtitle1"
                    fontWeight={notif?.active === 1 ? "bold" : "normal"}
                  >
                    {notif?.title}
                  </Typography>

                  {/* Message body */}
                  {notif?.type === "Email" ? (
                    <Box
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(notif?.body),
                      }}
                      sx={{
                        "& p": { m: 0, fontSize: "0.875rem" },
                        "& a": { color: "primary.main" },
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      {notif?.body}
                    </Typography>
                  )}

                  {/* Download link if present */}
                  {notif?.link && (
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
                        textTransform: "none",
                      }}
                    >
                      Download
                    </Button>
                  )}

                  {/* Timestamp */}
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    sx={{ textAlign: "right" }}
                  >
                    {moment(notif?.createdAt).fromNow()}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      {/* Loading overlays for mutations */}
      {(markAllMutation.isPending || deleteAllMutation.isPending) && (
        <GlobalSpinner />
      )}
    </AnimatedContainer>
  );
};

export default Notifications;
