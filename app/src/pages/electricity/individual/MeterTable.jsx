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
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { globalAlertType } from "../../../components/alert/alertType";
import { deleteMeter } from "../../../api/meterAPI";
import { useCustomContext } from "../../../context/providers/CustomProvider";

const MeterTable = ({ meters }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomContext();

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMeter,
    onSuccess: (data) => {
      customDispatch(globalAlertType("info", data || "Meter removed successfully"));
      // Invalidate meters query to refresh the list
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

  const handleRowClick = (meter) => {
    navigate(`/electricity/prepaid/${meter.number}/buy`, {
      state: {
        meterDetails: {
          number: meter.number,
          name: meter.name,
          address: meter.address,
          spn: meter.spn,
        },
      },
    });
  };

  return (
    <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2, overflowX: "auto" }}>
      <Table>
        <TableHead sx={{ bgcolor: "grey.100" }}>
          <TableRow>
            <TableCell>Meter Number</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell align="center">Action</TableCell>
            <TableCell align="center">Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {meters.map((meter) => {
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === meter.id;
            return (
              <TableRow
                key={meter.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => handleRowClick(meter)}
              >
                <TableCell>
                  <Typography fontWeight="medium">{meter.number}</Typography>
                </TableCell>
                <TableCell>{meter.name || "—"}</TableCell>
                <TableCell>
                  <Chip
                    label={`${meter.type} (IMES)`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    size="small"
                    color="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRowClick(meter);
                    }}
                  >
                    Buy Prepaid
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(meter.id, meter.number);
                    }}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DeleteOutline fontSize="small" />
                    )}
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MeterTable;