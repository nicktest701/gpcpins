import { useState, useContext } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Swal from "sweetalert2";
import FormLabel from "@mui/material/FormLabel";
import Input from "@mui/material/Input";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import _ from "lodash";
import { CustomContext } from "../../context/providers/CustomProvider";
import PreviewChecker from "./PreviewChecker";
import LoadingButton from "@mui/lab/LoadingButton";
import CheckerTable from "../tables/CheckerTable";
import { addVoucher } from "../../api/voucherAPI";
import { readXLSX } from "../../config/readXLSX";
import { readCSV } from "../../config/readCSV";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { globalAlertType } from "../alert/alertType";
import CustomDialogTitle from "../dialogs/CustomDialogTitle";
import { Container, useTheme } from "@mui/material";
import { getCategory } from "../../api/categoryAPI";
import { useParams, useSearchParams } from "react-router-dom";
import CustomTitle from "../custom/CustomTitle";
import GlobalSpinner from "../spinners/GlobalSpinner";

const CSV_FILE_TYPE = "text/csv";
const XLSX_FILE_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const XLS_FILE_TYPE = "application/vnd.ms-excel";

const LoadChecker = ({ open, setOpen }) => {
  const { palette } = useTheme();
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingPins, setLoadingPins] = useState(false);

  const queryClient = useQueryClient();
  const {
    customState: { newCheckers, ticketDetails },
    customDispatch,
  } = useContext(CustomContext);

  const [alertErr, setAlertErr] = useState({
    severity: "",
    msg: "",
  });

  const categoryDetails = useQuery({
    queryKey: ["category-details", searchParams.get("_pid")],
    queryFn: () => getCategory(searchParams.get("_pid")),
    enabled: !!searchParams.get("_pid"),
  });

  //LOAD Checkers from file excel,csv
  function handleLoadFile(e) {
    const files = e.target.files[0];
    setLoadingPins(true);

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

        if (checkers?.length !== 0) {
          if (category === "bus") {
            const slicedCheckers = checkers.slice(0, ticketDetails?.noOfSeats);

            const newCheckers = slicedCheckers?.map((checker, index) => {
              return {
                category: categoryDetails?.data?._id,
                voucherType: categoryDetails?.data?.voucherType,
                ...checker,
                type: index + 1,
                details: {
                  seatNo: index + 1,
                },
              };
            });

            customDispatch({
              type: "loadedChecker",
              payload: {
                meta: _.uniq(newCheckers?.flatMap(Object.keys)),
                data: newCheckers,
              },
            });
          } else if (["cinema", "stadium"].includes(category)) {
            const slicedCheckers = checkers.slice(0, ticketDetails?.quantity);
            const duplicates = ticketDetails.duplicates;

            const newCheckers = slicedCheckers?.map((checker, index) => {
              return {
                ...checker,
                category: categoryDetails?.data?._id,
                voucherType: categoryDetails?.data?.voucherType,
                type: duplicates[index],
                details: {
                  type: duplicates[index],
                },
              };
            });

            customDispatch({
              type: "loadedChecker",
              payload: {
                meta: _.uniq(newCheckers?.flatMap(Object.keys)),
                data: newCheckers,
              },
            });
          } else {
            const newCheckers = checkers?.map((checker) => {
              return {
                ...checker,
                category: categoryDetails?.data?._id,
                voucherType: categoryDetails?.data?.voucherType,
              };
            });

            customDispatch({
              type: "loadedChecker",
              payload: {
                meta: _.uniq(checkers?.flatMap(Object.keys)),
                data: newCheckers,
              },
            });
          }

          handleOpenPreviewChecker(files.name);
        }
      };
    } catch (error) {
      customDispatch(globalAlertType("error", error));
    } finally {
      setLoadingPins(false);
    }
  }

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: addVoucher,
  });

  const handleSubmitPins = async () => {
    Swal.fire({
      title: "Saving",
      text: "Proceed to save pins & serials?",
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(newCheckers, {
          onSettled: () => {
            queryClient.invalidateQueries(["voucher"]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            handleRemovePath();
            customDispatch({ type: "newCheckers", payload: [] });
            setOpen(false);
            localStorage.removeItem("@gab_jauWgsWOx");
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const handleCancelSubmitPins = () => {
    Swal.fire({
      title: "Exiting",
      text: "Do you want to exit?",
      confirmButtonColor: palette.primary.main,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        handleRemovePath();
        customDispatch({ type: "newCheckers", payload: [] });
        setOpen(false);
      }
    });
  };

  const handleOpenPreviewChecker = (path) => {
    setSearchParams((params) => {
      params.set("preview", "true");
      params.set("data_path", path);
      return params;
    });
  };

  const handleRemovePath = () => {
    setSearchParams((params) => {
      params.delete("data_path");
      return params;
    });
  };

  return (
    <Dialog maxWidth="lg" fullWidth fullScreen open={open}>
      <CustomDialogTitle onClose={handleCancelSubmitPins} />

      {newCheckers?.length !== 0 && (
        <DialogActions sx={{ paddingX: 5 }}>
          <Button disabled={isLoading} onClick={handleCancelSubmitPins}>
            Cancel
          </Button>
          <LoadingButton
            loading={isLoading}
            variant="contained"
            onClick={handleSubmitPins}
          >
            {isLoading ? "Please Wait..." : "Save Pins & Serials"}
          </LoadingButton>
        </DialogActions>
      )}

      <DialogContent sx={{ position: "relative" }}>
        {categoryDetails?.isLoading ? (
          <Stack>
            <Typography>Please wait..</Typography>
          </Stack>
        ) : categoryDetails?.isError ? (
          <Typography>An unknown error has occured</Typography>
        ) : (
          <Container sx={{ py: 4 }}>
            <CustomTitle
              title="PINS & SERIALS"
              subtitle={
                newCheckers?.length === 0
                  ? " Please select your file (CSV or Excel),by clicking on 'Load pins & serials' to complete the process."
                  : "Loaded Pins and Serials"
              }
            />

            {newCheckers?.length === 0 && (
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} py={2}>
                <TextField
                  fullWidth
                  label="Type"
                  id="type"
                  size="small"
                  value={categoryDetails?.data?.voucherType || "F"}
                  inputProps={{
                    readOnly: true,
                    color: "primary",
                    style: {
                      color: "green",
                      fontWeight: "bold",
                    },
                  }}
                  InputProps={{
                    sx: { padding: "6px" },
                  }}
                />
                <Stack spacing={2} width="100%">
                  <TextField
                    label="File"
                    id="browse"
                    placeholder="Load Data Here"
                    size="small"
                    value={searchParams.get("data_path") ?? ""}
                    fullWidth
                    helperText="e.g. *.csv,*.xlsx"
                    InputProps={{
                      sx: { padding: "6px" },
                    }}
                  />

                  <div>
                    <FormLabel
                      htmlFor="pins"
                      sx={{
                        bgcolor: "primary.main",
                        color: "white",
                        cursor: "pointer",
                        padding: "15px 20px",
                        borderRadius: 1,
                        alignSelf: "flex-start",
                        whiteSpace: "nowrap",
                        "&:hover": {
                          bgcolor: "primary.dark",
                        },
                      }}
                      title="Load Data from file"
                      style={{ color: "#fff" }}
                    >
                      Load Pins & Serials
                    </FormLabel>
                    <Input
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
                  </div>
                </Stack>
              </Stack>
            )}

            {/* Preview */}
            {alertErr.msg && (
              <Alert
                severity={alertErr.severity}
                onClose={() => setAlertErr({ msg: "" })}
              >
                {alertErr.msg}
              </Alert>
            )}

            {newCheckers?.length !== 0 && (
              <CheckerTable
                title={
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      color: "secondary.main",
                      fontWeight: "600",
                    }}
                  >
                    {categoryDetails?.data?.voucherType} Serials & Pincodes
                  </Typography>
                }
              />
            )}

            <PreviewChecker />
          </Container>
        )}
        {loadingPins && <GlobalSpinner />}
      </DialogContent>
    </Dialog>
  );
};

export default LoadChecker;
