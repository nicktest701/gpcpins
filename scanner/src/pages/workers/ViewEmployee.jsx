import {
  Avatar,
  Box,
  Container,
  IconButton,
  Divider,
  Stack,
  Typography,
  Tooltip,
  Skeleton,
} from "@mui/material";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useState } from "react";
import Compressor from "compressorjs";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import {
  ArrowBackRounded,
  Delete,
  DisabledByDefault,
  Edit,
  Key,
} from "@mui/icons-material";
import { getInitials } from "../../config/validation";
import { LoadingButton } from "@mui/lab";
import Active from "../../components/Active";
import {
  enableOrDisableAccount,
  getVerifierByID,
  removeVerifier,
  resetVerifierPassword,
  updateVerifierProfile,
} from "../../api/verifierAPI";
import { useAuth } from "../../context/providers/AuthProvider";
import GeneralInformation from "./GeneralInformation";
import VerifierAssignedTickets from "./VerifierAssignedTickets";
import CustomTitle from "../../components/custom/CustomTitle";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";

const ViewEmployee = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { customDispatch } = useContext(CustomContext);
  const [activeTab, setActiveTab] = useState(state?.tab || "general");

  const verifier = useQuery({
    queryKey: ["verifier", id],
    queryFn: () => getVerifierByID(id),
    enabled: !!id,
    initialData: queryClient
      .getQueryData(["verifiers"])
      ?.find((verifier) => verifier?._id === id),
  });

  const { mutateAsync: toggleVerifierAccountMutateAsync } = useMutation({
    mutationFn: enableOrDisableAccount,
  });

  function handleToggleVerifierAccount() {
    Swal.fire({
      title: verifier?.data?.active ? "Disabling Account" : "Enabling account",
      text: verifier?.data?.active
        ? "Do you want to disable account?"
        : "Do you want to enable account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        toggleVerifierAccountMutateAsync(
          { id: verifier?.data?._id, active: !verifier?.data?.active },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["verifier", id]);
              queryClient.invalidateQueries(["verifiers"]);
              queryClient.invalidateQueries(["verifier-info"]);
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

  //send password reset link
  const { mutateAsync: resetMutateAsync, isLoading } = useMutation({
    mutationFn: resetVerifierPassword,
  });
  const handlePasswordResetLink = () => {
    Swal.fire({
      title: "Password Reset",
      text: "You are about to reset the password to a new one.Do you which to proceed?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        resetMutateAsync(
          { id: verifier?.data?._id },
          {
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
  };

  /// Update Verifier Details
  const handleUpdateVerifier = () => {
    navigate(`/verifiers/${id}/edit`);
  };

  //Remove verifier
  const { mutateAsync: deleteMutateAsync } = useMutation({
    mutationFn: removeVerifier,
  });

  function handleRemoveVerifierAccount() {
    Swal.fire({
      title: "Removing Account",
      text: "Do you want to delete account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMutateAsync(
          { id: verifier?.data?._id },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["verifiers"]);
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

  const handleManageRoles = () => {
    const permissions = JSON.stringify(verifier?.data?.permissions ?? []);
    navigate(
      `/verifiers/roles/${id}?permissions=${encodeURIComponent(permissions)}`
    );
  };

  const handleUploadFile = (e) => {
    if (e.target.files) {
      const image = e.target.files[0];

      new Compressor(image, {
        height: 200,
        width: 200,
        quality: 0.6,

        success(data) {
          setIsPhotoLoading(true);
          const info = {
            id,
            profile: data,
          };

          updateVerifierProfile(info)
            .then(() => {
              customDispatch(globalAlertType("info", "Profile Updated!"));
            })
            .catch((error) => {
              customDispatch(globalAlertType("error", error));
            })
            .finally(() => {
              setIsPhotoLoading(false);
            });
        },
      });
    }
  };

  if (verifier?.isLoading) {
    return (
      <div>
        <div className="spinner2"></div>
      </div>
    );
  }

  const Tab = ({ label, isActive, onClick }) => (
    <Typography
      variant="body2"
      className={`tab ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      {label}
    </Typography>
  );

  return (
    <Container sx={{ pt: 2 }}>
      {/* <Typography>
        Update verifiers personal information and manage your account settings.
      </Typography> */}
      <Link to="/verifiers?YixHy=a34cdd3543&_pid=423423">
        <IconButton>
          <ArrowBackRounded />
        </IconButton>
      </Link>
      {/* <CustomTitle
        title="Employees"
        subtitle="Dive into employee details, staff information, and human resources data to effectively manage our team."
        icon={
          <Avatar
            color="primary"
            sx={{
              width: 48,
              height: 48,
              bgcolor: "primary.main",
              my: 2,
            }}
            src={verifier?.data?.profile}
          />
        }
      /> */}

      {verifier?.data && (
        <Container sx={{ paddingY: 2 }}>
          <CustomTitle
            title={`${verifier?.data?.firstname} ${verifier?.data?.lastname}`}
          />
          <Stack
            direction={{ xs: "column", md: "row" }}
            gap={3}
            justifyContent={{ xs: "center", md: "space-between" }}
            alignItems="center"
            //  bgcolor="primary.main"
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              alignItems="center"
            >
              <div>
                {isPhotoLoading ? (
                  <Skeleton variant="circular" width={48} height={48} />
                ) : (
                  <>
                    <Tooltip title="Click to upload photo">
                      <label
                        htmlFor="photo"
                        style={{
                          cursor: "pointer",
                        }}
                      >
                        <Avatar
                          color="primary"
                          sx={{
                            width: 80,
                            height: 80,
                            bgcolor: "primary.main",
                          }}
                          src={verifier?.data?.profile}
                        >
                          {getInitials(
                            `${verifier?.data?.firstname} ${verifier?.data?.lastname}`
                          )}
                        </Avatar>
                      </label>
                    </Tooltip>
                    <div>
                      <input
                        type="file"
                        id="photo"
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={handleUploadFile}
                        hidden
                      />
                    </div>
                  </>
                )}
              </div>
              <Stack>
                <Typography
                  textTransform="uppercase"
                  fontWeight="bold"
                  variant="h6"
                >
                  {`${verifier?.data?.firstname} ${verifier?.data?.lastname}`}
                </Typography>
                <Typography
                  textAlign={{ xs: "center", md: "left" }}
                  sx={{
                    color:
                      verifier?.data?.role === "Administrator"
                        ? "success"
                        : "info",
                  }}
                >
                  {verifier?.data?.role}
                </Typography>
              </Stack>
            </Stack>

            <Box p={1} display="flex" gap={1} justifyContent="flex-start">
              <Tooltip title="Reset Password">
                <IconButton
                  color="primary"
                  onClick={handlePasswordResetLink}
                  disabled={isLoading}
                  sx={{ bgcolor: "whitesmoke" }}
                >
                  <Key />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit Profile Details">
                <IconButton
                  color="primary"
                  sx={{ bgcolor: "whitesmoke" }}
                  onClick={handleUpdateVerifier}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip
                title={
                  verifier?.data?.active
                    ? "Disactivate Account"
                    : "Activate Account"
                }
              >
                <IconButton
                  color={verifier?.data?.active ? "primary" : "secondary"}
                  sx={{ bgcolor: "whitesmoke" }}
                  onClick={handleToggleVerifierAccount}
                >
                  <DisabledByDefault />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Account">
                <IconButton
                  color="error"
                  sx={{ bgcolor: "whitesmoke" }}
                  onClick={handleRemoveVerifierAccount}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={2}
            py={1}
          >
            <Active active={verifier?.data?.active} />
          </Stack>
          {/* <Divider /> */}
          <Stack
            my={2}
            direction="row"
            gap={4}
            borderBottom="1px solid lightgray"
          >
            <Tab
              label="General"
              isActive={activeTab === "general"}
              onClick={() => setActiveTab("general")}
            />
            <Tab
              label="Assigned Tickets"
              isActive={activeTab === "tickets"}
              onClick={() => setActiveTab("tickets")}
            />
          </Stack>
          <Box minHeight="50svh" pt={2}>
            <Box bgcolor="whitesmoke" p={1} mb={2}>
              <Typography variant="h4">
                {activeTab === "general"
                  ? "General Information"
                  : activeTab === "tickets"
                  ? "Tickets"
                  : ""}
              </Typography>
              <Typography variant="body2">
                {activeTab === "general"
                  ? "View and update your personal details and contact information about verifiers."
                  : activeTab === "tickets"
                  ? " View and manage tickets that have been assigned to you for various events and services."
                  : ""}
              </Typography>
            </Box>

            {/* General Information  */}
            {activeTab === "general" && (
              <GeneralInformation verifier={verifier} />
            )}

            {/* Tickets  */}
            {activeTab === "tickets" && <VerifierAssignedTickets />}
          </Box>
          <Divider />

          {user?.permissions?.includes("Manage Roles & Permissions") && (
            <Stack py={4}>
              <Typography variant="h4" pt={4}>
                Permissions
              </Typography>
              <Typography paragraph variant="body2" color="secondary.main">
                Manage verifiers roles and permissions
              </Typography>
              {verifier?.data && (
                <LoadingButton
                  variant="contained"
                  onClick={handleManageRoles}
                  // sx={{ alignSelf: "flex-end" }}
                >
                  Manage Roles & Permission
                </LoadingButton>
              )}
            </Stack>
          )}
        </Container>
      )}
      {isLoading && <GlobalSpinner />}
    </Container>
  );
};

export default ViewEmployee;
