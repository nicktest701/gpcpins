import { useContext, useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import Swal from "sweetalert2";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CustomContext } from "../../context/providers/CustomProvider";
import { currencyFormatter, getCode } from "../../constants";
import { makeAirtimeTransaction } from "../../api/paymentAPI";
import VoucherPlaceHolderItem from "../items/VoucherPlaceHolderItem";
import { globalAlertType } from "../alert/alertType";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import { disableWallet, getNonUser, getWalletStatus } from "../../api/userAPI";
import { AuthContext } from "../../context/providers/AuthProvider";
import { verifyPin } from "../../config/validation";
import { CircularProgress } from "@mui/material";

function AirtimePaymentDetails() {
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const [pricingList, setPricingList] = useState([]);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  const isWallet =
    searchParams.get("preload") === "3e6810ec81036d2f7088231351b3097b";
  // Get wallet status
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: () => getWalletStatus(),
    enabled: !!user?.id && isWallet,
  });

  useEffect(() => {
    if (searchParams.get("info") !== null) {
      setPricingList(JSON.parse(searchParams.get("info")));
    }
  }, [searchParams]);

  //Make Payment
  const paymentMutate = useMutation({
    mutationFn: makeAirtimeTransaction,
    retry: false,
  });

  const { mutateAsync, isSuccess, isLoading } = useMutation({
    mutationFn: getNonUser,
    retry: false,
  });

  const handlePayment = () => {
    if (!searchParams.get("type")) {
      navigate("/airtime", { replace: true });
      return;
    }

    if (isWallet) {
      if (token.trim() === "") {
        return setErr("Pin is required*");
      }
      if (token.trim().length !== 4 || !verifyPin(token?.trim())) {
        return setErr("Please enter a valid pin!");
      }
    }

    const payload = {
      amount: sessionStorage.getItem("value-x"),
      recipient: searchParams.get("recipient"),
      phonenumber: searchParams.get("phonenumber") || user?.phonenumber,
      email: searchParams.get("email") || user?.email,
      provider: searchParams.get("provider"),
      type: searchParams.get("type"),
      isWallet: isWallet,
    };

    if (isWallet) {
      payload.token = token.trim();
    }

    if (searchParams.get("type") === "Bulk") {
      payload.pricing = searchParams.get("info");
    }

    if (searchParams.get("type") === "Bundle") {
      payload.plan = {
        id: searchParams.get("plan_id"),
        name: searchParams.get("plan_name"),
        volume: searchParams.get("plan_volume"),
      };
    }

    // Check if user exists
    if (!user?.id) {
      mutateAsync({});
      if (isSuccess) {
        paymentMutate.mutateAsync(payload, {
          onSettled: () => {},
          onSuccess: (data) => {
            sessionStorage.removeItem("value-x");
            if (data) {
              navigate(`/confirm`, {
                replace: true,
                state: {
                  _id: data?._id,
                  type:
                    searchParams.get("type") === "Bundle"
                      ? "bundle"
                      : "airtime",
                  path: pathname,
                  isWallet: payload?.isWallet,
                },
              });
            }
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    } else {
      paymentMutate.mutateAsync(payload, {
        onSettled: () => {},
        onSuccess: (data) => {
          sessionStorage.removeItem("value-x");
          if (data) {
            navigate(`/confirm`, {
              replace: true,
              state: {
                _id: data?._id,
                type:
                  searchParams.get("type") === "Bundle" ? "bundle" : "airtime",
                path: pathname,
                isWallet: payload?.isWallet,
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
  };

  //close Payment Details

  const handleClose = () => {
    Swal.fire({
      title: "Processing",
      text: `Do you want to cancel transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        paymentMutate.reset();
        handleGoBack();
      }
    });
  };

  const handleGoBack = () => {
    customDispatch({
      type: "set_Airtime_Bundle_Amount",
      payload: 0,
    });
    navigate("/airtime", { replace: true });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("open-preview"))}
      maxWidth="xs"
      fullWidth
    >
      {isWallet && isLoadingWalletStatus ? (
        <Stack justifyContent="center" alignItems="center" height={200}>
          <CircularProgress />
        </Stack>
      ) : (
        <>
          {isWallet && (failureCount <= 0 || !data?.active) ? (
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
                title="Payment Details"
                subtitle="Overview of Payment Information"
                onClose={!paymentMutate.isLoading ? handleClose : () => {}}
              />
              <DialogContent>
                <Stack spacing={1} paddingY={2}>
                  {searchParams.get("bulk") ? (
                    <div
                      style={{
                        paddingBlock: "16px",
                        borderBottom: "1px solid lightgray",
                      }}
                    >
                      <Typography variant="caption">Recipients</Typography>
                      {pricingList.map((item) => {
                        return (
                          <VoucherPlaceHolderItem
                            key={item?.id}
                            title={`${item?.type} (${item?.recipient})`}
                            value={currencyFormatter(item?.price)}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <VoucherPlaceHolderItem
                      title="Recipient Number"
                      value={searchParams.get("recipient")}
                      img={
                        <Avatar
                          src={getCode(searchParams.get("recipient")).image}
                          variant="square"
                          sx={{ width: 40, height: 20, alignSelf: "center" }}
                        />
                      }
                    />
                  )}
                  {searchParams.get("plan_name") && (
                    <VoucherPlaceHolderItem
                      title="Bundle Type"
                      value={searchParams.get("plan_name")}
                    />
                  )}
                  {searchParams.get("plan_volume") && (
                    <VoucherPlaceHolderItem
                      title="Bundle Volume"
                      value={searchParams.get("plan_volume")}
                    />
                  )}

                  <VoucherPlaceHolderItem
                    title="Amount"
                    value={currencyFormatter(sessionStorage.getItem("value-x"))}
                  />
                  <VoucherPlaceHolderItem
                    title="Payment Method"
                    value={
                      searchParams.get("preload") ===
                      "3e6810ec81036d2f7088231351b3097b"
                        ? "Wallet"
                        : "Mobile Money"
                    }
                  />
                  {searchParams.get("preload") !==
                    "3e6810ec81036d2f7088231351b3097b" && (
                    <VoucherPlaceHolderItem
                      title="Mobile Number"
                      value={searchParams.get("phonenumber")}
                      img={
                        <Avatar
                          src={getCode(searchParams.get("phonenumber")).money}
                          variant="square"
                          sx={{ width: 40, height: 20, alignSelf: "center" }}
                        />
                      }
                    />
                  )}
                  {searchParams.get("bulk") && (
                    <VoucherPlaceHolderItem
                      title="Email Address"
                      value={searchParams.get("email")}
                    />
                  )}
                </Stack>

                {isWallet && (
                  <Stack py={2}>
                    <Typography variant="h6">Wallet Pin</Typography>

                    <TextField
                      size="small"
                      type="number"
                      inputMode="numeric"
                      placeholder="Enter 4-digit pin"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      error={Boolean(err)}
                      helperText={err}
                      margin="dense"
                      sx={{ textAlign: "center", width: 200 }}
                    />
                  </Stack>
                )}

                <LoadingButton
                  variant="contained"
                  onClick={handlePayment}
                  fullWidth
                  loading={isLoading || paymentMutate.isLoading}
                  sx={{ my: 2 }}
                  disabled={
                    Number(sessionStorage.getItem("value-x")) !==
                    Number(searchParams.get("amount"))
                  }
                >
                  {isLoading || paymentMutate.isLoading
                    ? "Please Wait..."
                    : " Pay"}
                </LoadingButton>
              </DialogContent>
            </>
          )}
        </>
      )}
    </Dialog>
  );
}

export default AirtimePaymentDetails;
