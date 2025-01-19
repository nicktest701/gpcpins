import { Box, Typography, Button, Stack } from "@mui/material";

function Download() {
  const handleDownload = (fileName) => {
    const link = document.createElement("a");
    link.href = `https://gpcpins.com/downloads/apps/${fileName}.apk`;
    link.target = "_blank";
    link.download = `${fileName}.apk`; // You can set the desired file name here
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 4,
      }}
    >
      {/* App */}
      <Stack
        mt={6}
        alignItems="center"
        spacing={4}
        border="1px solid #ccc"
        p={4}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Voucher & Ticketing
        </Typography>

        <Typography variant="body2">
          Access, redeem, and manage your vouchers securely. Stay updated with
          the latest deals and offers anytime, anywhere.
        </Typography>

        <img
          src="/images/gpcpins.png" // replace with the correct path or URL of your QR code image
          alt="Ticketing App QR Code"
          style={{
            objectFit: "contain",
            width: "150px",
            height: "150px",
          }}
        />
        <small> Scan to download</small>
        <Button
          variant="contained"
          sx={{ textTransform: "lowercase" }}
          onClick={() => handleDownload("gpcpins")}
        >
          Download (.apk)
        </Button>
      </Stack>
      {/* Verifcation */}
      <Stack
        mt={6}
        alignItems="center"
        spacing={4}
        border="1px solid #ccc"
        p={4}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Verification
        </Typography>

        <Typography variant="body2">
          Scan and validate tickets or vouchers instantly. Ensure secure and
          seamless verification at events or for purchases.
        </Typography>

        <img
          src="/images/verification.png" // replace with the correct path or URL of your QR code image
          alt="Verifcation App QR Code"
          style={{
            objectFit: "contain",
            width: "150px",
            height: "150px",
          }}
        />
        <small> Scan to download</small>
        <Button
          variant="contained"
          sx={{ textTransform: "lowercase" }}
          onClick={() => handleDownload("gpcscanner")}
        >
          Download (.apk)
        </Button>
      </Stack>
      {/* Agent App */}
      <Stack
        mt={6}
        alignItems="center"
        spacing={4}
        border="1px solid #ccc"
        p={4}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
          Agent
        </Typography>

        <Typography variant="body2">
          Sell airtime and data bundle, track sales in real-time, and manage
          customer interactions efficiently with the Agent App.
        </Typography>

        <img
          src="/images/agent.png" // replace with the correct path or URL of your QR code image
          alt="Agent App QR Code"
          style={{
            objectFit: "contain",
            width: "150px",
            height: "150px",
          }}
        />
        <small> Scan to download</small>
        <Button
          variant="contained"
          sx={{ textTransform: "lowercase" }}
          onClick={() => handleDownload("agent")}
        >
          Download (.apk)
        </Button>
      </Stack>
    </Box>
  );
}

export default Download;
