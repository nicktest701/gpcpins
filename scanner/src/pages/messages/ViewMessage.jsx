import {
  Dialog,
  DialogContent,
  ListItemText,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";

import Swal from "sweetalert2";
import moment from "moment/moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingButton } from "@mui/lab";
import { useCustomData } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import Active from "../../components/Active";
import {
  deleteBroadcastMessages,
  getBroadcastMessage,
} from "../../api/broadcastMessageAPI";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useSearchParams } from "react-router-dom";

function ViewMessage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { customDispatch } = useCustomData();

  const { data } = useQuery({
    queryKey: ["broadcast-messages", searchParams.get("message")],
    queryFn: () => getBroadcastMessage(searchParams.get("message")),
    enabled: !!searchParams.get("message"),
    initialData: queryClient
      .getQueryData(["broadcast-messages"])
      ?.find((message) => message?._id === searchParams.get("message")),
  });

  const { mutateAsync: deleteMutateAsync, isLoading: dLoading } = useMutation({
    mutationFn: deleteBroadcastMessages,
  });
  const handleDelete = () => {
    Swal.fire({
      title: "Removing Message",
      text: "Do you want to remove message?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMutateAsync(data?._id, {
          onSettled: () => {
            queryClient.invalidateQueries(["broadcast-messages"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            handleClose();
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("message");
      return params;
    });
  };

  return (
    <Dialog
      open={searchParams.get("message") !== null}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <CustomDialogTitle
        title="Message"
        subtitle="Details of sent message"
        onClose={handleClose}
      />

      <DialogContent>
        <Active
          active={data?.active === 1}
          activeMsg="Delivered"
          inActiveMsg="Not Delivered"
        />
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="flex-end"
          spacing={1}
        >
          {/* {user?.permissions?.includes("Delete messages") && ( */}
          <Tooltip title="Delete">
            <LoadingButton
              size="small"
              color="error"
              loading={dLoading}
              onClick={handleDelete}
            >
              Remove
            </LoadingButton>
          </Tooltip>
          {/* )} */}
          {/* {user?.permissions?.includes("Create new messages") && ( */}
          {/* <Tooltip title="Resend">
            <LoadingButton size="small" loading={isLoading} onClick={onSend}>
              Resend
            </LoadingButton>
          </Tooltip> */}
          {/* )} */}
        </Stack>
        <Divider />

        <Stack>
          <ListItemText
            primary="Date of Issue"
            secondary={moment(new Date(data?.createdAt)).format("Do MMMM YYYY")}
            primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
          />

          <Divider />
          <ListItemText
            primary="Title"
            secondary={data?.title}
            primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
          />

          <ListItemText
            primary="Message"
            secondary={data?.message}
            primaryTypographyProps={{ color: "primary", fontWeight: "bold" }}
          />
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default ViewMessage;
