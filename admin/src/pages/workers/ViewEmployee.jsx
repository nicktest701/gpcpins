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
} from "@mui/material";
import Swal from "sweetalert2";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEmployee,
  removeEmployee,
  resetEmployeePassword,
  toggleEmployeeAccount,
} from "../../api/employeeAPI";
import { useContext, useState } from "react";
import Compressor from "compressorjs";
import {
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { ArrowBackRounded, Edit } from "@mui/icons-material";
import { getInitials } from "../../config/validation";
import { LoadingButton } from "@mui/lab";
import Active from "../../components/Active";
import UpdateEmployee from "./UpdateEmployee";
import { updateAdminProfile } from "../../api/adminAPI";
import moment from "moment";
import CustomTitle from "../../components/custom/CustomTitle";
import { AuthContext } from "../../context/providers/AuthProvider";
import GlobalSpinner from "../../components/spinners/GlobalSpinner";

const ViewEmployee = () => {
  const queryEmployee = useQueryClient();
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { customDispatch } = useContext(CustomContext);

  const employee = useQuery({
    queryKey: ["employee", id],
    queryFn: () => getEmployee(id),
    enabled: !!id,
    initialData: queryEmployee
      .getQueryData(["employees"])
      ?.find((employee) => employee?._id === id),
  });

  const {
    mutateAsync: toggleEmployeeAccountMutateAsync,
    isLoading: toggleEmployeeAccountIsLoading,
  } = useMutation({
    mutationFn: toggleEmployeeAccount,
  });

  function handleToggleEmployeeAccount() {
    Swal.fire({
      title: employee?.data?.active ? "Disabling Account" : "Enabling account",
      text: employee?.data?.active
        ? "Do you want to disable account?"
        : "Do you want to enable account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        toggleEmployeeAccountMutateAsync(
          { id: employee?.data?._id, active: !employee?.data?.active },
          {
            onSettled: () => {
              queryEmployee.invalidateQueries(["employee", id]);
              queryEmployee.invalidateQueries(["employees"]);
              queryEmployee.invalidateQueries(["employee-info"]);
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
    mutationFn: resetEmployeePassword,
  });
  const handlePasswordResetLink = () => {
    Swal.fire({
      title: "Password Reset Link",
      text: "Ypu are about to send a password link to your employee. Do you wish to proceed?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        resetMutateAsync(
          { email: employee?.data?.email },
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

  /// Update Employee Details
  const handleUpdateEmployee = () => {
    setSearchParams((params) => {
      params.set("update_employee", true);
      return params;
    });
  };

  //Remove employee

  const { mutateAsync: deleteMutateAsync, isLoading: deleteIsLoading } =
    useMutation({
      mutationFn: removeEmployee,
    });

  function handleRemoveEmployeeAccount() {
    Swal.fire({
      title: "Removing Account",
      text: "Do you want to delete account?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        deleteMutateAsync(
          { id: employee?.data?._id },
          {
            onSettled: () => {
              queryEmployee.invalidateQueries(["employees"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
              navigate("/employees?YixHy=a34cdd3543&_pid=423423");
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
    const permissions = JSON.stringify(employee?.data?.permissions ?? []);

    navigate(
      `/employees/roles/${id}?permissions=${encodeURIComponent(permissions)}`
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

          updateAdminProfile(info)
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

  if (employee?.isLoading) {
    return (
      <div>
        <div className="spinner2"></div>
      </div>
    );
  }

  return (
    <>
      {employee?.data?.status === "pending" && (
        <Alert
          severity="info"
          action={
            <Button variant="outlined" onClick={handleUpdateEmployee}>
              Activate Now
            </Button>
          }
        >
          This account has pending activation !
        </Alert>
      )}

      {employee?.data && (
        <Container sx={{ paddingY: 2, bgcolor: "#fff" }}>
          <Link to="/employees?YixHy=a34cdd3543&_pid=423423">
            <IconButton>
              <ArrowBackRounded />
            </IconButton>
          </Link>
          <CustomTitle
            titleVariant="h5"
            title=" Personal Details"
            subtitle=" Manage employees personal details."
          />
          <div style={{ display: "grid", placeItems: "center", gap: "24px" }}>
            {isPhotoLoading ? (
              <Skeleton variant="circular" width={120} height={120} />
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
                        width: 100,
                        height: 100,
                        bgcolor: "primary.main",
                        my: 2,
                      }}
                      src={employee?.data?.profile}
                    >
                      {getInitials(
                        `${employee?.data?.firstname} ${employee?.data?.lastname}`
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

          <Typography
            textTransform="uppercase"
            textAlign="center"
            fontWeight="bold"
            variant="h4"
          >
            {`${employee?.data?.firstname} ${employee?.data?.lastname}`}
          </Typography>

          <Divider flexItem />

          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={2}
            py={1}
          >
            <Typography variant="h5" color="primary">
              Account Status
            </Typography>
            <Divider />

            <Active active={employee?.data?.active} />
          </Stack>
          {user?.permissions?.includes("Edit employees") && (
            <Box p={1} display="flex" gap={2} justifyContent="flex-start">
              <LoadingButton
                variant="outlined"
                endIcon={<Edit />}
                onClick={handlePasswordResetLink}
                disabled={isLoading}
                loading={isLoading}
              >
                Password Reset Link
              </LoadingButton>
              <Button
                variant="outlined"
                endIcon={<Edit />}
                onClick={handleUpdateEmployee}
              >
                Edit
              </Button>
            </Box>
          )}

          <Divider />

          <Stack spacing={1} my={2}>
            <Typography>
              Name :
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.name}
              </b>
            </Typography>

            <Typography>
              Username :
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.username}
              </b>
            </Typography>

            <Typography>
              Date of Birth :
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {moment(new Date(employee?.data?.dob)).format("Do MMMM,YYYY")}
              </b>
            </Typography>

            <Typography>
              Role :{" "}
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.role}
              </b>
            </Typography>

            <Typography>
              National ID. :{" "}
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.nid}
              </b>
            </Typography>

            <Typography>
              Email Address :{" "}
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.email}
              </b>
            </Typography>

            <Typography>
              Telephone No. :{" "}
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.phonenumber}
              </b>
            </Typography>

            <Typography>
              Residential Address :{" "}
              <b style={{ color: "green", paddingLeft: "12px" }}>
                {employee?.data?.residence}
              </b>
            </Typography>
          </Stack>

          <Divider />

          {user?.permissions?.includes("Manage Roles & Permissions") && (
            <Stack py={4}>
              <CustomTitle
                titleVariant="h5"
                title="Permissions"
                subtitle="Manage employees roles and permissions."
              />

              {employee?.data && (
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

          <Divider />

          {user?.permissions?.includes("Delete employees") && (
            <>
              <CustomTitle
                titleVariant="h5"
                title="Delete/Disable Account"
                subtitle="Once you delete your account, there is no going back. All settings,permissions associated with this account will be removed Please be certain."
              />
              <Stack
                direction="row"
                justifyContent="flex-end"
                columnGap={2}
                py={1}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleRemoveEmployeeAccount}
                >
                  Remove Account
                </Button>
                <Button
                  variant="contained"
                  onClick={handleToggleEmployeeAccount}
                  color={employee?.data?.active ? "primary" : "secondary"}
                >
                  {employee?.data?.active
                    ? "Disable Account"
                    : "Enable Account"}
                </Button>
              </Stack>
            </>
          )}
        </Container>
      )}

      <UpdateEmployee />
      {toggleEmployeeAccountIsLoading ||
        isLoading ||
        (deleteIsLoading && <GlobalSpinner />)}
    </>
  );
};

export default ViewEmployee;
