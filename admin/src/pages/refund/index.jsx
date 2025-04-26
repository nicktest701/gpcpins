import {
  DialogActions,
  Divider,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import moment from "moment";
import Swal from "sweetalert2";
import CustomTitle from "@/components/custom/CustomTitle";
import CustomFormControl from "@/components/inputs/CustomFormControl";
import { LoadingButton } from "@mui/lab";
import { Formik } from "formik";
import { useMutation } from "@tanstack/react-query";
import { getRefundTransaction, refundTransaction } from "@/api/transactionAPI";
import { currencyFormatter } from "@/constants";
import { useContext, useState } from "react";
import { globalAlertType } from "@/components/alert/alertType";
import { CustomContext } from "@/context/providers/CustomProvider";
import GlobalSpinner from "@/components/spinners/GlobalSpinner";
import LoadingSpinner from "@/components/spinners/LoadingSpinner";
import { refundValidationSchema } from "@/config/validationSchema";

function Refund() {
  const { customDispatch } = useContext(CustomContext);
  const [category, setCategory] = useState("");
  const [id, setId] = useState("");
  const [amount, setAmount] = useState(0);
  const [amountErr, setAmountErr] = useState("");
  const initialValues = {
    category,
    id,
  };

  const { data, isError, error, isSuccess, mutateAsync, isLoading } =
    useMutation({
      mutationFn: getRefundTransaction,
    });

  const onSubmit = (values, options) => {
    mutateAsync(values, {
      onSettled: () => {
        options.setSubmitting(false);
      },
    });
  };

  const { mutateAsync: refundMutateAsync, isLoading: isRefunding } =
    useMutation({
      mutationFn: refundTransaction,
    });
  const proceedWithRefund = () => {
    setAmountErr("");

    if (Number(amount) <= 0) {

      setAmountErr("Amount should not be less than GHS 0.00");
      return;
    }
    if (Number(amount) >= data?.amount) {
      setAmountErr(
        `Amount should be less than or equal to amount paid (${currencyFormatter(
          data?.amount
        )})`
      );
      return;
    }

    Swal.fire({
      title: "Refund Money",
      text: `You are about to refund an amount of ${currencyFormatter(
        amount
      )}.Changes cannot be undone after completion.Proceed with refund?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        const payload = {
          id,
          category,
          amount,
          mode: data?.mode,
          email: data?.email,
          phonenumber: data?.phonenumber,
          user: data?.user,
          isAgent: data?.isAgent,
        };
        refundMutateAsync(payload, {
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            // customDispatch(
            //   globalAlertType(
            //     "info",
            //     data?.mode === "Wallet"
            //       ? "Transaction Refund Completed!"
            //       : "Transaction refund pending!."
            //   )
            // );
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  return (
    <>
      <CustomTitle
        title="Refund Money"
        subtitle="Manage and View history of all refund requests for customers"
      />

      <Formik
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
        validationSchema={refundValidationSchema}
      >
        {({ touched, errors, handleSubmit }) => {
          return (
            <>
              <Stack rowGap={3} p={2} my={2} bgcolor="#fff" borderRadius={1}>
                <Typography>
                  Begin refund process by selecting transaction type and
                  providing your transaction ID.
                </Typography>
                <CustomFormControl>
                  <div style={{ width: "100%" }}>
                    <label style={{ fontWeight: "bold", display: "block" }}>
                      Select Transaction Type
                    </label>
                    <TextField
                      select
                      size="small"
                      value={category}
                      fullWidth
                      onChange={(e) => setCategory(e.target.value)}
                      error={Boolean(touched.category && errors.category)}
                      helperText={touched.category && errors.category}
                    >
                      <MenuItem value="voucher">Vouchers</MenuItem>
                      <MenuItem value="ticket">Tickets</MenuItem>
                      <MenuItem value="prepaid">Prepaid Units </MenuItem>
                      <MenuItem value="airtime">Airtime Transfer </MenuItem>
                      <MenuItem value="bundle">Data Bundle </MenuItem>
                    </TextField>
                  </div>
                  <div style={{ width: "100%" }}>
                    <label style={{ fontWeight: "bold" }}>Transaction ID</label>
                    <TextField
                      size="small"
                      fullWidth
                      value={id}
                      onChange={(e) => setId(e.target.value)}
                      aria-readonly
                      InputProps={{
                        style: {
                          backgroundColor: "whitesmoke",
                        },
                      }}
                      error={Boolean(touched.id && errors.id)}
                      helperText={touched.id && errors.id}
                    />
                  </div>
                </CustomFormControl>

                <DialogActions>
                  <LoadingButton
                    variant="contained"
                    loading={isLoading}
                    onClick={handleSubmit}
                  >
                    Find Transaction
                  </LoadingButton>
                </DialogActions>
              </Stack>
            </>
          );
        }}
      </Formik>

      {isError && (
        <Stack>
          <Typography textAlign="center">{error}</Typography>
        </Stack>
      )}
      {isSuccess && data && (
        <>
          <Stack spacing={1} my={4} padding={2} bgcolor="#fff" borderRadius={2}>
            <Typography>
              Showing details of transaction awaiting refunding.
            </Typography>
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Transaction ID</Typography>
              <Typography>{data?._id}</Typography>
            </Stack>
            <Divider flexItem />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Payment Mode</Typography>
              <Typography>{data?.mode}</Typography>
            </Stack>
            <Divider flexItem />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Amount Paid</Typography>
              <Typography variant="h6" color="secondary">
                {currencyFormatter(data?.amount)}
              </Typography>
            </Stack>
            <Divider flexItem />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Email Address</Typography>
              <Typography>{data?.email}</Typography>
            </Stack>
            <Divider flexItem />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Phone Number</Typography>
              <Typography>{data?.phonenumber}</Typography>
            </Stack>
            <Divider flexItem />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Created On</Typography>
              <Typography>{moment(data?.updatedAt)?.format("LLL")}</Typography>
            </Stack>
            <Divider flexItem />
            <Stack
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              gap={2}
            >
              <Typography fontWeight="bold">Status</Typography>
              <Typography textTransform="capitalize">{data?.status}</Typography>
            </Stack>
          </Stack>

          <Typography variant="h6" color="secondary">
            Refund Process
          </Typography>
          <Typography>
            Complete the refund process by entering the amount you want to
            refund.
          </Typography>

          <CustomFormControl>
            <TextField
              variant="filled"
              type="number"
              inputMode="numeric"
              placeholder="Amount"
              label=" Amount to Refund"
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">GH¢</InputAdornment>
                ),
                endAdornment: <InputAdornment position="end">p</InputAdornment>,
              }}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={amountErr !== ""}
              helperText={amountErr}
            />

            <DialogActions>
              <LoadingButton
                variant="contained"
                loading={isRefunding}
                onClick={proceedWithRefund}
                style={{ minWidth: 300 }}
              >
                Refund
              </LoadingButton>
            </DialogActions>
          </CustomFormControl>
        </>
      )}

      {isRefunding && <GlobalSpinner />}
      {isLoading && <LoadingSpinner value="Please Wait..." />}
    </>
  );
}

export default Refund;
