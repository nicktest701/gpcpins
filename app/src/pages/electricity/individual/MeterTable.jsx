// MeterTable.jsx
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Typography,
  IconButton,
  CircularProgress,
  Skeleton,
  Alert,
  Stack,
  Tooltip,
  Box,
  alpha,
  useTheme,
} from "@mui/material";
import { DeleteOutline, Visibility, ElectricBolt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { globalAlertType } from "../../../components/alert/alertType";
import { deleteMeter } from "../../../api/meterAPI";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import MeterDetailsDialog from "./MeterDetailsDialog"; // adjust path

const MeterTable = ({
  meters,
  loading = false,
  error = null,
  onRetry = () => {},
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomContext();
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMeter,
    onSuccess: (data) => {
      customDispatch(
        globalAlertType("info", data || "Meter removed successfully"),
      );
      queryClient.invalidateQueries({ queryKey: ["meter"] });
    },
    onError: (error) => {
      customDispatch(
        globalAlertType("error", error.message || "Failed to delete meter"),
      );
    },
  });

  const handleDelete = (meterId, meterNumber) => {
    Swal.fire({
      title: "Delete Meter",
      text: `Are you sure you want to remove meter ${meterNumber}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(meterId);
      }
    });
  };

  const handleRowClick = (meter) => {
    navigate(`/electricity/prepaid/${meter.number}/buy`, {
      state: {
        meterDetails: {
          number: meter.number,
          name: meter.name,
          address: meter.address,
          type: meter.type,
          provider_name: meter.provider_name,
        },
      },
    });
  };

  const openDetails = (meter) => {
    setSelectedMeter(meter);
    setDialogOpen(true);
  };

  const closeDetails = () => {
    setDialogOpen(false);
    setSelectedMeter(null);
  };

  // ---- Loading state ----
  if (loading) {
    return (
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{ borderRadius: 3, overflowX: "auto" }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell>Meter Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton variant="text" width={120} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="text" width={160} />
                </TableCell>
                <TableCell>
                  <Skeleton variant="rounded" width={80} height={24} />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // ---- Error state ----
  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
        <Alert
          severity="error"
          variant="outlined"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {error.message || "Failed to load meters."}
        </Alert>
      </Paper>
    );
  }

  // ---- Empty state ----
  if (!meters || meters.length === 0) {
    return (
      <Paper sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No meters found.</Typography>
      </Paper>
    );
  }

  // ---- Main render ----
  return (
    <>
      <TableContainer
        component={Paper}
        elevation={2}
        sx={{
          borderRadius: 3,
          overflowX: "auto",
          "& .MuiTableHead-root .MuiTableCell-root": {
            fontWeight: 700,
            color: theme.palette.text.secondary,
            letterSpacing: 0.5,
            borderBottom: `2px solid ${theme.palette.divider}`,
          },
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
            <TableRow>
              <TableCell>Meter Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {meters.map((meter) => {
              const isDeleting =
                deleteMutation.isPending &&
                deleteMutation.variables === meter.id;
              return (
                <TableRow
                  key={meter.id}
                  hover
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    },
                  }}
                  onClick={() => openDetails(meter)}
                >
                  <TableCell>
                    <Typography fontWeight="medium" variant="body2">
                      {meter.number}
                    </Typography>
                  </TableCell>
                  <TableCell>{meter.name || "—"}</TableCell>
                  <TableCell>
                    <Stack alignItems="start" spacing={0.5}>
                      <Chip
                        label={`${meter.type}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 500, textTransform: "capitalize" }}
                      />
                      {meter.provider_name && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          {meter.provider_name}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {/* View Button */}
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetails(meter);
                          }}
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.08),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.info.main, 0.16),
                            },
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Buy Button */}
                      <Tooltip title="Buy Units">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(meter);
                          }}
                          sx={{
                            bgcolor: alpha(theme.palette.secondary.main, 0.08),
                            "&:hover": {
                              bgcolor: alpha(
                                theme.palette.secondary.main,
                                0.16,
                              ),
                            },
                          }}
                        >
                          <ElectricBolt fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {/* Delete Button */}
                      <Tooltip title="Delete Meter">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(meter.id, meter.number);
                          }}
                          disabled={isDeleting}
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.08),
                            "&:hover": {
                              bgcolor: alpha(theme.palette.error.main, 0.16),
                            },
                          }}
                        >
                          {isDeleting ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <DeleteOutline fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <MeterDetailsDialog
        open={dialogOpen}
        onClose={closeDetails}
        meter={selectedMeter}
      />
    </>
  );
};

