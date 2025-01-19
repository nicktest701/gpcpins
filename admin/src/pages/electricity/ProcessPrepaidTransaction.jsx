import { useContext } from "react";
import {
  Button,
  DialogActions,
  Stack,
  TextField,
  Divider,
  Chip,
  Box,
  InputLabel,
  Typography,
  IconButton,
} from "@mui/material";
import moment from "moment";
import LoadingButton from "@mui/lab/LoadingButton";
import { Formik } from "formik";
import Swal from "sweetalert2";
import { CustomContext } from "../../context/providers/CustomProvider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getElectricity, updateElectricityPayment } from "../../api/paymentAPI";
import { globalAlertType } from "../../components/alert/alertType";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import CheckOutItem from "../../components/items/CheckOutItem";
import { currencyFormatter } from "../../constants";
import { useEffect } from "react";
import { ArrowBack } from "@mui/icons-material";
import CustomTitle from "../../components/custom/CustomTitle";
import { processPrepaidValidationSchema } from "../../config/validationSchema";
import CustomFormControl from "../../components/inputs/CustomFormControl";

const ProcessPrepaidTransaction = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { customDispatch } = useContext(CustomContext);
  const [searchParams] = useSearchParams();

  const {
    data: { info, ...rest },
    isLoading: isTransactionLoading,
  } = useQuery({
    queryKey: ["electricity-transaction", searchParams?.get("row_id")],
    queryFn: () => getElectricity(searchParams?.get("row_id")),
    enabled: !!searchParams?.get("row_id"),
    initialData:
      queryClient
        .getQueryData(["ecg-transactions"])
        ?.find(
          (transaction) => transaction?._id === searchParams?.get("row_id")
        ) ?? {},
  });

  const initialValues = {
    receipt: null,
    orderNo: "",
    confirmOrderNo: "",
    paymentId: "",
    confirmPaymentId: "",
    lastCharge: "0",
    lastMonthConsumption: "0",
    geoCode: "0",
    ...info,
    ...rest,
  };

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

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: updateElectricityPayment,
  });
  const onSubmit = (values, options) => {
    // console.log(values);
    Swal.fire({
      title: "Processing Payment",
      text: `Proceed with transaction?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        // console.log(values);
        const updatedInfo = {
          _id: values._id,
          receipt: values.receipt,
          data: {
            meterId: values?.meterId,
            paymentId: values?.paymentId,

            meter: {
              number: values.number,
              geoCode: values.geoCode || 0,
              address: values.address,
              district: values.district,
              name: values.name,
            },
            info: {
              orderNo: values.orderNo,
              amount: values.amount,
              email: values.email,
              mobileNo: values.mobileNo,
              lastCharge: values.lastCharge,
              lastMonthConsumption: values.lastMonthConsumption,
            },
          },
        };
        // console.log(updatedInfo);

        mutateAsync(updatedInfo, {
          onSettled: () => {
            options.setSubmitting(false);
            queryClient.invalidateQueries(["ecg-transactions"]);
            queryClient.invalidateQueries(["electricity-transaction"]);
          },
          onSuccess: () => {
            customDispatch(globalAlertType("info", "Transaction Completed!"));
            handleClose();
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  const handleClose = () => {
    navigate("/electricity/transactions?YixHy=a34cdd3543&_pid=423423");
  };

  return (
    <>
      <Link to={"/electricity/transactions?YixHy=a34cdd3543&_pid=423423"}>
        <IconButton>
          <ArrowBack />
        </IconButton>
      </Link>
      <CustomTitle
        title={
          searchParams?.get("view_status")
            ? "Transaction Status"
            : "Process Prepaid Transaction"
        }
        subtitle={
          searchParams?.get("view_status")
            ? "Showing details of current transaction."
            : "Complete the payment process by filling the forms below."
        }
      />

      {isTransactionLoading && !rest?._id ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="spinner"></div>
        </Box>
      ) : (
        <>
          {rest !== undefined && rest?._id && (
            <>
              {searchParams?.get("view_status") ? (
                <>
                  <Stack rowGap={1} p={3}>
                    {info?.downloadLink && (
                      <Link
                        target="_blank"
                        to={info?.downloadLink}
                        style={{
                          alignSelf: "flex-end",
                          color: "#fff",
                          backgroundColor: "var(--primary)",
                          padding: "8px 12px",
                          borderRadius: "5px",
                        }}
                      >
                        View Receipt
                      </Link>
                    )}
                    <CheckOutItem title="Transaction No." value={rest._id} />
                    <CheckOutItem title="Order No." value={rest.paymentId} />
                    <CheckOutItem
                      title="Purchased On"
                      value={moment(rest?.createdAt).format("LLL")}
                    />
                    <CheckOutItem title="Meter No." value={rest?.number} />
                    <CheckOutItem title="Meter Name" value={rest?.name} />
                    <CheckOutItem title="SPN Number" value={rest?.spn} />
                    <CheckOutItem title="District" value={rest?.district} />
                    <CheckOutItem title="Payment Method" value={rest?.mode} />
                    <CheckOutItem
                      title="Top Up Amount"
                      value={currencyFormatter(rest?.topup)}
                    />
                    <CheckOutItem
                      title="Total Amount"
                      value={currencyFormatter(rest?.amount)}
                    />

                    {rest?.processed === 1 && (
                      <>
                        <CheckOutItem
                          title="Completed By"
                          value={rest?.issuerName || "N/A"}
                        />

                        <CheckOutItem
                          title="Completed on"
                          value={moment(rest?.updatedAt).format("LLL") || "N/A"}
                        />
                      </>
                    )}

                    <CheckOutItem
                      title="Transaction Token"
                      value={info?.orderNo}
                    />

                    <Divider flexItem>
                      <Chip
                        label={rest?.processed === 1 ? "Completed" : "Pending"}
                        sx={{
                          color: "white",
                          bgcolor:
                            rest?.processed === 1
                              ? "success.darker"
                              : "info.main",
                        }}
                      />
                    </Divider>
                  </Stack>
                </>
              ) : (
                <Formik
                  initialValues={initialValues}
                  onSubmit={onSubmit}
                  enableReinitialize={true}
                  validationSchema={processPrepaidValidationSchema}
                >
                  {({
                    touched,
                    errors,
                    setFieldValue,
                    handleSubmit,
                    getFieldProps,
                    values,
                  }) => {
                    return (
                      <>
                        <Stack rowGap={3} py={2}>
                          <div style={{ width: "100%" }}>
                            <label style={{ fontWeight: "bold" }}>
                              Meter Number
                            </label>
                            <TextField
                              size="small"
                              fullWidth
                              defaultValue={rest?.number}
                              value={values?.number}
                              aria-readonly
                              InputProps={{
                                readOnly: true,
                                style: {
                                  backgroundColor: "whitesmoke",
                                  color: "var(--primary)",
                                  fontWeight: "bold",
                                },
                              }}
                            />
                          </div>
                          <CustomFormControl>
                            <div style={{ width: "100%" }}>
                              <label style={{ fontWeight: "bold" }}>
                                Meter Name
                              </label>
                              <TextField
                                size="small"
                                fullWidth
                                defaultValue={rest?.name}
                                value={values?.name}
                                aria-readonly
                                InputProps={{
                                  readOnly: true,
                                  style: {
                                    backgroundColor: "whitesmoke",
                                  },
                                }}
                              />
                            </div>
                          </CustomFormControl>

                          <CustomFormControl>
                            <div style={{ width: "100%" }}>
                              <label style={{ fontWeight: "bold" }}>
                                SPN Number
                              </label>
                              <TextField
                                size="small"
                                fullWidth
                                defaultValue={rest?.spn}
                                value={values?.spn}
                                aria-readonly
                                InputProps={{
                                  readOnly: true,
                                  style: {
                                    backgroundColor: "whitesmoke",
                                  },
                                }}
                              />
                            </div>
                            <div style={{ width: "100%" }}>
                              <label style={{ fontWeight: "bold" }}>
                                Amount
                              </label>
                              <TextField
                                size="small"
                                fullWidth
                                defaultValue={currencyFormatter(rest?.topup)}
                                value={currencyFormatter(values?.topup)}
                                aria-readonly
                                InputProps={{
                                  readOnly: true,
                                  style: {
                                    backgroundColor: "whitesmoke",
                                    color: "green",
                                    fontWeight: "bold",
                                  },
                                }}
                              />
                            </div>
                          </CustomFormControl>

                          <TextField
                            size="small"
                            label="Transaction Token"
                            required
                            fullWidth
                            {...getFieldProps("orderNo")}
                            error={Boolean(touched.orderNo && errors.orderNo)}
                            helperText={touched.orderNo && errors.orderNo}
                          />
                          <TextField
                            size="small"
                            label="Confirm Transaction Token"
                            required
                            fullWidth
                            {...getFieldProps("confirmOrderNo")}
                            error={Boolean(
                              touched.confirmOrderNo && errors.confirmOrderNo
                            )}
                            helperText={
                              touched.confirmOrderNo && errors.confirmOrderNo
                            }
                          />
                          <TextField
                            size="small"
                            label="Order ID"
                            required
                            fullWidth
                            {...getFieldProps("paymentId")}
                            error={Boolean(
                              touched.paymentId && errors.paymentId
                            )}
                            helperText={touched.paymentId && errors.paymentId}
                          />
                          <TextField
                            size="small"
                            label="Confirm Order ID"
                            required
                            fullWidth
                            {...getFieldProps("confirmPaymentId")}
                            error={Boolean(
                              touched.confirmPaymentId &&
                                errors.confirmPaymentId
                            )}
                            helperText={
                              touched.confirmPaymentId &&
                              errors.confirmPaymentId
                            }
                          />
                          <Stack pb={4} spacing={1} width="100%">
                            <InputLabel sx={{ alignSelf: "flex-start" }}>
                              Copy of Receipt
                            </InputLabel>
                            <Typography fontSize={14} fontWeight="bold">
                              Add a screenshot or a copy of your transaction
                              receipt
                            </Typography>
                            {touched.receipt && errors.receipt && (
                              <small style={{ color: "#B72136" }}>
                                {errors.receipt}
                              </small>
                            )}
                            <input
                              type="file"
                              // fullWidth
                              accept="image/*"
                              onChange={(e) =>
                                setFieldValue("receipt", e.target.files[0])
                              }
                            />
                          </Stack>
                        </Stack>

                        <DialogActions sx={{ p: 4 }}>
                          <Link to={-1}>
                            <Button>Cancel</Button>
                          </Link>
                          <LoadingButton
                            variant="contained"
                            loading={isLoading}
                            onClick={handleSubmit}
                          >
                            Proceed
                          </LoadingButton>
                        </DialogActions>
                      </>
                    );
                  }}
                </Formik>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ProcessPrepaidTransaction;
