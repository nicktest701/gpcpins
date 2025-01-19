import { useContext } from "react";
import { Box } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomTitle from "../../../components/custom/CustomTitle";
import { deleteAgent } from "../../../api/agentAPI";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";

function AgentAccount() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { customDispatch } = useContext(CustomContext);

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: deleteAgent,
  });

  function handleRemoveAgentAccount() {
    Swal.fire({
      title: "Removing Account",
      text: "Do you want to delete account?",
      html: `<div>
      <p>Before proceeding with the deletion of your user account, please consider the following:</p>
<ol>
  <li><strong>Data Loss:</strong> Deleting your account will result in the permanent loss of all data associated with it, including but not limited to profile information, preferences, and any content or files you have uploaded or created.</li>
  
  <li><strong>Irreversibility:</strong> Once the account deletion process is initiated, it cannot be undone. Your username will become unavailable for future use, and you will lose access to any services or features tied to your account.</li>
 
  <li><strong>Impact on Services:</strong> If you have subscriptions, memberships, or active services linked to your account, deleting it may disrupt or terminate those services. Make sure to review any ongoing commitments before proceeding.</li>
</ol>
<p>By confirming your decision to delete your account, you acknowledge and accept the consequences outlined above. Please proceed with caution and ensure this action aligns with your intentions.</p>

<p>If you still wish to proceed with the deletion, please confirm .</p>
</body>
      </div>`,
      showCancelButton: true,
      confirmButtonColor: '#B72136'
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(
          { id },
          {
            onSettled: () => {
              queryClient.invalidateQueries(["agents"]);
            },
            onSuccess: (data) => {
              customDispatch(globalAlertType("info", data));
              navigate("/airtime/agent");
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
        onClick={handleRemoveAgentAccount}
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

export default AgentAccount;