export default MeterTable;

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Paper,
//   Button,
//   Chip,
//   Typography,
//   IconButton,
//   CircularProgress,
// } from "@mui/material";
// import { DeleteOutline } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import Swal from "sweetalert2";
// import { globalAlertType } from "../../../components/alert/alertType";
// import { deleteMeter } from "../../../api/meterAPI";
// import { useCustomContext } from "../../../context/providers/CustomProvider";

// const MeterTable = ({ meters }) => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const { customDispatch } = useCustomContext();

//   // Delete mutation
//   const deleteMutation = useMutation({
//     mutationFn: deleteMeter,
//     onSuccess: (data) => {
//       customDispatch(globalAlertType("info", data || "Meter removed successfully"));
//       // Invalidate meters query to refresh the list
//       queryClient.invalidateQueries({ queryKey: ["meter"] });
//     },
//     onError: (error) => {
//       customDispatch(globalAlertType("error", error.message || "Failed to delete meter"));
//     },
//   });

//   const handleDelete = (meterId, meterNumber) => {
//     Swal.fire({
//       title: "Delete Meter",
//       text: `Are you sure you want to remove meter ${meterNumber}?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#6c757d",
//       confirmButtonText: "Yes, delete",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         deleteMutation.mutate(meterId);
//       }
//     });
//   };

//   const handleRowClick = (meter) => {
//     navigate(`/electricity/prepaid/${meter.number}/buy`, {
//       state: {
//         meterDetails: {
//           number: meter.number,
//           name: meter.name,
//           address: meter.address,
//           spn: meter.spn,
//         },
//       },
//     });
//   };

//   // console.log(meters)

//   return (
//     <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflowX: "auto" }}>
//       <Table>
//         <TableHead sx={{ bgcolor: "grey.100" }}>
//           <TableRow>
//             <TableCell>Meter Number</TableCell>
//             <TableCell>Name</TableCell>
//             <TableCell>Type</TableCell>
//             <TableCell align="center">Action</TableCell>
//             <TableCell align="center">Delete</TableCell>
//           </TableRow>
//         </TableHead>
//         <TableBody>
//           {meters.map((meter) => {
//             const isDeleting = deleteMutation.isPending && deleteMutation.variables === meter.id;
//             return (
//               <TableRow
//                 key={meter.id}
//                 hover
//                 sx={{ cursor: "pointer" }}
//                 onClick={() => handleRowClick(meter)}
//               >
//                 <TableCell>
//                   <Typography fontWeight="medium">{meter.number}</Typography>
//                 </TableCell>
//                 <TableCell>{meter.name || "—"}</TableCell>
//                 <TableCell>
//                   <Chip
//                     label={`${meter.type} (IMES)`}
//                     size="small"
//                     color="primary"
//                     variant="outlined"
//                   />
//                   {meter.provider_name || "—"}
//                 </TableCell>
//                 <TableCell align="center">
//                   <Button
//                     variant="outlined"
//                     size="small"
//                     color="secondary"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleRowClick(meter);
//                     }}
//                   >
//                     Buy Prepaid
//                   </Button>
//                 </TableCell>
//                 <TableCell align="center">
//                   <IconButton
//                     size="small"
//                     color="error"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDelete(meter.id, meter.number);
//                     }}
//                     disabled={isDeleting}
//                   >
//                     {isDeleting ? (
//                       <CircularProgress size={20} color="inherit" />
//                     ) : (
//                       <DeleteOutline fontSize="small" />
//                     )}
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             );
//           })}
//         </TableBody>
//       </Table>
//     </TableContainer>
//   );
// };

// export default MeterTable;
