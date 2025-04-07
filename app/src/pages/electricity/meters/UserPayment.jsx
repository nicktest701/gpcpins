import {
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import Swal from "sweetalert2";
import { useContext, useState } from "react";
import { currencyFormatter } from "../../../constants";
import CheckOutItem from "../../../components/items/CheckOutItem";
import { CustomContext } from "../../../context/providers/CustomProvider";
import Transition from "../../../components/Transition";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { LoadingButton } from "@mui/lab";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeElectricityPayment } from "../../../api/paymentAPI";
import { useLocation, useNavigate } from "react-router-dom";
import { globalAlertType } from "../../../components/alert/alertType";
import { AuthContext } from "../../../context/providers/AuthProvider";
import DOMPurify from "dompurify";
import { disableWallet, getWalletStatus } from "../../../api/userAPI";
import { verifyPin } from "../../../config/validation";

function UserPayment() {
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const {
    customState: { verifyMeter },
    customDispatch,
  } = useContext(CustomContext);

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  // Get wallet status
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && verifyMeter.details?.isWallet,
  });

  const handleClose = () => {
    customDispatch({
      type: "openVerifyMeter",
      payload: {
        open: false,
        details: {},
      },
    });
  };

  const goBack = () => {
    Swal.fire({
      title: "Canceling",
      text: `Do you want to cancel transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        customDispatch({
          type: "openViewMeter",
          payload: {
            open: true,
            details: { ...verifyMeter?.details },
          },
        });

        handleClose();
      }
    });
  };

  //Make Payment
  const { mutate, isLoading } = useMutation({
    mutationFn: makeElectricityPayment,
    retry: false,
  });

  const makePayment = () => {
    // console.log(verifyMeter.details);
    if (verifyMeter.details?.isWallet) {
      if (token.trim() === "") {
        return setErr("Pin is required*");
      }
      if (token.trim().length !== 4 || !verifyPin(token?.trim())) {
        return setErr("Please enter a valid pin!");
      }

      const walletBalance = queryClient.getQueryData(
        ["wallet-balance", user?.id],
        {
          exact: true,
        }
      );

      if (Number(walletBalance) < Number(verifyMeter.details?.amount)) {
        // if (Number(walletBalance) < Number(100000)) {
        customDispatch(
          globalAlertType(
            "error",
            "Insufficient Wallet Balance.Please request for a top up."
          )
        );
        return;
      }
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with payment?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        // console.log(user);
        const meterInfo = {
          user: user?.id,
          meter: verifyMeter.details?._id,
          info: {
            amount: DOMPurify.sanitize(Number(verifyMeter.details?.amount)),
            email: DOMPurify.sanitize(verifyMeter.details?.email),
            mobileNo:
              DOMPurify.sanitize(verifyMeter.details?.mobileNo) ||
              user?.phonenumber,
            provider: verifyMeter.details?.provider,
          },
          amount: DOMPurify.sanitize(Number(verifyMeter.details?.amount)),
          topup: DOMPurify.sanitize(Number(verifyMeter.details?.topup)),
          charges: DOMPurify.sanitize(Number(verifyMeter.details?.charges)),
          isWallet: verifyMeter.details?.isWallet,
          token,
        };

        mutate(meterInfo, {
          onSuccess: (data) => {
            if (data) {
              handleClose();

              navigate(`/confirm`, {
                replace: true,
                state: {
                  _id: data?._id,
                  type: "prepaid",
                  path: pathname,
                  isWallet: verifyMeter.details?.isWallet,
                },
              });
            }
          },
          onError: async (error) => {
            if (error === "Invalid pin!") {
              setFailCount((prevState) => prevState - 1);

              if (failureCount <= 3) {
                setErr(`${error} .${failureCount - 1} attempt(s) left.`);
                if (failureCount <= 1) {
                  await disableWallet();
                }
              } else {
                setErr(error);
              }
            } else {
              customDispatch(globalAlertType("error", error));
            }
          },
        });
      }
    });
  };

  return (
    <Dialog
      open={verifyMeter.open}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
    >
      {verifyMeter.details?.isWallet && isLoadingWalletStatus ? (
        <Stack justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {verifyMeter.details?.isWallet &&
          (failureCount <= 0 || !data?.active) ? (
            <Stack p={4} alignItems="center" spacing={1}>
              <Typography variant="h6" paragraph>
                Wallet Account Disabled
              </Typography>
              <Typography variant="caption">
                Please contact us for further assistance.
              </Typography>
              {data?.timeOut && (
                <>
                  <span>OR</span>
                  <Typography variant="caption">
                    Try again in{" "}
                    <span style={{ color: "red" }}>{data?.timeOut}</span>
                  </Typography>
                </>
              )}
              <Button onClick={handleClose}>Go Back</Button>
            </Stack>
          ) : (
            <>
              <CustomDialogTitle title="Payment Details" onClose={goBack} />

              <DialogContent>
                {!isLoading ? (
                  <>
                    {/* <Stack justifyContent="center" alignItems="center">
                      <Typography variant="caption" paragraph>
                        Verify to make sure the information provided is
                        accurate.
                      </Typography>
                    </Stack>
                    <Divider /> */}
                    <Stack
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        rowGap: 1,
                        marginY: 2,
                        width: "100%",
                      }}
                    >
                      <CheckOutItem
                        title="Meter No."
                        value={verifyMeter?.details?.number}
                      />
                        <CheckOutItem
                          title="Type"
                          value={verifyMeter?.details?.type}
                        />
                      <CheckOutItem
                        title="Name"
                        value={verifyMeter?.details?.name}
                      />
                      <CheckOutItem
                        title="Payment Method"
                        value={
                          verifyMeter?.details?.isWallet
                            ? "Wallet"
                            : "Mobile Money"
                        }
                      />
                      {!verifyMeter?.details?.isWallet && (
                        <CheckOutItem
                          title="Mobile No."
                          value={verifyMeter?.details?.mobileNo}
                        />
                      )}
                      <CheckOutItem
                        title="Email"
                        value={verifyMeter?.details?.email}
                      />
                      <Divider />

                      <CheckOutItem
                        title="Top Up Amount"
                        value={currencyFormatter(verifyMeter?.details?.topup)}
                      />
                      <CheckOutItem
                        title="Charges"
                        value={currencyFormatter(verifyMeter?.details?.charges)}
                      />
                      <CheckOutItem
                        title=" Total Amount"
                        value={currencyFormatter(verifyMeter?.details?.amount)}
                      />
                    </Stack>
                    <Divider />
                    {verifyMeter.details?.isWallet && (
                      <Stack py={2}>
                        <Typography variant="body2" fontWeight="bold">
                          Wallet Pin
                        </Typography>

                        <TextField
                          size="small"
                          type="password"
                          inputMode="numeric"
                          placeholder="Enter 4-digit pin"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          error={Boolean(err)}
                          helperText={err}
                          margin="dense"
                          sx={{ textAlign: "center", width: 180 }}
                        />
                      </Stack>
                    )}
                  </>
                ) : (
                  <Stack py={2} alignItems="center" spacing={2}>
                    <CircularProgress size={30} />
                    <p>Processing...</p>
                  </Stack>
                )}
              </DialogContent>
              <DialogActions sx={{ justifyContent: "center", px: 2 }}>
                <LoadingButton
                  loading={isLoading}
                  variant="contained"
                  onClick={makePayment}
                  fullWidth
                >
                  Make Payment
                </LoadingButton>
              </DialogActions>
            </>
          )}
        </>
      )}
    </Dialog>
  );
}

export default UserPayment;
