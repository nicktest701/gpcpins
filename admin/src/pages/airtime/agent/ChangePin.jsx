import { useState } from "react";
import { TextField, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import DOMPurify from "dompurify";
import DialogContainer from "../../../components/dialogs/DialogContainer";
import { globalAlertType } from "../../../components/alert/alertType";
import { useCustomContext } from "../../../context/providers/CustomProvider";
import { verifyPin } from "../../../config/validation";
import { updateWalletPin } from "@/api/transactionAPI";

function ChangePin({ email }) {
  const { customDispatch } = useCustomContext();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");

  const open = Boolean(searchParams.get("view_agent_pin"));

  const { mutateAsync: pinMutateAsync, isLoading: pinIsLoading } = useMutation({
    mutationFn: updateWalletPin,
    onSuccess: (data) => {
      customDispatch(globalAlertType("success", data));
      handleClose();
      setPin("");
      queryClient.invalidateQueries(["agents"]);
      queryClient.invalidateQueries(["agent"]);
    },
    onError: (error) => {
      customDispatch(globalAlertType("error", error));
    },
  });

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("view_agent_pin");
      return params;
    });
  };

  const onSubmit = () => {
    setPinErr("");
    if (pin.trim() === "") {
      setPinErr("Required!");
      return;
    }
    if (!verifyPin(pin)) {
      setPinErr("Invalid Pin! Should be 4-digit number.");
      return;
    }

    const sanitizedPin = DOMPurify.sanitize(pin?.trim());
    const data = {
      id: id,
      pin: sanitizedPin,
      userEmail: email,
      isAdmin: true,
    };

    Swal.fire({
      title: "Updating Wallet Pin",
      text: "Proceed with changes?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        pinMutateAsync(data);
      }
    });
  };

  return (
    <DialogContainer
      open={open}
      onClose={handleClose}
      title="Change Agent Pin"
      subtitle="Update the agent's wallet PIN"
      onConfirm={onSubmit}
      loading={pinIsLoading}
      confirmText="Change Pin"
      maxWidth="xs"
    >
      <Stack spacing={2} py={1}>
        <TextField
          type="number"
          inputMode="numeric"
          variant="outlined"
          label="New Wallet Pin"
          fullWidth
          required
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (pinErr) setPinErr("");
          }}
          error={!!pinErr}
          helperText={pinErr}
          margin="dense"
        />
      </Stack>
    </DialogContainer>
  );
}

export default ChangePin;

// import { useState } from "react";
// import { Dialog, DialogContent, TextField, Stack } from "@mui/material";
// import DOMPurify from "dompurify";
// import { LoadingButton } from "@mui/lab";
// import { useParams, useSearchParams } from "react-router-dom";
// import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { globalAlertType } from "../../../components/alert/alertType";
// import {
 
//   useCustomContext,
// } from "../../../context/providers/CustomProvider";
// import { verifyPin } from "../../../config/validation";

// import Swal from "sweetalert2";
// import { updateWalletPin } from "@/api/transactionAPI";

// function ChangePin({ email }) {
 
//   const { customDispatch } = useCustomContext();
//   const queryClient = useQueryClient();
//   const { id } = useParams();
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [pin, setPin] = useState("");
//   const [pinErr, setPinErr] = useState("");

//   //Change pin number
//   const { mutateAsync: pinMutateAsync, isLoading: pinIsLoading } = useMutation({
//     mutationFn: updateWalletPin,
//   });

//   const handleChangePin = () => {
//     if (pin.trim() === "") {
//       setPinErr("Required!");
//       return;
//     }
//     if (!verifyPin(pin)) {
//       setPinErr("Invalid Pin! Should be 4-digit number.");
//       return;
//     }

//     const sanitizedPin = DOMPurify.sanitize(pin?.trim());

//     const data = {
//       id: id,
//       pin: sanitizedPin,
//       userEmail: email,
//       isAdmin: true,
//     };


//     Swal.fire({
//       title: "Updating Wallet Pin",
//       text: `Procceed with changes?`,
//       showCancelButton: true,
//     }).then(({ isConfirmed }) => {
//       if (isConfirmed) {
//         pinMutateAsync(data, {
//           onSettled: () => {
//             queryClient.invalidateQueries(["agents"]);
//             queryClient.invalidateQueries(["agent"]);
//           },
//           onSuccess: (data) => {
//             customDispatch(globalAlertType("success", data));

//             handleClose();
//             setPin("");
//           },
//           onError: (error) => {
//             customDispatch(globalAlertType("error", error));
//           },
//         });
//       }
//     });
//   };

//   const handleClose = () => {
//     setSearchParams((params) => {
//       params.delete("view_agent_pin");
//       return params;
//     });
//   };

//   return (
//     <Dialog
//       open={Boolean(searchParams.get("view_agent_pin"))}
//       maxWidth="xs"
//       fullWidth
//     >
//       <CustomDialogTitle title="Change Agent Pin" onClose={handleClose} />
//       <DialogContent>
//         <Stack spacing={2} py={2}>
//           <TextField
//             type="number"
//             inputMode="number"
//             variant="outlined"
//             label="New Wallet Pin"
//             fullWidth
//             required
//             value={pin}
//             onChange={(e) => setPin(e.target.value)}
//             error={pinErr !== ""}
//             helperText={pinErr}
//             margin="dense"
//           />

//           <LoadingButton
//             variant="contained"
//             fullWidth
//             disabled={pinIsLoading}
//             loading={pinIsLoading}
//             onClick={handleChangePin}
//           >
//             Change Pin
//           </LoadingButton>
//         </Stack>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default ChangePin;
