import { useContext, useCallback, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Divider,
  Stack,
  Typography,
  Tooltip,
  Skeleton,
  Paper,
  Grid,
  Chip,
  Card,
  CardContent,
} from "@mui/material";
import {
  ArrowBackRounded,
  Edit,
  LockReset,
  DeleteForever,
  PersonRemove,
  AdminPanelSettings,
  Email,
  Phone,
  Home,
  Cake,
  Badge,
  Person,
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import moment from "moment";
import Compressor from "compressorjs";

import { CustomContext } from "../../context/providers/CustomProvider";
import { AuthContext, useAuth } from "../../context/providers/AuthProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { getInitials } from "../../config/validation";
import {
  getEmployee,
  removeEmployee,
  resetEmployeePassword,
  toggleEmployeeAccount,
} from "../../api/employeeAPI";
import { updateAdminProfile } from "../../api/adminAPI";
import CustomTitle from "../../components/custom/CustomTitle";
import UpdateEmployee from "./UpdateEmployee";

const ViewEmployee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { customDispatch } = useContext(CustomContext);
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);

  // Fetch employee data
  const {
    data: employee,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
    initialData: queryClient
      .getQueryData(["employees"])
      ?.find((emp) => emp?.id === id),
  });

  // Memoized employee details for display
  const employeeDetails = useMemo(() => {
    if (!employee) return null;
    return {
      name: employee.name,
      username: employee.username,
      email: employee.email,
      phonenumber: employee.phonenumber,
      dob: employee.dob ? moment(employee.dob).format("Do MMMM, YYYY") : "N/A",
      role: employee.role,
      nid: employee.nid,
      residence: employee.residence,
      active: employee.active,
      status: employee.status,
      profile: employee.profile,
    };
  }, [employee]);

  // Toggle account status
  const toggleMutation = useMutation({
    mutationFn: toggleEmployeeAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries(["employee", id]);
      queryClient.invalidateQueries(["employees"]);
      queryClient.invalidateQueries(["employee-info"]);
      customDispatch(globalAlertType("success", data));
    },
    onError: (error) => customDispatch(globalAlertType("error", error)),
  });

  const handleToggleAccount = useCallback(() => {
    if (!employee) return;
    const isActive = employee.active;
    Swal.fire({
      title: isActive ? "Disable Account" : "Enable Account",
      text: `Are you sure you want to ${isActive ? "disable" : "enable"} this account?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Yes, ${isActive ? "disable" : "enable"}`,
    }).then((result) => {
      if (result.isConfirmed) {
        toggleMutation.mutate({ id: employee.id, active: !isActive });
      }
    });
  }, [employee, toggleMutation]);

  // Send password reset link
  const resetMutation = useMutation({
    mutationFn: resetEmployeePassword,
    onSuccess: (data) => customDispatch(globalAlertType("success", data)),
    onError: (error) => customDispatch(globalAlertType("error", error)),
  });

  const handlePasswordReset = useCallback(() => {
    if (!employee) return;
    Swal.fire({
      title: "Send Password Reset Link",
      text: `Send a password reset link to ${employee.email}?`,
      icon: "question",
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        resetMutation.mutate({ email: employee.email });
      }
    });
  }, [employee, resetMutation]);

  // Delete employee
  const deleteMutation = useMutation({
    mutationFn: removeEmployee,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      navigate("/employees?YixHy=a34cdd3543&_pid=423423");
      queryClient.invalidateQueries(["employees"]);
    },
    onError: (error) => customDispatch(globalAlertType("error", error)),
  });

  const handleDelete = useCallback(() => {
    if (!employee) return;
    Swal.fire({
      title: "Delete Account",
      text: "This action is permanent. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate({ id: employee.id });
      }
    });
  }, [employee, deleteMutation]);

  // Update employee modal
  const handleUpdateEmployee = useCallback(() => {
    setSearchParams((params) => {
      params.set("update_employee", "true");
      return params;
    });
  }, [setSearchParams]);

  // Manage roles

  // Profile photo upload with compression
  const handlePhotoUpload = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Preview
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);

      new Compressor(file, {
        height: 200,
        width: 200,
        quality: 0.6,
        success: (compressedFile) => {
          setIsPhotoUploading(true);
          updateAdminProfile({ id, profile: compressedFile })
            .then(() => {
              customDispatch(
                globalAlertType("success", "Profile photo updated!"),
              );
              queryClient.invalidateQueries(["employee", id]);
            })
            .catch((err) => {
              customDispatch(globalAlertType("error", err.message));
            })
            .finally(() => {
              setIsPhotoUploading(false);
              setPhotoPreview(null);
            });
        },
        error: (err) => {
          customDispatch(globalAlertType("error", "Failed to compress image"));
        },
      });
    },
    [id, customDispatch, queryClient],
  );

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Skeleton variant="rectangular" height={56} />
          <Skeleton
            variant="circular"
            width={100}
            height={100}
            sx={{ mx: "auto" }}
          />
          <Skeleton variant="text" width="60%" sx={{ mx: "auto" }} />
          <Skeleton variant="rectangular" height={200} />
        </Stack>
      </Container>
    );
  }

  // Error state
  if (isError || !employee) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error?.message || "Employee not found"}</Alert>
        <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const hasEditPermission = user?.permissions?.includes("Edit employees");
  // const hasRolesPermission = user?.permissions?.includes("Manage Roles & Permissions");
  const hasDeletePermission = user?.permissions?.includes("Delete employees");

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with back button */}
      <CustomTitle
        title="Employee Details"
        subtitle="View employee profile, wallet overview, and account activity"
        showBack
        onBack={() => navigate("/employees")}
      />

      {/* Pending activation alert */}
      {employee.status === "pending" && (
        <Alert
          severity="warning"
          action={
            <Button
              variant="outlined"
              color="warning"
              onClick={handleUpdateEmployee}
            >
              Activate Now
            </Button>
          }
          sx={{ mb: 3 }}
        >
          This account requires activation. Please complete the registration.
        </Alert>
      )}

      {/* Main Profile Card */}
      <Paper
        elevation={2}
        sx={{ borderRadius: 1.2, overflow: "hidden", mb: 4 }}
      >
        <Box sx={{ bgcolor: "primary.main", height: 100 }} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: -6 }}>
          {isPhotoUploading ? (
            <Skeleton variant="circular" width={100} height={100} />
          ) : (
            <Tooltip title="Click to change photo">
              <label htmlFor="profile-photo" style={{ cursor: "pointer" }}>
                <Avatar
                  src={photoPreview || employee.profile}
                  sx={{
                    width: 120,
                    height: 120,
                    border: "4px solid white",
                    bgcolor: "primary.main",
                  }}
                >
                  {getInitials(employee.name)}
                </Avatar>
              </label>
            </Tooltip>
          )}
          <input
            type="file"
            id="profile-photo"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handlePhotoUpload}
            hidden
          />
        </Box>

        <Box sx={{ textAlign: "center", mt: 2, mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            {employee.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            @{employee.username}
          </Typography>
          <Chip
            label={employee.active ? "Active" : "Inactive"}
            color={employee.active ? "success" : "error"}
            size="small"
            sx={{ mt: 1 }}
          />
        </Box>

        <Divider />

        {/* Action Buttons */}
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          spacing={1}
          sx={{ p: 2 }}
        >
          {hasEditPermission && (
            <LoadingButton
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleUpdateEmployee}
              size="small"
            >
              Edit Profile
            </LoadingButton>
          )}
          {hasEditPermission && (
            <LoadingButton
              variant="outlined"
              startIcon={<LockReset />}
              onClick={handlePasswordReset}
              loading={resetMutation.isLoading}
              size="small"
            >
              Reset Password
            </LoadingButton>
          )}
        </Stack>
      </Paper>

      {/* Personal Information Card */}
      <Card elevation={2} sx={{ borderRadius: 1.2, mb: 4 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Person fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Full Name:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.name}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Role:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.role}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Username:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.username}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Email fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.email}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Phone fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Phone:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.phonenumber}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Cake fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Date of Birth:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employeeDetails.dob}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Badge fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  National ID:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.nid}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Home fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  Residence:
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {employee.residence}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Danger Zone (Delete/Disable) */}
      {hasDeletePermission && (
        <Card
          elevation={2}
          sx={{ borderRadius: 1.2, borderColor: "error.main", borderWidth: 1 }}
        >
          <CardContent>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="error"
              gutterBottom
            >
              Danger Zone
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Once you delete an account, all associated data will be
              permanently removed.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteForever />}
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
              >
                Delete Account
              </Button>
              <Button
                variant="outlined"
                color={employee.active ? "warning" : "success"}
                startIcon={<PersonRemove />}
                onClick={handleToggleAccount}
                disabled={toggleMutation.isLoading}
              >
                {employee.active ? "Disable Account" : "Enable Account"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Update Employee Modal */}
      <UpdateEmployee />
    </Container>
  );
};

export default ViewEmployee;
