import { Box, Typography,  Container } from "@mui/material";

import AnimatedView from "../../components/animations/AnimatedView";
import MainTitle from "../../components/custom/MainTitle";
import Download from "../downloads/Download";

const QRCode = () => {
 
  return (
    <AnimatedView>
      <Container
        sx={{
          p: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 4,
          // bgcolor: "secondary.main",
          my: 10,
        }}
      >
        <Box spacing={2}>
          <MainTitle
            title="Download"
            titleColor="primary.main"
            subtitle="Our New Apps - Your Gateway to Seamless Voucher and Ticketing"
            align="center"
          />

          <Typography
            variant="body1"
            textAlign="center"
            color="textSecondary"
            paragraph
          >
            Get access to all our features on the go! Download our mobile app
            for a seamless experience, whether you&apos;re online or offline.
            Stay connected, manage your activities, and explore exclusive
            content available only on the app.
          </Typography>
        </Box>
        <Download />
      </Container>
    </AnimatedView>
  );
};

export default QRCode;
