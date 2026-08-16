import { useState } from "react";
import {
  Container,
  IconButton,
  Tooltip,
  Button,
  Chip,
  Box,
  Stack,
  CircularProgress,
} from "@mui/material";
import { Add, Edit, Delete, LockOpen } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { getRoles, deleteRole } from "@/api/roleAPI";
import { useCustomContext } from "@/context/providers/CustomProvider";
import { globalAlertType } from "@/components/alert/alertType";
import CreateRoleModal from "@/components/modals/CreateRoleModal";
import RoleDetail from "./RoleDetail";
import CustomTitle from "@/components/custom/CustomTitle";
import { DataTable } from "@/components/tables/datatable";

const RolesList = () => {
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  // DataTable is controlled regardless of mode — in "client" mode it just
  // paginates/sorts `data` locally using this state instead of refetching.
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sort, setSort] = useState({ field: "name", direction: "asc" });

  const {
    data: roles = [],
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      customDispatch(globalAlertType("success", "Role deleted successfully"));
      queryClient.invalidateQueries(["roles"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error.message || "Delete failed"));
    },
  });

  const handleDelete = (id, name) => {
    if (name === "super_admin") {
      customDispatch(globalAlertType("error", "Cannot delete super_admin role"));
      return;
    }
    Swal.fire({
      title: "Delete role",
      text: `Are you sure you want to delete the "${name}" role? This can't be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#d32f2f",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) deleteMutation.mutate(id);
    });
  };

  const handleViewDetail = (role) => {
    setSelectedRole(role);
    setDetailOpen(true);
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
      renderCell: (row) => <strong>{row.name}</strong>,
    },
    {
      field: "description",
      headerName: "Description",
      renderCell: (row) => row.description || "—",
    },
    {
      field: "permissions",
      headerName: "Permissions",
      sortable: false,
      renderCell: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
          {row.permissions?.slice(0, 3).map((p) => (
            <Chip key={p.id} label={p.name} size="small" />
          ))}
          {row.permissions?.length > 3 && (
            <Chip
              label={`+${row.permissions.length - 3} more`}
              size="small"
              variant="outlined"
              onClick={() => handleViewDetail(row)}
            />
          )}
        </Stack>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      hideable: false,
      align: "right",
      renderCell: (row) => {
        const isSuperAdmin = row.name === "super_admin";
        const isDeletingThisRow =
          deleteMutation.isLoading && deleteMutation.variables === row.id;

        return (
          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
            <Tooltip title="Manage permissions">
              <IconButton size="small" onClick={() => handleViewDetail(row)}>
                <LockOpen fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit role">
              <IconButton size="small" onClick={() => handleViewDetail(row)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            {/* Tooltip needs the extra <span> to still fire while the
                button underneath is disabled — MUI won't forward hover
                events to a disabled IconButton on its own. */}
            <Tooltip
              title={
                isSuperAdmin
                  ? "The super_admin role can't be deleted"
                  : "Delete role"
              }
            >
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={isSuperAdmin || isDeletingThisRow}
                  onClick={() => handleDelete(row.id, row.name)}
                >
                  {isDeletingThisRow ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Delete fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        );
      },
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CustomTitle title="Roles & Permissions" subtitle="Manage access control for your team" />

      <Box mb={2}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          New Role
        </Button>
      </Box>

      <DataTable
        mode="client"
        columns={columns}
        data={roles}
        getRowId={(row) => row.id}
        loading={isLoading}
        fetching={isFetching}
        error={isError ? { message: "Couldn't load roles." } : null}
        onRetry={refetch}
        onRefresh={refetch}
        searchable
        searchPlaceholder="Search roles…"
        sort={sort}
        onSortChange={setSort}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(newLimit) => {
          setRowsPerPage(newLimit);
          setPage(1);
        }}
        emptyState={{
          title: "No roles yet",
          description: "Create your first role to start managing permissions.",
        }}
      />

      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <RoleDetail open={detailOpen} onClose={() => setDetailOpen(false)} role={selectedRole} />
    </Container>
  );
};

export default RolesList;