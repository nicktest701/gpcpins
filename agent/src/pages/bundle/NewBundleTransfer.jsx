import {
  Dialog,
  DialogContent,
  Box,
  TextField,
  Stack,
  CircularProgress,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import Swal from "sweetalert2";
import Autocomplete from "@mui/material/Autocomplete";
import LoadingButton from "@mui/lab/LoadingButton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialogTitle from "@/components/dialogs/CustomDialogTitle";
import { useSearchParams } from "react-router-dom";
import { useContext, useState } from "react";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "@/constants/PhoneCode";
import ServiceProvider from "@/components/ServiceProvider";
import { disableWallet, getWalletStatus, sendBundle } from "@/api/agentAPI";
import { CustomContext } from "@/context/providers/CustomProvider";
import { globalAlertType } from "@/components/alert/alertType";
import { getBundleList } from "@/api/paymentAPI";
import { currencyFormatter } from "@/constants";
import { useEffect } from "react";
import { AuthContext } from "@/context/providers/AuthProvider";
import { verifyPin } from "@/config/validation";

const NewBundleTransfer = () => {
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [bundle, setBundle] = useState({
    plan_id: "",
    plan_name: "",
    type: "",
    volume: "",
    price: "",
  });

  const [providerErr, setProviderErr] = useState("");
  const [phoneNumberErr, setPhoneNumberErr] = useState("");
  const [confirmPhoneNumberErr, setConfirmPhoneNumberErr] = useState("");
  const [bundleErr, setBundleErr] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);
  const [showPinPage, setShowPinPage] = useState(false);

  // Get wallet status and non-user information
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: getWalletStatus,
    enabled: !!user?.id,
  });

  const bundles = useQuery({
    queryKey: ["bundle-list", provider],
    queryFn: () =>
      getBundleList(
        provider === "MTN"
          ? "4"
          : provider === "Vodafone"
          ? "6"
          : provider === "AirtelTigo"
          ? "1"
          : 0
      ),
    enabled: !!provider,
    initialData: [],
  });

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const confirmationMessage = "Are you sure you want to leave?";
      e.returnValue = confirmationMessage; // For IE and Firefox prior to version 4
      return confirmationMessage; // For Safari and modern browsers
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    setBundle({
      plan_id: "",
      plan_name: "",
      type: "",
      volume: "",
      price: "",
    });
  }, [provider]);

  const { mutateAsync, isLoading } = useMutation({ 
    mutationFn: sendBundle,
    retry:false,
     
  });
  const handleSubmit = () => {
    setProviderErr("");
    setConfirmPhoneNumberErr("");
    setPhoneNumberErr("");
    setBundleErr("");
    if (provider === "None") {
      setProviderErr("Required*");
      return;
    }

    if (!bundle.plan_name) {
      setBundleErr("Please select a plan*");
      return;
    }

    if (phoneNumber === "") {
      setPhoneNumberErr("Required*");
      return;
    }

    const internationalNumber = getInternationalMobileFormat(phoneNumber);
    const internationalConfirmNumber =
      getInternationalMobileFormat(confirmPhoneNumber);
    if (!isValidPartner(provider, internationalNumber)) {
      setPhoneNumberErr(`Invalid ${provider} number`);
      return;
    }

    if (internationalNumber !== internationalConfirmNumber) {
      setConfirmPhoneNumberErr(`Recipient numbers do not match!`);
      return;
    }

    setShowPinPage(true);
  };

  const handleSubmitPayload = () => {
    setErr("");
    if (token.trim() === "") {
      return setErr("Pin is required*");
    }
    if (token.trim().length !== 4 || !verifyPin(token?.trim())) {
      return setErr("Please enter a valid pin!");
    }

    const internationalNumber = getInternationalMobileFormat(phoneNumber);

    const values = {
      recipient: internationalNumber,
      network: provider,
      bundle,
      token,
    };

    const walletBalance = queryClient.getQueryData(["wallet-balance"], {
      exact: true,
    });

    if (Number(walletBalance) < values.amount) {
      customDispatch(
        globalAlertType(
          "error",
          "Insufficient Wallet Balance.Please request for a top up."
        )
      );
      return;
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(values, {
          onSettled: () => {
            setToken("");
            queryClient.invalidateQueries(["agent-bundle-transactions"]);
            queryClient.invalidateQueries(["wallet-balance"]);
            queryClient.invalidateQueries(["notifications"]);
          },
          onSuccess: (data) => {
            handleClearFields();

            Swal.fire({
              icon: "success",
              title: "Transfer Successful",
              text: data || "Transaction Completed!",
              showCancelButton: false,
            });

            setSearchParams((params) => {
              params.delete("data");
              params.delete("bundle-prompt");
              return params;
            });
            setShowPinPage(false);
          },
          onError: async (error) => {
            if (error === "Invalid pin!") {
              setFailCount((prevState) => prevState - 1);

              if (failureCount <= 3) {
                setErr(`${error} ${failureCount - 1} attempt(s) left.`);
                if (failureCount <= 1) {
                  await disableWallet();
                }
              } else {
                setErr(error);
              }
            } else {
              handleClearFields();
              Swal.fire({
                icon: "error",
                title: "Transfer Failed!",
                text: error || "An unknown error has occurred!",
                showCancelButton: false,
              });
              // customDispatch(globalAlertType("error", error));
            }
          },
        });
      }
    });
  };

  const handleClose = () => {
    Swal.fire({
      title: "Exiting",
      text: `Cancel Transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setSearchParams((params) => {
          params.delete("data");
          params.delete("bundle-prompt");
          return params;
        });

        handleClearFields();
      }
    });
  };

  const handleGoback = () => setShowPinPage(false);

  const handleClearFields = () => {
    setShowPinPage(false);
    setSearchParams((params) => {
      params.delete("data");
      params.delete("bundle-prompt");
      return params;
    });
    setPhoneNumber("");
    setConfirmPhoneNumber("");
    setProvider("");
    setToken("");
    setFailCount(3);
    setToken("");
    setBundle({
      plan_id: "",
      plan_name: "",
      type: "",
      volume: "",
      price: "",
    });
  };
  return (
    <Dialog
      open={Boolean(searchParams.get("bundle-prompt"))}
      maxWidth="sm"
      fullWidth
    >
      <CustomDialogTitle
        title={showPinPage ? "Confirm Pin" : "New Transfer"}
        subtitle="Transfer bundle to all networks with ease"
        onClose={handleClose}
      />

      <DialogContent sx={{ px: 2 }}>
        {showPinPage ? (
          <>
            {isLoadingWalletStatus ? (
              <Stack justifyContent="center" alignItems="center" height={200}>
                <CircularProgress />
              </Stack>
            ) : failureCount <= 0 || !data?.active ? (
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
                <Button onClick={handleGoback}>Go Back</Button>
              </Stack>
            ) : (
              <Stack py={2} spacing={2}>
                <IconButton
                  sx={{ alignSelf: "flex-start" }}
                  onClick={() => setShowPinPage(false)}
                >
                  <ArrowBack />
                </IconButton>

                <Typography variant="h6">Wallet Pin</Typography>

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
                  sx={{ textAlign: "center", width: 200 }}
                />
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                  onClick={handleSubmitPayload}
                  fullWidth
                  size="small"
                >
                  Make Transfer
                </LoadingButton>
              </Stack>
            )}
          </>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              py: 2,
            }}
          >
            <ServiceProvider
              label="Network Type"
              size="small"
              value={provider}
              setValue={setProvider}
              error={providerErr !== ""}
              helperText={providerErr}
            />
            <Autocomplete
              options={bundles.data}
              loading={bundles?.isLoading}
              size="small"
              closeText=" "
              disableClearable
              value={bundle}
              fullWidth
              onChange={(e, value) => setBundle(value)}
              isOptionEqualToValue={(option, value) =>
                value?.plan_id === undefined ||
                value?.plan_id === null ||
                value?.plan_id === "" ||
                option?.plan_id === value?.plan_id
              }
              getOptionLabel={(option) =>
                `${option?.plan_name}---${option?.volume}---${currencyFormatter(
                  option?.price
                )}` || ""
              }
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    label="Available Bundle Plan"
                    size="small"
                    fullWidth
                    error={bundleErr ? true : false}
                    helperText={bundleErr}
                  />
                );
              }}
            />
            <TextField
              size="small"
              type="tel"
              inputMode="tel"
              variant="outlined"
              label="Recipient Number"
              fullWidth
              required
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              error={phoneNumberErr ? true : false}
              helperText={phoneNumberErr}
              margin="dense"
            />
            <TextField
              size="small"
              type="tel"
              inputMode="tel"
              variant="outlined"
              label="Confirm Recipient Number"
              fullWidth
              required
              value={confirmPhoneNumber}
              onChange={(e) => setConfirmPhoneNumber(e.target.value)}
              error={confirmPhoneNumberErr ? true : false}
              helperText={confirmPhoneNumberErr}
              margin="dense"
            />

            <LoadingButton
              type="submit"
              variant="contained"
              loading={isLoading}
              onClick={handleSubmit}
              fullWidth
              size="large"
              sx={{ mt: 2 }}
            >
              Transfer Now
            </LoadingButton>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewBundleTransfer;
