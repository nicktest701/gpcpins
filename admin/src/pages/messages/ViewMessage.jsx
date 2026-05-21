import { useContext } from "react";
import {
  Dialog,
  DialogContent,
  Stack,
  Tooltip,
  Divider,
  Paper,
  Typography,
  Chip,
  Box,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  DeleteOutline,
  Send,
  Person,
  Message,
  Title,
  CalendarToday,
  Group,
  Info,
} from "@mui/icons-material";
import DOMPurify from "dompurify";
import Swal from "sweetalert2";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingButton } from "@mui/lab";
import { useSearchParams } from "react-router-dom";

import { CustomContext } from "@/context/providers/CustomProvider";
import { globalAlertType } from "@/components/alert/alertType";
import {
  deleteBroadcastMessages,
  getBroadcastMessage,
  resendBroadcastMessage,
} from "@/api/broadcastMessageAPI";
import CustomDialogTitle from "@/components/dialogs/CustomDialogTitle";
import { AuthContext } from "@/context/providers/AuthProvider";

const ViewMessage = () => {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useContext(CustomContext);

  const messageId = searchParams.get("message");

  // Fetch message data
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["broadcast-messages", messageId],
    queryFn: () => getBroadcastMessage(messageId),
    enabled: !!messageId,
    initialData: queryClient
      .getQueryData(["broadcast-messages"])
      ?.find((msg) => msg.id === messageId),
  });

  // Resend mutation
  const resendMutation = useMutation({
    mutationFn: resendBroadcastMessage,
    onSuccess: (res) => {
      customDispatch(globalAlertType("info", res));
      handleClose();
    },
    onError: (err) => customDispatch(globalAlertType("error", err)),
  });

  const handleResend = () => {
    if (!data) return;
    Swal.fire({
      title: "Resend Message",
      text: "Are you sure you want to resend this message?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, resend",
    }).then((result) => {
      if (result.isConfirmed) {
        resendMutation.mutate({
          id: data.id,
          type: data.type,
          recipient: data.recipient,
          body: data.body,
          createdAt: data.createdAt,
        });
      }
    });
  };

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBroadcastMessages,
    onSuccess: (res) => {
      customDispatch(globalAlertType("info", res));
      handleClose();
    },
    onError: (err) => customDispatch(globalAlertType("error", err)),
  });

  const handleDelete = () => {
    if (!data) return;
    Swal.fire({
      title: "Delete Message",
      text: "Are you sure you want to delete this message? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(data.id);
      }
    });
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("message");
      return params;
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Dialog open={!!messageId} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  // Error state
  if (isError || !data) {
    return (
      <Dialog open={!!messageId} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">
            {error?.message || "Failed to load message"}
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  // Parse group if applicable
  const groupList = data.recipient === "Group" && data.grouped ? JSON.parse(data.grouped) : [];

  // Determine delivery status
  const isDelivered = data.isDelivered;

  return (
    <Dialog
      open={!!messageId}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <CustomDialogTitle
        title="Message Details"
        subtitle="View full information about this broadcast message"
        onClose={handleClose}
      />

      <DialogContent>
        <Stack spacing={3} sx={{ py: 1 }}>
          {/* Status Chip and Action Buttons */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Chip
              label={isDelivered ? "Delivered" : "Not Delivered"}
              color={isDelivered ? "success" : "warning"}
              variant="outlined"
              icon={isDelivered ? <Info /> : <Info />}
            />
            <Stack direction="row" spacing={1}>
              {user?.permissions?.includes("Delete messages") && (
                <Tooltip title="Delete Message">
                  <LoadingButton
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={handleDelete}
                    loading={deleteMutation.isLoading}
                    startIcon={<DeleteOutline />}
                  >
                    Delete
                  </LoadingButton>
                </Tooltip>
              )}
                    {user?.permissions?.includes("Create new messages") && (
                <Tooltip title="Resend Message">
                  <LoadingButton
                    size="small"
                    // variant="contained"
                    onClick={handleResend}
                    loading={resendMutation.isLoading}
                    startIcon={<Send />}
                  >
                    Resend
                  </LoadingButton>
                </Tooltip>
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Message Details Grid */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarToday fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Date Sent:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {moment(data.createdAt).format("Do MMMM YYYY, h:mm A")}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Message fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Type:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {data.type}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Person fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Recipient:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {data.recipient}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Title fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Title:
                    </Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {data.title}
                    </Typography>
                  </Stack>
                  {data.recipient === "Group" && groupList.length > 0 && (
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <Group fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Groups:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {groupList.join(", ")}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Message Body */}
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Message Content
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {data.type === "SMS" ? (
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {data.body}
              </Typography>
            ) : (
              <Box
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(data.body),
                }}
                sx={{
                  "& p": { margin: 0 },
                  "& a": { color: "primary.main" },
                }}
              />
            )}
          </Paper>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default ViewMessage;


// import { useContext } from "react";
// import {
//   Dialog,
//   DialogContent,
//   ListItemText,
//   Stack,
//   Tooltip,
//   Divider,
// } from "@mui/material";

// import DOMPurify from "dompurify";
// import Swal from "sweetalert2";
// import moment from "moment/moment";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { LoadingButton } from "@mui/lab";
// import { CustomContext } from "@/context/providers/CustomProvider";
// import { globalAlertType } from "@/components/alert/alertType";
// import Active from "@/components/Active";
// import {
//   deleteBroadcastMessages,
//   getBroadcastMessage,
//   resendBroadcastMessage,
// } from "@/api/broadcastMessageAPI";
// import CustomDialogTitle from "@/components/dialogs/CustomDialogTitle";
// import { useSearchParams } from "react-router-dom";
// import { AuthContext } from "@/context/providers/AuthProvider";

// function ViewMessage() {
//   const { user } = useContext(AuthContext);
//   const queryClient = useQueryClient();
//   const [searchParams, setSearchParams] = useSearchParams();

//   const { customDispatch } = useContext(CustomContext);

//   const { data } = useQuery({
//     queryKey: ["broadcast-messages", searchParams.get("message")],
//     queryFn: () => getBroadcastMessage(searchParams.get("message")),
//     enabled: !!searchParams.get("message"),
//     initialData: queryClient
//       .getQueryData(["broadcast-messages"])
//       ?.find((message) => message?.id === searchParams.get("message")),
//   });

//   const { mutateAsync, isLoading } = useMutation({
//     mutationFn: resendBroadcastMessage,
//   });
//   const onSend = () => {
//     const message = {
//       id: data?.id,
//       type: data?.type,
//       recipient: data?.recipient,
//       body: data?.body,
//       createdAt: data?.createdAt,
//     };

    
//     Swal.fire({
//       title: "Resending Message",
//       text: "Proceed with resend?",
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         mutateAsync(message, {
//           onSettled: () => {
//             queryClient.invalidateQueries(["broadcast-messages"]);
//           },
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("info", data));
//             handleClose();
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   const { mutateAsync: deleteMutateAsync, isLoading: dLoading } = useMutation({
//     mutationFn: deleteBroadcastMessages,
//   });
//   const handleDelete = () => {
//     Swal.fire({
//       title: "Removing Message",
//       text: "Do you want to remove message?",
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         deleteMutateAsync(data?.id, {
//           onSettled: () => {
//             queryClient.invalidateQueries(["broadcast-messages"]);
//           },
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("info", data));
//             handleClose();
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   const handleClose = () => {
//     setSearchParams((params) => {
//       params.delete("message");
//       return params;
//     });
//   };

//   return (
//     <Dialog
//       open={searchParams.get("message") !== null}
//       onClose={handleClose}
//       maxWidth="md"
//       fullWidth
//     >
//       <CustomDialogTitle
//         title="Message"
//         subtitle="Details of sent message"
//         onClose={handleClose}
//       />

//       <DialogContent>
//         <Active
//           active={data?.isDelivered}
//           activeMsg="Delivered"
//           inActiveMsg="Not Delivered"
//         />
//         <Stack
//           direction="row"
//           justifyContent="flex-end"
//           alignItems="flex-end"
//           spacing={1}
//         >
//           {user?.permissions?.includes("Delete messages") && (
//             <Tooltip title="Delete">
//               <LoadingButton
//                 size="small"
//                 color="error"
//                 loading={dLoading}
//                 onClick={handleDelete}
//               >
//                 Remove
//               </LoadingButton>
//             </Tooltip>
//           )}
//           {user?.permissions?.includes("Create new messages") && (
//             <Tooltip title="Resend">
//               <LoadingButton size="small" loading={isLoading} onClick={onSend}>
//                 Resend
//               </LoadingButton>
//             </Tooltip>
//           )}
//         </Stack>
//         <Divider />

//         <Stack>
//           <ListItemText
//             primary="Date of Issue"
//             secondary={moment(new Date(data?.createdAt)).format("Do MMMM YYYY")}
//             primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
//           />
//           <Stack direction="row">
//             <ListItemText
//               primary="Type"
//               secondary={data?.type}
//               primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
//             />
//             <ListItemText
//               primary="Recipient"
//               secondary={data?.recipient}
//               primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
//             />
//           </Stack>
//           <Divider />
//           {data?.recipient === "Group" && (
//             <ListItemText
//               primary="Group"
//               secondary={JSON.parse(data?.grouped)?.join(" , ")}
//               primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
//             />
//           )}
//           <ListItemText
//             primary="Title"
//             secondary={data?.title}
//             primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
//           />
//           {data?.type === "SMS" ? (
//             <ListItemText
//               primary="Message"
//               secondary={data?.body}
//               primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
//             />
//           ) : (
//             <div
//               dangerouslySetInnerHTML={{
//                 __html: DOMPurify.sanitize(data?.body),
//               }}
//               style={{ width: "50ch" }}
//             ></div>
//           )}
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default ViewMessage;
