import { useState } from "react";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  Alert,
  Button,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  AccessTime as AccessTimeIcon,
  MoreVert,
  Visibility,
  DeleteOutline,
} from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import CustomTotal from "../../components/custom/CustomTotal";
import CustomTitle from "../../components/custom/CustomTitle";
import { getAllMeters, deleteMeter } from "../../api/meterAPI";
import { useAuth } from "../../context/providers/AuthProvider";
import { useCustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import MeterDetailsDialog from "./MeterDetailsDialog";
import CustomizedMaterialTable from "@/components/tables/CustomizedMaterialTable";
import { METERS_COLUMNS } from "@/mocks/columns";

function Meters() {
  const theme = useTheme();
  const { user } = useAuth();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch meters
  const {
    data: meters = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["meters"],
    queryFn: () => getAllMeters(),
    enabled: !!user?.id,
    initialData: [],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMeter,
    onSuccess: (data) => {
      customDispatch(
        globalAlertType("success", data || "Meter removed successfully"),
      );
      queryClient.invalidateQueries({ queryKey: ["meters"] });
    },
    onError: (error) => {
      customDispatch(
        globalAlertType("error", error.message || "Failed to delete meter"),
      );
    },
  });

  // Handlers for dropdown menu
  const handleMenuOpen = (event, meter) => {
    setAnchorEl(event.currentTarget);
    setSelectedMeter(meter);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (!selectedMeter) return;
    Swal.fire({
      title: "Delete Meter",
      text: `Are you sure you want to remove meter ${selectedMeter.number}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(selectedMeter.id);
        handleMenuClose();
      }
    });
  };

  // Loading state – skeleton rows
  if (isLoading) {
    return (
      <>
        <CustomTitle
          title="Prepaid Meter"
          subtitle="Keep track of prepaid meters available on your system at every time!"
          icon={
            <AccessTimeIcon sx={{ width: 50, height: 50 }} color="primary" />
          }
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <CustomTotal title="meters" total="..." />
        </Stack>
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ borderRadius: 1.2 }}
        >
          <Table>
            <TableHead
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}
            >
              <TableRow>
                <TableCell>Meter</TableCell>
                <TableCell>Provider / Type</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Skeleton variant="text" width={120} height={20} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Skeleton variant="text" width={100} height={20} />
                      <Skeleton variant="text" width={60} height={16} />
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="text" width={140} height={20} />
                  </TableCell>
                  <TableCell>
                    <Skeleton variant="rounded" width={60} height={24} />
                  </TableCell>
                  <TableCell align="right">
                    <Skeleton variant="circular" width={32} height={32} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    );
  }

  // Error state
  if (isError) {
    return (
      <>
        <CustomTitle
          title="Prepaid Meter"
          subtitle="Keep track of prepaid meters available on your system at every time!"
          icon={
            <AccessTimeIcon sx={{ width: 50, height: 50 }} color="primary" />
          }
        />
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 1.2 }}>
          <Alert
            severity="error"
            variant="outlined"
            sx={{ borderRadius: 1.2 }}
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                Retry
              </Button>
            }
          >
            {error?.message || "Failed to load meters. Please try again."}
          </Alert>
        </Paper>
      </>
    );
  }

  const columns = [
    ...METERS_COLUMNS,
    {
      title: "Action",
      field: "action",
      render: (meter) => (
        <Tooltip title="Actions">
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, meter)}
            disabled={deleteMutation.isLoading}
            sx={{
              borderRadius: 1,
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <CustomTitle
        title="Prepaid Meter"
        subtitle="Keep track of prepaid meters available on your system at every time!"
        icon={<AccessTimeIcon sx={{ width: 50, height: 50 }} color="primary" />}
      />

      <CustomizedMaterialTable
        title="Available Meters"
        subtitle="This list contains all the meters on available"
        emptyMessage="No Meter found"
        search
        isLoading={isLoading}
        columns={columns}
        data={meters}
        showExportButton={true}
        onRefresh={refetch}
        autocompleteComponent={
          <Stack
            width="100%"
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "left", md: "center" }}
            spacing={2}
            mb={2}
          >
            <CustomTotal title="meters" total={meters?.data?.length} />
          </Stack>
        }
      />

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            borderRadius: 1.2,
            minWidth: 160,
            "& .MuiMenuItem-root": {
              fontSize: "0.875rem",
              px: 2,
              py: 1,
              gap: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Visibility fontSize="small" color="info" />
          View Details
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          sx={{ color: theme.palette.error.main }}
        >
          <DeleteOutline fontSize="small" color="error" />
          Delete
        </MenuItem>
      </Menu>

      {/* Meter Details Dialog */}
      <MeterDetailsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        meter={selectedMeter}
      />
    </>
  );
}

export default Meters;

// import { Stack } from "@mui/material";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import CustomizedMaterialTable from "../../components/tables/CustomizedMaterialTable";
// import { METERS_COLUMNS } from "../../mocks/columns";
// import { useQuery } from "@tanstack/react-query";
// import CustomTotal from "../../components/custom/CustomTotal";
// import CustomTitle from "../../components/custom/CustomTitle";
// import { getAllMeters } from "../../api/meterAPI";

// import { useAuth } from "../../context/providers/AuthProvider";

// function Meters() {
//   const { user } = useAuth();

//   const meters = useQuery({
//     queryKey: ["meters"],
//     queryFn: () => getAllMeters(),
//     enabled: !!user?.id,
//     initialData: [],
//   });

//   // console.log(meters.data)

//   return (
//     <>
//       <CustomTitle
//         title="Prepaid Meter"
//         subtitle="Keep track of prepaid meters available on your system at everytime!"
//         icon={<AccessTimeIcon sx={{ width: 50, height: 50 }} color="primary" />}
//       />
//       <CustomizedMaterialTable
//         title="Available Meters"
//         subtitle="This list contains all the meters on available"
//         emptyMessage="No Meter found"
//         search
//         isLoading={meters.isLoading}
//         columns={METERS_COLUMNS}
//         data={meters.data}
//         showExportButton={true}
//         onRefresh={meters.refetch}
//         autocompleteComponent={
//           <Stack
//             width="100%"
//             direction={{ xs: "column", md: "row" }}
//             justifyContent="space-between"
//             alignItems={{ xs: "left", md: "center" }}
//             spacing={2}
//             mb={2}
//           >
//             <CustomTotal title="meters" total={meters?.data?.length} />
//           </Stack>
//         }
//       />
//     </>
//   );
// }

// export default Meters;
