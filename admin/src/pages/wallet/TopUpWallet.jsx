import { useContext } from "react";
import {
  Dialog,
  DialogContent,
  Container,
  TextField,
  InputAdornment,
  Input,
  InputLabel,
  Stack,
  Box,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Swal from "sweetalert2";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialogTitle from "../../components/dialogs/CustomDialogTitle";
import { Formik } from "formik";
import { addWalletValidationSchema } from "../../config/validationSchema";
import { CustomContext } from "../../context/providers/CustomProvider";
import { globalAlertType } from "../../components/alert/alertType";
import { topUpUserWallet } from "../../api/transactionAPI";

function TopUpWallet() {
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();

  const handleClose = () => {
    Swal.fire({
      title: "Loading Wallet",
      text: `Do you want to cancel loading of wallet?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setSearchParams((params) => {
          params.delete("rowID");
          params.delete("type");
          params.delete("top-up-money");
          return params;
        });
      }
    });
  };

  const initiaValues = {
    id: searchParams.get("rowID"),
    type: searchParams.get("type"),
    comment: "",
    amount: 0,
    attachment: null,
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: topUpUserWallet,
  });
  const onSubmit = (values) => {
    Swal.fire({
      title: "Loading Wallet",
      text: `Proceed with Top Up?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        mutateAsync(values, {
          onSettled: () => {
            queryClient.invalidateQueries("user_wallets");
            queryClient.invalidateQueries("agent_wallets");
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            setSearchParams((params) => {
              params.delete("rowID");
              params.delete("type");
              params.delete("top-up-money");
              return params;
            });
          },
          onError: (error) => {
            customDispatch(globalAlertType("error", error));
          },
        });
      }
    });
  };

  return (
    <Dialog
      open={Boolean(searchParams.get("top-up-money"))}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <CustomDialogTitle
        title="Load Wallet"
        subtitle="Top up your wallet"
        onClose={handleClose}
      />

      <Formik
        initialValues={initiaValues}
        onSubmit={onSubmit}
        enableReinitialize={true}
        validationSchema={addWalletValidationSchema}
      >
        {({
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => {
          return (
            <DialogContent>
              <Box
                sx={{
                  py: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  // boxShadow: "20px 20px 60px #d9d9d9,-20px -20px 60px #ffffff",
                  borderRadius: 2,
                }}
              >
                <TextField
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
                  }}
                  focused
                  value={values.amount}
                  onChange={handleChange("amount")}
                  onBlur={handleBlur("amount")}
                  error={Boolean(touched.amount && errors.amount)}
                  helperText={errors.amount}
                />
                <TextField
                  multiline
                  variant="outlined"
                  label="Comment"
                  fullWidth
                  required
                  value={values.comment}
                  handleBlur={handleBlur("comment")}
                  onChange={handleChange("comment")}
                  error={Boolean(touched.comment && errors.comment)}
                  helperText={errors.comment}
                  margin="dense"
                />

                <Stack pb={4} spacing={1} width="100%">
                  <InputLabel sx={{ alignSelf: "flex-start" }}>
                    Add An Attachment
                  </InputLabel>
                  <Input
                    type="file"
                    fullWidth
                    onChange={(e) =>
                      setFieldValue("attachment", e.target.files[0])
                    }
                  />
                </Stack>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isLoading}
                  onClick={handleSubmit}
                  fullWidth
                  size="large"
                >
                  Load Wallet
                </LoadingButton>
              </Box>
            </DialogContent>
          );
        }}
      </Formik>
    </Dialog>
  );
}

export default TopUpWallet;
