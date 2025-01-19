import { useContext, useState } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Typography,
  Stack,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import DOMPurify from "dompurify";
import { LoadingButton } from "@mui/lab";
import { useSearchParams } from "react-router-dom";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useMutation, useQuery } from "@tanstack/react-query";
import { globalAlertType } from "../../components/alert/alertType";
import { CustomContext } from "../../context/providers/CustomProvider";
import { AuthContext } from "../../context/providers/AuthProvider";
import { verifyCode, verifyPin } from "../../config/validation";
import {
  getPhoneNumberToken,
  updateWalletPin,
  verifyUserIdentity,
} from "../../api/userAPI";
import { generateRandomCode } from "../../config/generateRandomCode";
import Swal from "sweetalert2";
import moment from "moment";
import CustomDatePicker from "../../../../admin/src/components/inputs/CustomDatePicker";

function ChangePin() {
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOTP, setShowOTP] = useState(false);
  const [option, setOption] = useState("dob");
  const [nid, setNid] = useState("");
  const [dob, setDob] = useState(moment());
  const [err, setErr] = useState("");
  const [token, setToken] = useState("");
  const [pin, setPin] = useState("");
  const [pinErr, setPinErr] = useState("");

  //Send mobile number verification token
  const sendToken = useQuery({
    queryFn: getPhoneNumberToken,
    queryKey: ["verify-pin-number"],
    enabled: false,
    // !!searchParams.get("view_pin") && searchParams.get("generated") === null,
    onSuccess: () => {
      setSearchParams((params) => {
        params.set("generated", "true");
        return params;
      });
    },
  });

  //Verify Code
  const { mutateAsync, isLoading } = useMutation({
    mutationFn: getPhoneNumberToken,
  });

  const handleSubmit = () => {
    if (token.trim() === "") {
      setErr("Required!");
      return;
    }
    if (!verifyCode(token)) {
      setErr("Invalid code! Try again");
      return;
    }

    const tokent = DOMPurify.sanitize(token?.trim());

    const data = {
      token: tokent,
    };

    mutateAsync(data, {
      onSuccess: () => {
        setSearchParams((params) => {
          setShowOTP(false);
          params.set("v_no", generateRandomCode(100));
          return params;
        });
      },
      onError: (error) => {
        setErr(error);
      },
    });
  };

  const { mutateAsync: verifyMutateAsync, isLoading: verifyIsLoading } =
    useMutation({
      mutationFn: verifyUserIdentity,
    });

  const handleVerifyIdentity = () => {
    setErr("");
    let payload = {};

    if (option === "nid") {
      if (nid.trim() === "") {
        setErr("Required!");
        return;
      }

      if (!/GHA-\d{9}-\d{1}/.test(nid)) {
        setErr("Invalid National ID !");
        return;
      }

      const nationalID = DOMPurify.sanitize(nid?.trim());
      payload.nid = nationalID;
    }

    if (option === "dob") {
      payload.dob = new Date(dob);
    }

    verifyMutateAsync(payload, {
      onSuccess: (data) => {
        setErr("");
        if (data && data === "OK") setShowOTP(true);
        sendToken.refetch();
      },
      onError: (error) => {
        setErr(error);
        // customDispatch(globalAlertType("error", error));
      },
    });
  };

  //Change pin number
  const { mutateAsync: pinMutateAsync, isLoading: pinIsLoading } = useMutation({
    mutationFn: updateWalletPin,
  });

  const handleChangePin = () => {
    if (pin.trim() === "") {
      setPinErr("Required!");
      return;
    }
    if (!verifyPin(pin)) {
      setPinErr("Invalid Pin! Pin Should be 4-digit number.");
      return;
    }

    const sanitizedPin = DOMPurify.sanitize(pin?.trim());

    const data = {
      _id: user?.id,
      pin: sanitizedPin,
    };

    Swal.fire({
      title: "Updating Wallet Pin",
      text: `Procceed with changes?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        pinMutateAsync(data, {
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            handleClose();
            setPin("");
            setToken("");
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const handleClose = () => {
    setSearchParams((params) => {
      params.delete("view_pin");
      params.delete("v_no");
      params.delete("generated");
      return params;
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("view_pin"))}
      maxWidth="xs"
      fullWidth
    >
      <CustomDialogTitle
        // title="Details"
        onClose={handleClose}
        title={
          searchParams.get("v_no") !== null
            ? "Wallet Pin"
            : showOTP
            ? "Confirm Phone Number"
            : "Verify Your Identity"
        }
      />
      <DialogContent sx={{ p: 2 }}>
        {searchParams.get("v_no") !== null ? (
          <>
            <Stack spacing={2} py={2}>
              <Typography
                variant="caption"
                fontStyle="italic"
                color="secondary"
                paragraph
              >
                Enter a four(4) digit wallet pin.
              </Typography>
              <TextField
                type="number"
                inputMode="number"
                variant="outlined"
                label="New Wallet Pin"
                fullWidth
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                error={pinErr !== ""}
                helperText={pinErr}
                margin="dense"
              />

              <LoadingButton
                variant="contained"
                fullWidth
                disabled={pinIsLoading}
                loading={pinIsLoading}
                onClick={handleChangePin}
              >
                Change Pin
              </LoadingButton>
            </Stack>
          </>
        ) : showOTP ? (
          <>
            <Stack
              justifyContent="center"
              alignItems="center"
              spacing={2}
              py={2}
            >
              <Typography textAlign="center" variant="body2" paragraph pb={4}>
                A verification code has been sent to the mobile number
                associated with this account. Please verify the code before you
                can change your <b>Mobile Number.</b>
              </Typography>
              <TextField
                size="small"
                type="number"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                error={Boolean(err)}
                helperText={err}
                margin="dense"
                sx={{ textAlign: "center", width: 200 }}
                // onPaste={handleSubmit}
              />

              {/* <OTPInput /> */}

              <LoadingButton
                size="small"
                variant="contained"
                fullWidth
                disabled={isLoading}
                loading={isLoading}
                sx={{ width: 200 }}
                onClick={handleSubmit}
              >
                Verify
              </LoadingButton>
            </Stack>
          </>
        ) : (
          <>
            <Typography
              variant="caption"
              fontStyle="italic"
              color="secondary"
              paragraph
            >
              To change your wallet pin,your are required to verify any of the
              personal information below.
            </Typography>

            <RadioGroup
              value={option}
              onChange={(e, value) => {
                setErr("");
                setOption(value);
              }}
              sx={{
                px: 2,
                borderRadius: 1,
                fontSize: 14,
              }}
              row
            >
              <FormControlLabel
                label="Date Of Birth"
                value="dob"
                control={<Radio size="small" />}
              />

              <FormControlLabel
                label="National ID"
                value="nid"
                control={<Radio size="small" />}
              />
            </RadioGroup>

            <Stack spacing={2} py={4}>
              {option === "dob" && (
                <CustomDatePicker
                  format="Do MMMM YYYY"
                  label="Date Of Birth"
                  value={dob}
                  setValue={setDob}
                  error={err !== ""}
                  helperText={err}
                  minDate={moment("1900-01-01")}
                  disableFuture={true}
                />
              )}

              {option === "nid" && (
                <TextField
                  size="small"
                  variant="outlined"
                  label="National ID"
                  fullWidth
                  required
                  value={nid}
                  onChange={(e) => setNid(e.target.value)}
                  error={err !== ""}
                  helperText={err}
                  margin="dense"
                />
              )}

              <LoadingButton
                size="small"
                variant="contained"
                fullWidth
                disabled={verifyIsLoading}
                loading={verifyIsLoading}
                onClick={handleVerifyIdentity}
              >
                Verify
              </LoadingButton>
            </Stack>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ChangePin;
