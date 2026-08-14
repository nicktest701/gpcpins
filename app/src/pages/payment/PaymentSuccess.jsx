import { CheckRounded, ContentCopy } from "@mui/icons-material";
import success from "../../assets/images/success.png";
import { Alert, Avatar, Box, IconButton, InputAdornment, Paper, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function PaymentSuccess() {
  const { state } = useLocation();

  const [copied, setCopied] = useState(false);

  // Copy handler function using standard web API
  const handleCopyTransactionId = async () => {
    if (!state?.id) return;
    try {
      await navigator.clipboard.writeText(state.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset state after 2 seconds
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "1fr auto",
      }}
    >
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          rowGap: 1,
          textAlign: "center",
          minWidth: 300,
          height: 300,
          mx: "auto",
          placeSelf: "center",
          p: 2,
        }}
      >
        <Avatar
          src={success}
          sx={{
            width: 60,
            height: 60,
          }}
        />
        <Typography variant="h6">Success!</Typography>
        <Typography variant="h6" color="primary.main">
          Your request has been processed successfully.
        </Typography>
        <Typography variant="caption">
          You will be notify shortly after your transaction is completed.
        </Typography>
        <Typography variant="caption">Thank You!</Typography>
        {/* --- NEW COPY TO CLIPBOARD COMPONENT --- */}
        <Stack width="100%" maxWidth={400} spacing={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
          >
            Your Transaction ID Copy Code:
          </Typography>
          <TextField
            size="small"
            variant="outlined"
            readOnly
            value={state?.id}
            fullWidth
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                      onClick={handleCopyTransactionId}
                      edge="end"
                      color={copied ? "success" : "default"}
                    >
                      {copied ? <CheckRounded /> : <ContentCopy />}
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
              sx: { bgcolor: "action.hover", fontFamily: "monospace" },
            }}
          />
        </Stack>
        <Stack direction="row" spacing={2} mt={2}>
          <Link
            to={"/"}
            style={{
              textDecoration: "underline",
              color: "#031523",
              fontWeight: 500,
            }}
          >
            Home
          </Link>
        </Stack>
      </Paper>
      <Box sx={{ display: "grid", placeItems: "center", paddingY: 2 }}>
        <Typography variant="body2">
          Copyright &copy; {new Date().getFullYear()} | Gab Powerful Consult
        </Typography>
      </Box>
      <Alert
        variant="standard"
        severity="info"
        sx={{ borderRadius: 0, py: 1, fontSize: "12px" }}
      >
        You are recommended to keep a copy of your <b>TRANSACTION ID.</b>
      </Alert>
    </div>
  );
}

export default PaymentSuccess;
