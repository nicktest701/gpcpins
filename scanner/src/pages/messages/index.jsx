import { useState } from "react";
import { Button,Container, MenuItem } from "@mui/material";
import CustomTitle from "../../components/custom/CustomTitle";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import Swal from "sweetalert2";
import _ from "lodash";
import { AddRounded, Message, MessageOutlined } from "@mui/icons-material";
import AddMessage from "./AddMessage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteBroadcastMessages,
  getAllBroadcastMessages,
  deleteSelectedBroadcastMessages,
} from "../../api/broadcastMessageAPI";
import PayLoading from "../../components/PayLoading";
import { BROADCAST_MESSAGES_COLUMNS } from "../../mocks/columns";
import ActionMenu from "../../components/menu/ActionMenu";
import { useCustomData } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import ViewMessage from "./ViewMessage";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/providers/AuthProvider";

function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { customDispatch } = useCustomData();
  const [openMessage, setOpenMessage] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);

  const messages = useQuery({
    queryKey: ["broadcast-messages"],
    queryFn: () => getAllBroadcastMessages(),
  });

  //Delete Message

  const { mutateAsync } = useMutation({
    mutationFn: deleteBroadcastMessages,
  });
  const handleRemoveMessage = (id) => {
    Swal.fire({
      title: "Removing",
      text: "Do you want to remove message?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(id, {
          onSettled: () => {
            queryClient.invalidateQueries(["broadcast-messages"]);
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

  const handleViewMessage = ({ _id }) => {
    setSearchParams((params) => {
      params.set("message", _id);
      return params;
    });
  };

  const handleSelectionChange = (rows) => {
    setSelectedMessages(rows);
  };

  const { mutateAsync: removeAllMutateAsync, isLoading } = useMutation({
    mutationFn: deleteSelectedBroadcastMessages,
  });

  const handleAllRemoveMessages = () => {
    Swal.fire({
      title: "Removing Messages",
      text: `You are about to remove the selected messages.Changes cannot be undone.`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      const messages = _.map(selectedMessages, "_id");
      if (isConfirmed) {
        removeAllMutateAsync(
          { messages },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["broadcast-messages"]);
            },
            onSuccess: () => {
              customDispatch(globalAlertType("info", "Messages removed!"));
            },
            onError: () => {
              customDispatch(
                globalAlertType("error", "Failed removing messages")
              );
            },
          }
        );
      }
    });
  };

  const columns = [
    ...BROADCAST_MESSAGES_COLUMNS,
    {
      field: "",
      title: "Action",
      export: false,
      width: 40,
      render: (rowData) => (
        <ActionMenu>
          <MenuItem onClick={() => handleViewMessage(rowData)}>
            View Message
          </MenuItem>
          {user?.permissions?.includes("Delete messages") && (
            <MenuItem onClick={() => handleRemoveMessage(rowData?._id)}>
              Delete
            </MenuItem>
          )}
        </ActionMenu>
      ),
    },
  ];

  if (messages.isLoading) {
    return <PayLoading />;
  }

  return (
    <Container>
      <CustomTitle
        title="Messages"
        subtitle="Broadcast messages to keep them up to date with the latest information."
        icon={<Message sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <CustomizedMaterialTable
        isLoading={messages.isLoading || isLoading}
        title="Broadcast Messages"
        columns={columns}
        data={messages?.data}
        emptyMessage="No Messages available"
        icon={
          <MessageOutlined sx={{ width: 40, height: 40 }} color="primary" />
        }
        autocompleteComponent={
          <>
            {/* {user?.permissions?.includes("Create new messages") && ( */}
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => setOpenMessage(true)}
            >
              New Message
            </Button>
            {/* )} */}
          </>
        }
        search
        options={{
          selection: true,
          exportAllData: true,
          exportButton: user?.permissions?.includes("Export messages"),
        }}
        onSelectionChange={handleSelectionChange}
        onDeleteAll={handleAllRemoveMessages}
      />

      <AddMessage open={openMessage} setOpen={setOpenMessage} />
      <ViewMessage />
    </Container>
  );
}

export default Messages;
