import { useState } from "react";
import _ from "lodash";
import Swal from "sweetalert2";
import { ASSIGNED_TICKET_COLUMNS } from "../../mocks/columns";
import ListTable from "../../components/tables/ListTable";
import {
  getAssignedTicketByVerifier,
  removeAssignedTickets,
} from "../../api/ticketAPI";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconButton, Stack } from "@mui/material";
import { useCustomData } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { Delete } from "@mui/icons-material";

function VerifierAssignedTickets() {
  const { customDispatch } = useCustomData();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTickets, setSelectedTickets] = useState([]);

  const tickets = useQuery({
    queryKey: ["assigned-tickets", id],
    queryFn: () => getAssignedTicketByVerifier(id),
    enabled: !!id,
    initialData: [],
  });

  const handleSelectionChange = (rows) => {
    setSelectedTickets(rows);
  };

  const { mutateAsync, isLoading: isMultipleDeleteLoading } = useMutation({
    mutationFn: removeAssignedTickets,
  });

  const handleRemoveMultipleTickets = () => {
    Swal.fire({
      title: "Removing Tickets",
      text: `You are about to remove the selected tickets.Changes cannot be undone.`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      const tickets = _.map(selectedTickets, "_id");
      if (isConfirmed) {
        mutateAsync(
          { tickets },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["tickets"]);
            },
            onSuccess: () => {
              customDispatch(globalAlertType("info", "Tickets removed!"));
            },
            onError: () => {
              customDispatch(
                globalAlertType("error", "Failed removing tickets")
              );
            },
          }
        );
      }
    });
  };

  // view Assigned Tickets Details
  const handleViewAssignedTicket = ({ _id }) => {
    // console.log(_id);
    navigate(`/verifiers/${id}/ticket-details/${_id}`);
  };

  return (
    <ListTable
      isLoading={tickets.isLoading || isMultipleDeleteLoading}
      columns={ASSIGNED_TICKET_COLUMNS}
      data={tickets?.data}
      onSelectionChange={(rows) => handleSelectionChange(rows)}
      onRowClicked={handleViewAssignedTicket}
      headerComponent={
        <Stack
          p={2}
          width="100%"
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
        >
          {selectedTickets.length > 0 && (
            <IconButton
              color="error"
              size="large"
              onClick={handleRemoveMultipleTickets}
            >
              <Delete />
            </IconButton>
          )}
        </Stack>
      }
    />
  );
}

export default VerifierAssignedTickets;
