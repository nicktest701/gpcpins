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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSearchParams, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { Formik } from "formik";
import Swal from "sweetalert2";
import { addWalletValidationSchema } from "../../../config/validationSchema";
import { topUpWallet } from "../../../api/transactionAPI";
import { CustomContext } from "../../../context/providers/CustomProvider";
import { globalAlertType } from "../../../components/alert/alertType";

function AddMoney() {
  const { customDispatch } = useContext(CustomContext);
  const queryClient = useQueryClient();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const handleClose = () => {
    Swal.fire({
      title: "Loading Wallet",
      text: `Do you want to cancel loading of agent wallet?`,
      showCancelButton: true,
    }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        setSearchParams((params) => {
          params.delete("add-money");
          return params;
        });
      }
    });
  };

  const initiaValues = {
    id,
    comment: "",
    amount: 0,
    attachment: null,
    type: "agent",
  };

  const { mutateAsync, isLoading } = useMutation({
    mutationFn: topUpWallet,
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
            queryClient.invalidateQueries(["agent_wallet_transactions", id]);
            queryClient.invalidateQueries(["agent", id]);
          },
          onSuccess: (data) => {
            customDispatch(globalAlertType("info", data));
            setSearchParams((params) => {
              params.delete("add-money");
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
      open={Boolean(searchParams.get("add-money"))}
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
            <DialogContent sx={{ px: 1 }}>
              <Container
                sx={{
                  py: 4,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
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
              </Container>
            </DialogContent>
          );
        }}
      </Formik>
    </Dialog>
  );
}

export default AddMoney;
