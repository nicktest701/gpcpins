import Swal from "sweetalert2";
import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
import { TICKETS_COLUMNS } from "../../mocks/columns";
import ActionMenu from "../../components/menu/ActionMenu";
import { MenuItem } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enableOrDisableTicket,
  getAllAssignedTickets,
} from "../../api/ticketAPI";
import { useNavigate } from "react-router-dom";
import { globalAlertType } from "../../components/alert/alertType";
import { useCustomData } from "../../context/providers/CustomProvider";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";
import Active from "../../components/Active";

function AllTickets() {
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomData()
  const navigate = useNavigate();

  const tickets = useQuery({
    queryKey: ["all-assigned-tickets"],
    queryFn: () => getAllAssignedTickets(),
  });

  const handleOpenTicketDetails = (category, id) => {
    navigate(`/evoucher/${category}/${id}`);
  };

  const {
    mutateAsync: toggleUserTicketMutateAsync,
    isLoading: toggleUserIsLoading,
  } = useMutation({
    mutationFn: enableOrDisableTicket,
  });
  function handleToggleUserTicket({ _id, active }) {
    Swal.fire({
      title: active ? "Disabling Ticket" : "Enabling ticket",
      text: active
        ? "Verifiers assigned to this ticket will not be able to see it.Do you want to disable ticket?"
        : "Do you want to enable ticket?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        toggleUserTicketMutateAsync(
          { id: _id, active: !active },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["all-assigned-tickets"]);
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
  }

  const columns = [
    ...TICKETS_COLUMNS,
    {
      title: "Status",
      field: "active",
      render: ({ _id, active }) => (
        <Active
          handleOnClick={() => handleToggleUserTicket({ _id, active })}
          active={active}
        />
      ),
    },
    {
      field: "",
      title: "Action",
      export: false,
      width: 40,
      render: ({ _id, categoryType, categoryId, active }) => (
        <ActionMenu>
          <MenuItem
            onClick={() => handleOpenTicketDetails(categoryType, categoryId)}
          >
            View Details
          </MenuItem>
          <MenuItem onClick={() => handleToggleUserTicket({ _id, active })}>
            {active ? " Disable Ticket" : "Activate Ticket"}
          </MenuItem>
        </ActionMenu>
      ),
    },
  ];

  return (
    <div>
      <CustomizedMaterialTable
        title="Tickets"
        isLoading={tickets.isLoading}
        onRefresh={tickets.refetch}
        columns={columns}
        data={tickets?.data}
        search={true}
        options={{
          search: true,
        }}
      />
      {toggleUserIsLoading && <GlobalSpinner />}
    </div>
  );
}

export default AllTickets;
