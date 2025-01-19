import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import moment from "moment";
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import { verifyCode } from "../../config/validation";
import { getPhoneNumberToken, verifyUserIdentity } from "../../api/agentAPI";
import CustomDatePicker from "../inputs/CustomDatePicker";

function ResetPhoneNumber() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showOTP, setShowOTP] = useState(false);
  const [option, setOption] = useState("dob");
  const [nid, setNid] = useState("");
  const [dob, setDob] = useState(moment());
  const [err, setErr] = useState("");
  const [token, setToken] = useState("");

  //Send mobile number verification token
  const sendToken = useQuery({
    queryFn: getPhoneNumberToken,
    queryKey: ["verify-phone-number"],
    enabled: false,
    // enabled: showOTP && searchParams.get("generated") === null,
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
        handleOnClose();
        navigate("/profile/updates/phonenumber", {
          state: {
            phonenumber: "phone",
          },
        });
      },
      onError: (error) => {
        setErr(error);
      },
    });
  };

  //Change phone number
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

  const handleOnClose = () => {
    setSearchParams((params) => {
      params.delete("v_no");
      params.delete("generated");
      params.delete("x_token");
      return params;
    });
  };

  return (
    <Dialog open={Boolean(searchParams.get("x_token"))} maxWidth="xs" fullWidth>
      <CustomDialogTitle
        onClose={handleOnClose}
        title={showOTP ? "Confirm Phone Number" : "Verify Your Identity"}
      />
      <DialogContent>
        {showOTP ? (
          <>
            <Stack
              justifyContent="center"
              alignItems="center"
              spacing={2}
              p={2}
            >
              <Typography textAlign="center" variant="body2" paragraph pb={4}>
                A verification code has been sent to the number associated with
                this account. Please verify the code before you can change your{" "}
                <b>Mobile Number.</b>
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
              To change your phone number,your are required to verify any of the
              personal information below.
            </Typography>

            <RadioGroup
              row
              value={option}
              onChange={(e, value) => {
                setErr("");
                setOption(value);
              }}
              sx={{
                py: 2,
                borderRadius: 1,
                fontSize: 14,
              }}
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

export default ResetPhoneNumber;
