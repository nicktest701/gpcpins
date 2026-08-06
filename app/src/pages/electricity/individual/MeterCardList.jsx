// MeterCardList.jsx
import { useState } from "react";
import {
  List,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
  Skeleton,
  Alert,
  Box,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import { DeleteOutline, Visibility, ElectricBolt } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { deleteMeter } from "../../../api/meterAPI";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";
import MeterDetailsDialog from "./MeterDetailsDialog"; // adjust path

const MeterCardList = ({ meters, loading = false, error = null, onRetry = () => {} }) => {
  const theme = useTheme();
  // const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomContext();
  const [selectedMeter, setSelectedMeter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: deleteMeter,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data || "Meter removed successfully"));
      queryClient.invalidateQueries({ queryKey: ["meter"] });
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error.message || "Failed to delete meter"));
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

  const handleCardClick = (meter) => {
     setSelectedMeter(meter);
    setDialogOpen(true);

    // navigate(`/electricity/prepaid/${meter.number}/buy`, {
    //   state: {
    //     meterDetails: {
    //       number: meter.number,
    //       name: meter.name,
    //       address: meter.address,
    //     },
    //   },
    // });
  };

  const openDetails = (meter) => {
    setSelectedMeter(meter);
    setDialogOpen(true);
  };

  const closeDetails = () => {
    setDialogOpen(false);
    setSelectedMeter(null);
  };

  // ---- Loading ----
  if (loading) {
    return (
      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[...Array(4)].map((_, i) => (
          <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Skeleton variant="text" width="40%" height={28} />
                <Skeleton variant="rounded" width={60} height={24} />
              </Stack>
              <Skeleton variant="text" width="60%" height={20} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={100} height={36} sx={{ flex: 1 }} />
                <Skeleton variant="circular" width={36} height={36} />
                <Skeleton variant="circular" width={36} height={36} />
              </Stack>
            </Stack>
          </Paper>
        ))}
      </List>
    );
  }

  // ---- Error ----
  if (error) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Alert
          severity="error"
          variant="outlined"
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

  // ---- Empty ----
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
      <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {meters.map((meter) => {
          const isDeleting = deleteMutation.isPending && deleteMutation.variables === meter.id;
          return (
            <Paper
              key={meter.id}
              elevation={1}
              sx={{
                p: 2.5,
                borderRadius: 3,
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  boxShadow: theme.shadows[4],
                  borderColor: theme.palette.primary.main,
                },
              }}
              onClick={() => handleCardClick(meter)}
            >
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="h6" fontWeight="700" letterSpacing={-0.5}>
                      {meter.number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {meter.name || "No name"}
                    </Typography>
                  </Box>
                  <Chip
                    label={meter.type?.toUpperCase()}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 600, textTransform: "capitalize" }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
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
                        "&:hover": { bgcolor: alpha(theme.palette.info.main, 0.16) },
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  </Tooltip>

                  <Button
                    variant="contained"
                    size="medium"
                    sx={{
                      flex: 1,
                      borderRadius: 2,
                      textTransform: "none",
                      // fontWeight: 600,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(meter);
                    }}
                  >
                    Buy Units
                  </Button>

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
                        "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.16) },
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
              </Stack>
            </Paper>
          );
        })}
      </List>

      <MeterDetailsDialog open={dialogOpen} onClose={closeDetails} meter={selectedMeter} />
    </>
  );
};

export default MeterCardList;


// import {
//   List,
//   Paper,
//   Stack,
//   Typography,
//   Button,
//   Chip,
//   IconButton,
//   CircularProgress,
// } from "@mui/material";
// import { DeleteOutline } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import Swal from "sweetalert2";
// import { deleteMeter } from "../../../api/meterAPI";
// import { useCustomContext } from "../../../context/providers/CustomProvider";
// import { globalAlertType } from "../../../components/alert/alertType";

// const MeterCardList = ({ meters }) => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const { customDispatch } = useCustomContext();

//   // Delete mutation
//   const deleteMutation = useMutation({
//     mutationFn: deleteMeter,
//     onSuccess: (data) => {
//       customDispatch(globalAlertType("info", data || "Meter removed successfully"));
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

//   const handleCardClick = (meter) => {
//     navigate(`/electricity/prepaid/${meter.number}/buy`, {
//       state: {
//         meterDetails: {
//           number: meter.number,
//           name: meter.name,
//           address: meter.address,
//         },
//       },
//     });
//   };

//   return (
//     <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
//       {meters.map((meter) => {
//         const isDeleting = deleteMutation.isPending && deleteMutation.variables === meter.id;
//         return (
//           <Paper
//             key={meter.id}
//             variant="outlined"
//             sx={{
//               p: 2,
//               borderRadius: 2,
//               cursor: "pointer",
//               transition: "0.2s",
//               "&:hover": { bgcolor: "action.hover" },
//             }}
//             onClick={() => handleCardClick(meter)}
//           >
//             <Stack spacing={1}>
//               <Stack direction="row" justifyContent="space-between" alignItems="center">
//                 <Typography variant="body1" fontWeight="bold">
//                   {meter.number}
//                 </Typography>
//                 <Chip
//                   label={meter.type}
//                   size="small"
//                   color="primary"
//                   variant="outlined"
//                 />
//               </Stack>
//               <Typography variant="body2" color="text.secondary">
//                 Name: {meter.name || "Not set"}
//               </Typography>
//               <Stack direction="row" spacing={1}>
//                 <Button
//                   variant="contained"
//                   size="small"
//                   sx={{ flex: 1 }}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleCardClick(meter);
//                   }}
//                 >
//                   Buy Prepaid Units
//                 </Button>
//                 <IconButton
//                   size="small"
//                   color="error"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     handleDelete(meter.id, meter.number);
//                   }}
//                   disabled={isDeleting}
//                 >
//                   {isDeleting ? (
//                     <CircularProgress size={20} color="inherit" />
//                   ) : (
//                     <DeleteOutline fontSize="small" />
//                   )}
//                 </IconButton>
//               </Stack>
//             </Stack>
//           </Paper>
//         );
//       })}
//     </List>
//   );
// };

// export default MeterCardList;