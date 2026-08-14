import { useState } from "react";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Button,
  Chip,

  CircularProgress,
  Box,
} from "@mui/material";
import { Add, Edit, Delete, LockOpen } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRoles, deleteRole } from "@/api/roleAPI";
import { useCustomContext } from "@/context/providers/CustomProvider";
import { globalAlertType } from "@/components/alert/alertType";
import CreateRoleModal from "@/components/modals/CreateRoleModal";
import RoleDetail from "./RoleDetail";
import CustomTitle from "@/components/custom/CustomTitle";

const RolesList = () => {
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: roles = [], isLoading, refetch } = useQuery({
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
    // Use Swal for confirmation (optional)
    // For simplicity, we'll use a confirm dialog via the alert system or built-in
    if (window.confirm(`Are you sure you want to delete role "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleViewDetail = (role) => {
    setSelectedRole(role);
    setDetailOpen(true);
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <CustomTitle title="Roles & Permissions" subtitle="Manage access control for your team" />
      <Box mb={2}>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          New Role
        </Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Permissions</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <strong>{role.name}</strong>
                  </TableCell>
                  <TableCell>{role.description || "—"}</TableCell>
                  <TableCell>
                    {role.permissions?.slice(0, 3).map((p) => (
                      <Chip key={p.id} label={p.name} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                    ))}
                    {role.permissions?.length > 3 && `+${role.permissions.length - 3} more`}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Manage Permissions">
                      <IconButton onClick={() => handleViewDetail(role)}>
                        <LockOpen />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleViewDetail(role)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(role.id, role.name)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CreateRoleModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <RoleDetail open={detailOpen} onClose={() => setDetailOpen(false)} role={selectedRole} />
    </Container>
  );
};
export default RolesList;