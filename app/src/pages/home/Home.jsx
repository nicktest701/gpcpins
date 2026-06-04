import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, IconButton, Box, Button,useTheme,useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Service from "./Service";
import HomeSwiper from "./HomeSwiper";
import Organization from "./Organization";
import Contact from "./Contact";
import Trip from "./Trip";
import About from "./About";
import Community from "./Community";
import AnimatedWrapper from "../../components/animations/AnimatedWrapper";
import RetrieveVoucher from "../evoucher/RetrieveVoucher";
import QRCode from "./QRCode";
import { IMAGES } from "../../constants";
import { Link } from "react-router-dom";

// Custom styles for modal (replace with your own CSS or use sx)
const modalStyles = {
  "& .MuiDialog-paper": {
    maxWidth: "800px",
    width: "90%",
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
  },
  "& .MuiDialogContent-root": {
    padding: "24px",
  },
};

function Home() {
  const [showAdModal, setShowAdModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // or "sm"

  // Check sessionStorage on mount
  useEffect(() => {
    const isModalClosedInSession = sessionStorage.getItem("adModalClosed");
    if (!isModalClosedInSession) {
      setShowAdModal(true);
    }
  }, []);

  const handleCloseAdModal = () => {
    setShowAdModal(false);
    sessionStorage.setItem("adModalClosed", "true");
  };

  // Example multimedia content – you can replace with any media
  const advertisementContent = (
    <Box sx={{ textAlign: "center" }}>
      {/* Image example */}
      <img
        src={IMAGES.waec2}
        alt="Advertisement"
        style={{
          width: "100%",
          height: isMobile ? "150px" : "200px",
          objectFit: "contain",
          borderRadius: "8px",
          marginBottom: "16px",
        }}
      />
      {/* Video example (uncomment if needed) */}
      {/* <video controls style={{ width: "100%", marginBottom: "16px" }}>
        <source src="your-video-url.mp4" type="video/mp4" />
      </video> */}
      {/* Iframe example */}
      {/* <iframe
        src="https://www.youtube.com/embed/dQw4w9WgXcQ"
        title="Ad video"
        frameBorder="0"
        allowFullScreen
        style={{ width: "100%", height: "315px", marginBottom: "16px" }}
      ></iframe> */}
      <h2 style={{ marginBottom: "8px" }}>WAEC & SHS PLACEMENT CHECKERS</h2>
      <p>Buy WAEC and School Placement Checkers</p>
      <Link
        to="/evoucher/waec-checker"
        variant="contained"
        onClick={handleCloseAdModal}
        sx={{ textTransform: "none" }}
      >
        Buy Now
      </Link>
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>
          Gab Powerful Consult | Buy Vouchers, Tickets, and Prepaid Units
        </title>
        <meta
          name="description"
          content="Buy WAEC and School Placement Checkers with ease and just a single click."
        />
      </Helmet>

      <div className="dashboard">
        <HomeSwiper />
        <About />
        <Service />
        <Trip />
        <Organization />
        <QRCode />
        <Contact />
        <Community />
        <AnimatedWrapper>
          <RetrieveVoucher general={true} />
        </AnimatedWrapper>
      </div>

      {/* Advertising Modal */}
      <Dialog
        open={showAdModal}
        onClose={handleCloseAdModal}
        sx={modalStyles}
        disableEscapeKeyDown={false} // allow ESC to close
        BackdropProps={{
          style: { backgroundColor: "rgba(0, 0, 0, 0.6)" },
        }}
      >
        {/* Custom close button inside the dialog */}
        <IconButton
          aria-label="close"
          onClick={handleCloseAdModal}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            zIndex: 1,
            backgroundColor: "rgba(255,255,255,0.8)",
            "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <DialogContent dividers={false}>
          {advertisementContent}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleCloseAdModal}
              sx={{ textTransform: "none" }}
            >
              Close
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Home;
