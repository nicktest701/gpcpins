import { FindInPageRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Container, TextField, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RetrieveVoucher = ({ general }) => {
  const { palette } = useTheme();
  const navigate = useNavigate();

  const [transactionId, setTransactionId] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [idErr, setIdErr] = useState("");
  const [mobileNoErr, setMobileNoErr] = useState("");

  const handleLostVoucher = () => {
    setIdErr("");
    setMobileNoErr("");

    if (transactionId.trim() === "") {
      setIdErr("Required*");
      return;
    }
    if (mobileNo.trim() === "") {
      setMobileNoErr("Required*");
      return;
    }
    if (!/^(\+\d{1,3})?\(?\d{3}\)?\d{3}\d{4}$/.test(mobileNo)) {
      setMobileNoErr("Invalid Mobile No");
      return;
    }

    navigate(`/evoucher/retrieve`, {
      state: {
        mobileNo,
        id: transactionId,
        general,
      },
    });
  };

  return (
    <div id="lost">
      <Container
        sx={{
          color: "#fff",
          bgcolor: general ? "secondary.main" : "rgba(51,51,51,0.4)",
          borderRadius: general ? 0 : 1,
          px: 2,
          py: 4,
          mb: 4,
        }}
      >
        <Typography variant="h5" paragraph textAlign="center">
          {general
            ? "Find Your Transaction Details"
            : "Retrieve Lost Vouchers & Tickets"}
        </Typography>

        <Typography variant="body2" paragraph>
          You can retrieve details of your{" "}
          {general ? "transaction" : "vouchers and tickets"} with your
          <span style={{ color: palette.primary.dark }}> TRANSACTION ID / EXTERNAL TRANSACTION ID </span>
          and the registered{" "}
          <span style={{ color: palette.primary.dark }}>
            TELEPHONE NUMBER{" "}
          </span>{" "}
          which you used at the time of purchase. If you don’t have these
          details, please contact us on customer service for assistance. Please
          do not share any other personal information as it may be misused.
        </Typography>

        <TextField
          placeholder="Transaction ID OR External Transaction ID"
          fullWidth
          size="small"
          error={idErr !== "" ? true : false}
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          margin="dense"
          helperText={idErr !== "" ? idErr : ""}
          InputProps={{
            sx: {
              borderRadius: 1,
              backgroundColor: "#fff",
            },
          }}
        />

        <TextField
          placeholder="Telephone Number"
          fullWidth
          size="small"
          value={mobileNo}
          error={mobileNoErr !== ""}
          onChange={(e) => setMobileNo(e.target.value)}
          helperText={mobileNoErr !== "" ? mobileNoErr : ""}
          margin="dense"
        
          InputProps={{
            sx: {
              borderRadius: 1,
              backgroundColor: "#fff",
            },
          }}
        />
        <LoadingButton
          variant="contained"
          size="large"
          color={general ? "primary" : "secondary"}
          fullWidth
          endIcon={<FindInPageRounded />}
          onClick={handleLostVoucher}
          sx={{ mt: 2 }}
        >
          Find 
        </LoadingButton>
      </Container>
    </div>
  );
};

export default RetrieveVoucher;
