import {
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  Tab,
  Input,
  Typography,
  List,
  ListItemText,
  ListItem,
  Stack,
  Alert,
  InputLabel,
  Box,
  CircularProgress,
  Button,
  IconButton,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import Swal from "sweetalert2";
import LoadingButton from "@mui/lab/LoadingButton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { useSearchParams } from "react-router-dom";
import { useContext, useState } from "react";
import {
  getInternationalMobileFormat,
  isValidPartner,
} from "../../constants/PhoneCode";
import ServiceProvider from "../../components/ServiceProvider";
import {
  getWalletStatus,
  disableWallet,
  sendAirtime,
  downloadAirtimeTemplate,
} from "../../api/agentAPI";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { readXLSX } from "../../config/readXLSX";
import { readCSV } from "../../config/readCSV";
import { currencyFormatter } from "../../constants";
import { useEffect } from "react";
import { AuthContext } from "../../context/providers/AuthProvider";
import { verifyPin } from "../../config/validation";

const CSV_FILE_TYPE = "text/csv";
const XLSX_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLS_FILE_TYPE = "application/vnd.ms-excel";
const NewTransfer = () => {
  const [dataPath, setDataPath] = useState("");
  const [content, setContent] = useState([]);
  const [contentErr, setContentErr] = useState("");
  const { user } = useContext(AuthContext);
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(
    "ab1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
  );
  const [airtimeType, setAirtimeType] = useState("single");
  const [showPinPage, setShowPinPage] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPhoneNumber, setConfirmPhoneNumber] = useState("");
  const [provider, setProvider] = useState("");
  const [providerErr, setProviderErr] = useState("");
  const [phoneNumberErr, setPhoneNumberErr] = useState("");
  const [confirmPhoneNumberErr, setConfirmPhoneNumberErr] = useState("");
  const [amount, setAmount] = useState(1);
  const [amountErr, setAmountErr] = useState("");
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [failureCount, setFailCount] = useState(3);

  // Get wallet status and non-user information
  const { data, isLoading: isLoadingWalletStatus } = useQuery({
    queryKey: ["wallet-status"],
    queryFn: getWalletStatus,
    enabled: !!user?.id,
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

  const handleClose = () => {
    Swal.fire({
      title: "Exiting",
      text: `Cancel Transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setSearchParams((params) => {
          params.delete("data");
          params.delete("airtime-prompt");
          return params;
        });

        handleClearFields();
      }
    });
  };

  const handleGoback = () => setShowPinPage(false);

  //LOAD Checkers from file excel,csv
  function handleLoadFile(e) {
    Swal.fire({
      title: "Loading Pins & Serials",
      text: "Please Wait!",
      showConfirmButton: false,
    });
    // setIsLoading(true);
    const files = e.target.files[0];

    try {
      const reader = new FileReader();
      files.type === CSV_FILE_TYPE
        ? reader.readAsText(files, "utf-8")
        : reader.readAsArrayBuffer(files);

      reader.onload = function (event) {
        let checkers = [];

        if (files.type === XLSX_FILE_TYPE || files.type === XLS_FILE_TYPE) {
          checkers = readXLSX(event.target.result);
        }

        if (files.type === CSV_FILE_TYPE) {
          checkers = readCSV(event.target.result);
        }

        // console.log({
        //   meta: _.uniq(checkers?.flatMap(Object.keys)),
        //   data: checkers,
        // });

        setDataPath(files.name);
        setContent(checkers);
      };

      Swal.close();
    } catch (error) {
      customDispatch(globalAlertType("error", error));
    }
  }

  const handleSubmit = () => {
    setAirtimeType("single");
    setProviderErr("");
    setPhoneNumberErr("");
    setConfirmPhoneNumberErr("");
    setAmountErr("");
    if (provider === "None") {
      setProviderErr("Required*");
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

    if (amount === "") {
      setAmountErr("Required*");
      return;
    }
    if (Number(amount) < 1) {
      setAmountErr("Minimum amount you can transfer is GH₵1 ");
      return;
    }

    setShowPinPage(true);
  };

  // Bulk Transfer
  const handleSubmitBulkAirtime = () => {
    setAirtimeType("bulk");
    if (content?.length === 0) {
      setContentErr("List Empty*");
      return;
    }

    const isAmountLessThanOne = content.some(
      (item) => Number(item?.amount) < 1
    );

    if (isAmountLessThanOne) {
      setContentErr(
        "Minimum amount of airtime you can transfer is GHS 1. Some of your fields have amount less than GHS 1!"
      );
      return;
    }

    setShowPinPage(true);
  };

  const { mutateAsync, isLoading } = useMutation({ mutationFn: sendAirtime });

  const handleSubmitPayload = () => {
    setErr("");
    if (token.trim() === "") {
      return setErr("Pin is required*");
    }
    if (token.trim().length !== 4 || !verifyPin(token?.trim())) {
      return setErr("Please enter a valid pin!");
    }

    let payload;
    if (airtimeType === "single") {
      const internationalNumber = getInternationalMobileFormat(phoneNumber);

      payload = {
        recipient: internationalNumber,
        network: provider,
        amount: Number(amount).toFixed(2),
        token,
        type: "single",
      };
    } else {
      payload = {
        content,
        token,
        type: "bulk",
      };
    }

    Swal.fire({
      title: "Processing",
      text: `Proceed with transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(payload, {
          onSettled: () => {
            setToken("");
            queryClient.invalidateQueries(["agent-airtime-transactions"]);
            queryClient.invalidateQueries(["wallet-balance"]);
            queryClient.invalidateQueries(["notifications"]);
          },
          onSuccess: (data) => {
            handleClearFields();

            Swal.fire({
              icon: "success",
              title: "Transaction Successful",
              text: data || "Transaction Completed!",
              showCancelButton: false,
            });
            // customDispatch(
            //   globalAlertType("info", data || "Transaction Completed!")
            // );

            setSearchParams((params) => {
              params.delete("data");
              params.delete("airtime-prompt");
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

  const handleClearFields = () => {
    setPhoneNumber("");
    setConfirmPhoneNumber("");
    setProvider("");
    setAmount("");
    setToken("");
    setFailCount(3);
    setToken("");
    setContent([]);
    setShowPinPage();
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("airtime-prompt"))}
      maxWidth={
        showPinPage
          ? "xs"
          : tab ===
            "ab1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
          ? "sm"
          : "md"
      }
      fullWidth
    >
      <CustomDialogTitle
        title={showPinPage ? "Confirm Pin" : "New Transfer"}
        subtitle="Transfer airtime to all networks with ease"
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
          <TabContext value={tab}>
            <TabList centered onChange={(e, value) => setTab(value)}>
              <Tab
                value="ab1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
                label="Airtime"
                style={{ width: "50%" }}
              />
              <Tab
                value="bc458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
                label="Bulk"
                style={{ width: "50%" }}
              />
            </TabList>

            <TabPanel
              value="ab1bb991cea626082307742d77772268dbf4d9c5194b8bc5d09c81a5fc0a5ce5"
              sx={{ px: 0 }}
            >
              <Box
                sx={{
                  py: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  // boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
                  // borderRadius: 2,
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

                <TextField
                  size="small"
                  type="number"
                  inputMode="numeric"
                  placeholder="Amount"
                  label="Top Up Amount"
                  fullWidth
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">GH¢</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">p</InputAdornment>
                    ),
                    readOnly: searchParams.get("type") === "Bundle",
                    style: { fontWeight: "bold" },
                  }}
                  value={amount}
                  focused
                  onChange={(e) => setAmount(e.target.value)}
                  error={Boolean(amountErr)}
                  helperText={amountErr}
                />

                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                  onClick={handleSubmit}
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                >
                  Proceed
                </LoadingButton>
              </Box>
            </TabPanel>
            <TabPanel
              value="bc458dd2cf0e7223a51319f98cc8e2c8ea27d6dc66e048cd1b4434f6aae90fc2a"
              sx={{ px: 0 }}
            >
              {contentErr && <Alert severity="error">{contentErr}</Alert>}
              <Box
                sx={{
                  py: 2,
                }}
              >
                <Typography>
                  Load your transfer data from an excel or csv file. Columns
                  should be labeled as follows:
                  <br />
                  <br />
                  <div style={{ display: "flex", gap: "16px" }}>
                    <b style={{ color: "blue" }}>1. RECIPIENT</b>
                    <b style={{ color: "blue" }}>2. AMOUNT</b>
                  </div>
                </Typography>
                <Stack spacing={1} pb={2} width="100%">
                  <Input
                    accept=".xlsx,.xls,.csv"
                    type="file"
                    id="pins"
                    name="pins"
                    onChange={handleLoadFile}
                    onClick={(e) => {
                      e.target.value = null;
                      e.currentTarget.value = null;
                    }}
                    sx={{
                      visibility: "collapse",
                    }}
                  />

                  <Stack direction="row" spacing={3} py={1}>
                    <InputLabel sx={{ alignSelf: "flex-start" }}>
                      Add EXCEL or CSV file
                    </InputLabel>
                    <a
                      style={{
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                      onClick={downloadAirtimeTemplate}
                    >
                      Download here
                    </a>
                  </Stack>
                  <Input
                    accept=".xlsx,.xls,.csv"
                    type="file"
                    fullWidth
                    onChange={handleLoadFile}
                    onClick={(e) => {
                      e.target.value = null;
                      e.currentTarget.value = null;
                    }}
                  />
                  <small>e.g. *.csv,*.xlsx</small>

                  <TextField
                    label="File Name"
                    id="browse"
                    placeholder="Load Data Here"
                    size="small"
                    value={dataPath}
                    fullWidth
                  />
                </Stack>
                {content?.length > 0 && (
                  <List
                    sx={{
                      height: 300,
                      my: 2,
                      borderRadius: 1,
                      overflowY: "auto",
                      border: "1px solid lightgray",
                      width: "100%",
                    }}
                  >
                    <ListItem>
                      <ListItemText primary="Number" />
                      <ListItemText primary="Amount" />
                    </ListItem>
                    {content?.map((item) => {
                      return (
                        <ListItem key={item?.number}>
                          <ListItemText secondary={item?.recipient} />
                          <ListItemText
                            secondaryTypographyProps={{
                              color:
                                Number(item?.amount) < 1
                                  ? "error"
                                  : "info.main",
                            }}
                            secondary={currencyFormatter(item?.amount)}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                )}

                <LoadingButton
                  type="submit"
                  variant="contained"
                  disabled={content?.length === 0}
                  onClick={handleSubmitBulkAirtime}
                  fullWidth
                  size="small"
                >
                  Proceed
                </LoadingButton>
              </Box>
            </TabPanel>
          </TabContext>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NewTransfer;
