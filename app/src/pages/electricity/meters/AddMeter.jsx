import {
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useContext, useState } from "react";
import _ from "lodash";
import { CustomContext } from "../../../context/providers/CustomProvider";
import CustomDialogTitle from "../../../components/dialogs/CustomDialogTitle";
import { LoadingButton } from "@mui/lab";
import Transition from "../../../components/Transition";
import { Formik } from "formik";
import { prepaidMeterValidationSchema } from "../../../config/validationSchema";
import { AuthContext } from "../../../context/providers/AuthProvider";
import DOMPurify from "dompurify";

function AddMeter() {
  const { user } = useContext(AuthContext);

  const {
    customState: { addMeter },
    customDispatch,
  } = useContext(CustomContext);
  const [err, setErr] = useState("");

  const initialValues = {
    number: "",
    confirmNumber: "",
    SPNNumber: "",
    confirmSPNNumber: "",
    name: "",
    district: "ASHANTI REGION",
    type: "IMES",
  };

  const onSubmit = (values) => {
    setErr("");

    if (values.SPNNumber?.trim() !== values.confirmSPNNumber?.trim()) {
      setErr("SPN Numbers do not match");
      return;
    }

    const meterInfo = {
      user: user?.id,
      number: DOMPurify.sanitize(values?.number?.toUpperCase()),
      name: DOMPurify.sanitize(values?.name?.toUpperCase()),
      district: DOMPurify.sanitize(values?.district?.toUpperCase()),
      type: values?.type?.toUpperCase(),
      spn: values?.SPNNumber,
    };

    customDispatch({
      type: "openVerifyNewMeter",
      payload: {
        open: true,
        details: meterInfo,
      },
    });
    handleClose();
  };

  const handleClose = () =>
    customDispatch({
      type: "openAddMeter",
      payload: {
        open: false,
        details: {},
      },
    });
  return (
    <Dialog
      open={addMeter.open}
      maxWidth="xs"
      fullWidth
      TransitionComponent={Transition}
    >
      <CustomDialogTitle
        title={`New ${_.capitalize(addMeter?.type)} Meter`}
        onClose={handleClose}
      />
      <DialogContent sx={{ p: 2 }}>
        <Typography
          variant="h5"
          textAlign="center"
          color="error"
          fontStyle="italic"
        >
          Please Note!!!
        </Typography>
        <Typography
          variant="caption"
          sx={{ placeSelf: "self-start" }}
          textAlign='center'
          paragraph
        >
          Our prepaid electricity units are exclusively available to
              residents with{" "}
              <b>IMES</b> meter type. Please ensure your location eligibility
              before proceeding with any purchases. Thank you for your
              cooperation.
        </Typography>
        {/* <Typography variant="subtitle2" textAlign="center">
          Enter your meter details here
        </Typography> */}

        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          // enableReinitialize={true}
          validationSchema={prepaidMeterValidationSchema}
        >
          {({ errors, touched, handleSubmit, getFieldProps }) => {
            return (
              <Stack rowGap={2}>
                <TextField
                  id="number"
                  name="number"
                  size="small"
                  label="IMES Meter ID"
                  placeholder="e.g.Q788798766"
                  fullWidth
                  {...getFieldProps("number")}
                  error={Boolean(touched.number && errors.number)}
                  helperText={touched.number && errors.number}
                  inputProps={{
                    style: { textTransform: "uppercase" },
                  }}
                />
                <TextField
                  id="confirmNumber"
                  name="confirmNumber"
                  size="small"
                  label="Confirm Meter ID"
                  placeholder="e.g.Q788798766"
                  fullWidth
                  {...getFieldProps("confirmNumber")}
                  error={Boolean(touched.confirmNumber && errors.confirmNumber)}
                  helperText={touched.confirmNumber && errors.confirmNumber}
                  inputProps={{
                    style: { textTransform: "uppercase" },
                  }}
                />
                <TextField
                  id="SPNNumber"
                  name="SPNNumber"
                  size="small"
                  label="SPN Number(if any)"
                  placeholder="e.g.Q788798766"
                  fullWidth
                  {...getFieldProps("SPNNumber")}
                  error={Boolean(touched.SPNNumber && errors.SPNNumber)}
                  helperText={touched.SPNNumber && errors.SPNNumber}
                  inputProps={{
                    style: { textTransform: "uppercase" },
                  }}
                />
                <TextField
                  id="confirmSPNNumber"
                  name="confirmSPNNumber"
                  size="small"
                  label="Confirm SPN Number"
                  placeholder="e.g.Q788798766"
                  fullWidth
                  {...getFieldProps("confirmSPNNumber")}
                  error={err !== ""}
                  helperText={err}
                  inputProps={{
                    style: { textTransform: "uppercase" },
                  }}
                />

                <TextField
                  id="name"
                  name="name"
                  size="small"
                  label="Meter Name"
                  placeholder="Enter Meter Name here"
                  fullWidth
                  {...getFieldProps("name")}
                  error={Boolean(touched.name && errors.name)}
                  helperText={touched.name && errors.name}
                />
                <TextField
                  id="type"
                  name="type"
                  select
                  label="Prepaid Meter Type"
                  placeholder="Select Meter Type"
                  size="small"
                  fullWidth
                  {...getFieldProps("type")}
                  error={Boolean(touched.type && errors.type)}
                  helperText={touched.type && errors.type}
                >
                  <MenuItem value="IMES">IMES</MenuItem>
                </TextField>

                <TextField
                  id="district"
                  name="district"
                  select
                  label="Meter Location"
                  placeholder="Select Meter Location"
                  size="small"
                  fullWidth
                  {...getFieldProps("district")}
                  error={Boolean(touched.district && errors.district)}
                  helperText={touched.district && errors.district}
                >
                  {/* <MenuItem value="MENHYIA NORTH,ASHANTI">
                    MENHYIA NORTH,ASHANTI
                  </MenuItem>
                  <MenuItem value="MENHYIA SOUTH,ASHANTI">
                    MENHYIA SOUTH,ASHANTI
                  </MenuItem> */}
                  <MenuItem value="ASHANTI REGION">
                        ASHANTI REGION
                      </MenuItem>
                </TextField>

                <LoadingButton
                  // color='secondary'
                  variant="contained"
                  fullWidth
                  onClick={handleSubmit}
                >
                  Verify
                </LoadingButton>
              </Stack>
            );
          }}
        </Formik>
      </DialogContent>
    </Dialog>
  );
}

export default AddMeter;
