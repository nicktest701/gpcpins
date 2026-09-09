import Footer from "./Footer";
import Header from "./Header";
import Main from "./Main";
import { Box, IconButton } from "@mui/material";
import { ArrowUpwardSharp } from "@mui/icons-material";
import BottomNav from "./BottomNav";
import ComplaintModal from "../../components/modals/ComplaintModal";
import { useEffect, useState } from "react";

function Layout() {
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Optional: animated scroll
    });
  };

  // const handleMinimize = () => {
  //   tawkMessengerRef.current.minimize();
  // };
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100svh",
        }}
      >
        <Header />

        <Main />
        <Footer />
      </Box>

      <BottomNav />

      {/* <TicketPaymentDetails /> */}
      {showScrollToTop && (
        <IconButton onClick={handleScrollToTop} className="scroll-to-top-button">
          <ArrowUpwardSharp sx={{ fontSize: "1.1rem" }} />
        </IconButton>
      )}
          {/* <ComplaintModal
              buttonVariant="fab"
              buttonText="Complaint form"
             
            /> */}
    </>
  );
}

export default Layout;
