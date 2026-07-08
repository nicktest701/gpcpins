import {
  List,
  Paper,
  Stack,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { deleteMeter } from "../../../api/meterAPI";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";

const MeterCardList = ({ meters }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useCustomContext();

  // Delete mutation
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
    navigate(`/electricity/prepaid/${meter.number}/buy`, {
      state: {
        meterDetails: {
          number: meter.number,
          name: meter.name,
          address: meter.address,
        },
      },
    });
  };

  return (
    <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {meters.map((meter) => {
        const isDeleting = deleteMutation.isPending && deleteMutation.variables === meter.id;
        return (
          <Paper
            key={meter.id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { bgcolor: "action.hover" },
            }}
            onClick={() => handleCardClick(meter)}
          >
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight="bold">
                  {meter.number}
                </Typography>
                <Chip
                  label={meter.type}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Name: {meter.name || "Not set"}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  sx={{ flex: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(meter);
                  }}
                >
                  Buy Prepaid Units
                </Button>
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
              </Stack>
            </Stack>
          </Paper>
        );
      })}
    </List>
  );
};

export default MeterCardList;