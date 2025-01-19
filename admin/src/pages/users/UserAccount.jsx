import { useContext } from "react";
import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomTitle from "../../components/custom/CustomTitle";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { deleteUser } from "../../api/userAPI";

function UserAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: deleteUser,
  });

  function handleRemoveUserAccount() {
    Swal.fire({
      title: "Removing Account",
      text: "Do you want to delete account?",
      showCancelButton: true,
      confirmButtonColor: "#B72136",
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(
          { id },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["users"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
              navigate("/users");
            },
            onError: (error) => {
              customDispatch(globalAlertType("error", error));
            },
          }
        );
      }
    });
  }

  return (
    <Box sx={{ bgcolor: "#fff", p: 2 }}>
      <CustomTitle
        titleVariant="h4"
        title="Delete Account"
        subtitle="Once you delete your account, there is no going back. All settings,transactions associated with this account will be removed Please be certain."
      />
      <LoadingButton
        variant="contained"
        color="error"
        onClick={handleRemoveUserAccount}
        loading={isLoading}
        sx={{
          mt: 2,
          alignSelf: "flex-start",
        }}
      >
        {isLoading ? "Deleting" : "Delete Account"}
      </LoadingButton>
    </Box>
  );
}

export default UserAccount;
