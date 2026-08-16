import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Stack,
  Divider,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Grid,
  Tooltip,
  IconButton,
  Chip,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getComplaint,
  updateComplaint,
} from "@/api/complaintAPI";
import { useCustomContext } from "@/context/providers/CustomProvider";
import { globalAlertType } from "@/components/alert/alertType";
import moment from "moment";
import CustomTitle from "@/components/custom/CustomTitle";
import {
  AccessTime,
  Refresh,
  Person,
  Phone,
  Receipt,
  Comment,
  Assignment,
  CheckCircle,
  Cancel,
  Pending,
  Info,
} from "@mui/icons-material";
import Swal from "sweetalert2";

const statusOptions = ["pending", "open", "resolved", "unresolved"];
const statusConfig = {
  pending: { label: "Pending", color: "warning", icon: <Pending /> },
  open: { label: "Open", color: "info", icon: <Info /> },
  resolved: { label: "Resolved", color: "success", icon: <CheckCircle /> },
  unresolved: { label: "Unresolved", color: "error", icon: <Cancel /> },
};

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("");
  const [resolution, setResolution] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const {
    data: complaint,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["complaint-detail", id],
    queryFn: () => getComplaint(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status);
      setResolution(complaint.resolution || "");
      setAssignedTo(complaint.assigned_to || "");
    }
  }, [complaint]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => updateComplaint(id, updates),
    onSuccess: (data) => {
      customDispatch(
        globalAlertType("success", "Complaint updated successfully")
      );
      queryClient.invalidateQueries(["complaint-detail", id]);
      queryClient.invalidateQueries(["admin-complaints"]);
      refetch();
    },
    onError: (error) => {
      customDispatch(
        globalAlertType("error", error.message || "Update failed")
      );
    },
  });

  const handleUpdate = () => {
    Swal.fire({
      title: "Update Complaint",
      text: "Are you sure you want to update this complaint?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, update",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        updateMutation.mutate({
          id,
          updates: { status, resolution, assigned_to: assignedTo },
        });
      }
    });
  };

  if (isLoading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isError || !complaint) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Complaint not found.</Alert>
      </Container>
    );
  }

  const currentStatus = statusConfig[complaint.status] || statusConfig.pending;

  return (
    <>
      <CustomTitle
        title={`Complaint #${complaint.id}`}
        subtitle="Monitor and resolve customer complaints"
        icon={<AccessTime sx={{ width: 50, height: 50 }} color="primary" />}
        refresh={
          <Tooltip title="Refresh">
            <IconButton onClick={() => refetch()}>
              <Refresh />
            </IconButton>
          </Tooltip>
        }
        showBack
      />

      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Stack spacing={3}>
          {/* Header Card */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 1.2 }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="h5" fontWeight="bold">
                  Complaint #{complaint.id}
                </Typography>
                <Chip
                  icon={currentStatus.icon}
                  label={currentStatus.label}
                  color={currentStatus.color}
                  sx={{ fontWeight: "bold", color: "#fff" }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Created {moment(complaint.created_at).fromNow()}
              </Typography>
            </Stack>
          </Paper>

          {/* Details Card */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 1.2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Customer Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <DetailItem
                icon={<Person />}
                label="Submitted By"
                value={complaint.user?.name || "N/A"}
                // subtext={complaint.user?.email || "N/A"}
              />
              <DetailItem
                icon={<Phone />}
                label="Phone Number"
                value={complaint.phonenumber || "N/A"}
              />
              <DetailItem
                icon={<Receipt />}
                label="Transaction ID"
                value={complaint.transaction_id}
              />
                <DetailItem
                  icon={<Assignment />}
                  label="Payment Mode"
                  value={complaint.payment_mode}
                  // subtext={`Payment: ${complaint.payment_mode}`}
                />
              <DetailItem
                icon={<Assignment />}
                label="Service Type"
                value={complaint.service_type}
                // subtext={`Payment: ${complaint.payment_mode}`}
              />
              {complaint.meter_no && (
                <DetailItem
                  icon={<Info />}
                  label="Meter Number"
                  value={complaint.meter_no}
                />
              )}
              <DetailItem
                icon={<Comment />}
                label="Comment"
                value={complaint.comment}
                fullWidth
              />
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Timeline
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
              <Typography variant="body2" color="text.secondary">
                <strong>Created:</strong>{" "}
                {moment(complaint.created_at).format("LLL")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Last Updated:</strong>{" "}
                {moment(complaint.updated_at).format("LLL")}
              </Typography>
            </Stack>
          </Paper>

          {/* Admin Actions Card */}
          <Paper elevation={2} sx={{ p: 3, borderRadius: 1.2,  }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Admin Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={3}>
              <TextField
                select
                label="Status"
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                sx={{ textTransform: "capitalize" }}
              >
                {statusOptions.map((opt) => (
                  <MenuItem
                    key={opt}
                    value={opt}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {statusConfig[opt].label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Assigned To (Admin email)"
                fullWidth
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="admin@example.com"
              />

              <TextField
                label="Resolution Notes"
                multiline
                rows={3}
                fullWidth
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="Describe how the issue was resolved..."
              />

              <LoadingButton
                variant="contained"
                onClick={handleUpdate}
                loading={updateMutation.isLoading}
                sx={{ alignSelf: "flex-start" }}
              >
                Update Complaint
              </LoadingButton>
            </Stack>
          </Paper>

          <Box>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

// Helper component for detail items
const DetailItem = ({ icon, label, value, subtext, fullWidth = false }) => (
  <Grid item xs={12} sm={fullWidth ? 12 : 6}>
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Box sx={{ color: "primary.main", mt: 0.5 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body1" fontWeight="medium">
          {value || "N/A"}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.secondary">
            {subtext}
          </Typography>
        )}
      </Box>
    </Stack>
  </Grid>
);

export default ComplaintDetail;