import { useContext, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  Stack,
  Typography,
  CircularProgress,
  Divider,
  Button,
  TextField,
} from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import CheckOutItem from "../../../components/items/CheckOutItem";
import { currencyFormatter } from "../../../constants";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import Transition from "../../../components/Transition";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { makeElectricityPayment } from "../../../api/paymentAPI";
import { globalAlertType } from "../../../components/alert/alertType";
import {
  disableWallet,
  getNonUser,
  getWalletStatus,
} from "../../../api/userAPI";
import { AuthContext } from "../../../context/providers/AuthProvider";
import { verifyPin } from "../../../config/validation";

function NonUserPayment() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const { meterName, meterNo } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const {
    customState: { verifyPrepaid },
    customDispatch,
  } = useContext(CustomContext);

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  // Get wallet status
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && verifyPrepaid.details?.isWallet,
  });

  //Make Payment
  const { mutate, reset, isLoading } = useMutation({
    mutationFn: makeElectricityPayment,
    retry: false,
  });

  const { mutateAsync } = useMutation({
    mutationFn: () => getNonUser(),
  });

  const makePayment = () => {
    if (verifyPrepaid.details?.isWallet) {
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

      if (Number(walletBalance) < Number(verifyPrepaid.details?.amount)) {
        customDispatch(
          globalAlertType(
            "error",
            "Insufficient Wallet Balance.Please request for a top up."
          )
        );
        return;
      }
      verifyPrepaid.details.token = token;
    }

    //Check if user exists

    if (!user?.id) {
      mutateAsync({});
    }
    Swal.fire({
      title: "Processing",
      text: `Proceed with payment?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutate(verifyPrepaid.details, {
          onSuccess: (data) => {
            if (data) {
              handleGoBack();
              navigate(`/confirm`, {
                replace: true,
                state: {
                  _id: data?._id,
                  type: "prepaid",
                  path: pathname,
                  isWallet: verifyPrepaid.details?.isWallet,
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

  //close dialog
  const handleClose = () => {
    Swal.fire({
      title: "Canceling",
      text: `Do you want to cancel transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        reset();
        handleGoBack();
      }
    });
  };

  const handleGoBack = () => {
    customDispatch({
      type: "openVerifyPrepaid",
      payload: {
        open: false,
      },
    });
  };

  return (
    <Dialog
      open={verifyPrepaid.open}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
    >
      {verifyPrepaid.details?.isWallet && isLoadingWalletStatus ? (
        <Stack justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {verifyPrepaid.details?.isWallet &&
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
              <Button onClick={handleGoBack}>Go Back</Button>
            </Stack>
          ) : (
            <>
              <CustomDialogTitle
                title="Payment details"
                onClose={!isLoading && handleClose}
              />
              <DialogContent>
                {!isLoading ? (
                  <>
                    {/* <Stack justifyContent="center" alignItems="center">
                      <Typography
                        variant="caption"
                        paragraph
                        textAlign="center"
                      >
                        Verify to make sure the information provided is
                        accurate.
                      </Typography>
                    </Stack> */}

                    {/* <Divider /> */}
                    <Stack
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        rowGap: 1,
                        marginY: 2,
                        width: "100%",
                      }}
                    >
                      <>
                        <CheckOutItem
                          title="Meter No."
                          value={
                            verifyPrepaid?.details?.meter?.number || meterNo
                          }
                        />
                        <CheckOutItem title=" Type" value="PREPAID(IMES)" />
                        <CheckOutItem
                          title="Name"
                          value={
                            verifyPrepaid?.details?.meter?.name || meterName
                          }
                        />
                        {verifyPrepaid?.details?.district && (
                          <CheckOutItem
                            title="District"
                            value={verifyPrepaid?.details?.district}
                          />
                        )}
                        <CheckOutItem
                          title="Payment Method"
                          value={
                            verifyPrepaid?.details?.isWallet
                              ? "Wallet"
                              : "Mobile Money"
                          }
                        />
                        {!verifyPrepaid?.details?.isWallet && (
                          <CheckOutItem
                            title="Mobile No."
                            value={verifyPrepaid?.details?.info?.mobileNo}
                          />
                        )}
                        <CheckOutItem
                          title="Email"
                          value={verifyPrepaid?.details?.info?.email}
                        />

                        <Divider />

                        <CheckOutItem
                          title="Top Up Amount"
                          value={currencyFormatter(
                            verifyPrepaid?.details?.topup
                          )}
                        />
                        <CheckOutItem
                          title="Charges"
                          value={currencyFormatter(
                            verifyPrepaid?.details?.charges
                          )}
                        />
                        <CheckOutItem
                          title=" Total Amount"
                          value={currencyFormatter(
                            verifyPrepaid?.details?.amount
                          )}
                        />
                      </>
                    </Stack>
                    <Divider />

                    {verifyPrepaid.details?.isWallet && (
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

export default NonUserPayment;
